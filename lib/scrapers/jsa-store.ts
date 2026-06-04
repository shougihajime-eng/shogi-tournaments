import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { extractPrefecture } from '@/lib/normalizers/region'
import { parseDate } from '@/lib/normalizers/date'

// 【臨時スクレイパー】2026-06-04〜
// 公式サイト www.shogi.or.jp がサーバー攻撃で停止中(503)のため、
// 日本将棋連盟オンラインストアの「大会申し込み」カテゴリから大会情報を取得する。
// 公式サイト復旧後に止めるときは lib/scrapers/index.ts の 'jsa-store' の行を外すだけでよい
// （既存の jsa-event / jsa-info / jsa-tournament は残してあるので、復旧すれば自動的に元へ戻る）。
export const SOURCE_URL = 'https://store.shogi.or.jp/view/category/tournament'
const ORIGIN = 'https://store.shogi.or.jp'
const SOURCE: 'jsa' = 'jsa'

// 詳細ページ取得の上限と間隔（ストアに負荷をかけない・cron の制限時間にも収める）
const MAX_DETAIL_PAGES = 30
const DETAIL_INTERVAL_MS = 700

export type StoreListEntry = {
  title: string
  detailUrl: string
  itemCode: string
}

export function parseList(html: string): StoreListEntry[] {
  const $ = cheerio.load(html)
  const byCode = new Map<string, StoreListEntry>()

  // ?category_page_id=tournament 付きリンクだけが大会一覧の商品。
  // (ページ上部の「寄付する」等も /view/item/ リンクなので、これで除外する)
  $('a[href*="/view/item/"][href*="category_page_id=tournament"]').each((_, el) => {
    const href = ($(el).attr('href') ?? '').trim()
    const m = href.match(/\/view\/item\/([0-9A-Za-z_-]+)/)
    if (!m) return
    const itemCode = m[1]
    const title = $(el).text().replace(/\s+/g, ' ').trim()
    const prev = byCode.get(itemCode)
    // 同じ商品にサムネイル用リンク等が複数あるため、いちばん文字数の多いテキストをタイトルに採用
    if (!prev || title.length > prev.title.length) {
      byCode.set(itemCode, {
        title: title || prev?.title || '',
        detailUrl: `${ORIGIN}/view/item/${itemCode}`,
        itemCode
      })
    }
  })

  return [...byCode.values()].filter(e => e.title)
}

export type StoreDetail = {
  description: string | null
  dateLine: string | null
  locationLine: string | null
  deadlineLine: string | null
  eligibilityLine: string | null
  contactEmail: string | null
}

// 説明文ラベルは「日　　程」「会　　場」のように全角空白入りで書かれる。
// NFKC 正規化で全角空白/全角コロンを半角化してから行単位で抽出する。
// 行頭にあるラベルだけを見る(^ + mフラグ)。文中の「…参加資格・重複購入にご注意…」等の誤マッチを防ぐ。
const LABEL_PREFIX = /^[ ・●○◆■]*/.source
const DATE_LINE = new RegExp(`${LABEL_PREFIX}(?:開催日|日\\s*程|日\\s*時)\\s*[:：]?\\s*([^\\n]+)`, 'm')
const PLACE_LINE = new RegExp(`${LABEL_PREFIX}(?:会\\s*場|場\\s*所|開催地)\\s*[:：]?\\s*([^\\n]+)`, 'm')
const DEADLINE_LINE = new RegExp(`${LABEL_PREFIX}(?:申込期間|申込締切|締切|締め切り)\\s*[:：]?\\s*([^\\n]+)`, 'm')
const ELIGIBILITY_LINE = new RegExp(`${LABEL_PREFIX}(?:参加資格|対\\s*象)\\s*[:：]?\\s*([^\\n]+)`, 'm')
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/

export function parseDetail(html: string): StoreDetail {
  const $ = cheerio.load(html)
  let container = $('.item-description')
  if (container.length === 0) container = $('#index-description')
  if (container.length === 0) container = $('body')

  // <br> と </p> を改行に変えてから文字だけ取り出す（cheerio の text() は <br> を消してしまうため）
  const rawHtml = container
    .map((_, el) => $(el).html() ?? '')
    .get()
    .join('\n')
  const text = cheerio
    .load(`<div>${rawHtml.replace(/<br[^>]*>/gi, '\n').replace(/<\/p>/gi, '\n')}</div>`)('div')
    .text()
    .normalize('NFKC')
    .replace(/[ \t]+/g, ' ')

  const pick = (re: RegExp): string | null => {
    const m = text.match(re)
    return m ? m[1].trim().replace(/\s+/g, ' ') || null : null
  }

  const description = text.replace(/\s+/g, ' ').trim().slice(0, 280) || null

  return {
    description,
    dateLine: pick(DATE_LINE),
    locationLine: pick(PLACE_LINE),
    deadlineLine: pick(DEADLINE_LINE),
    eligibilityLine: pick(ELIGIBILITY_LINE),
    contactEmail: text.match(EMAIL)?.[0] ?? null
  }
}

export function buildItem(entry: StoreListEntry, detail: StoreDetail): ScrapedTournament {
  // 開催日：説明文の「日程」行 → なければタイトル（例:【7月5日開催】）から拾う
  const parsedDate = detail.dateLine ? parseDate(detail.dateLine) : { start: null, end: null, text: '' }
  let startISO = parsedDate.start
  let endISO = parsedDate.end
  let dateText: string | null = parsedDate.text || detail.dateLine
  if (!startISO) {
    const fallback = parseDate(entry.title)
    if (fallback.start) {
      startISO = fallback.start
      endISO = endISO ?? fallback.end
      dateText = dateText ?? fallback.text
    }
  }

  // 申込締切：「申込期間 令和8年5月26日～6月26日」のような範囲は終わりの日が締切
  const parsedDeadline = detail.deadlineLine
    ? parseDate(detail.deadlineLine)
    : { start: null, end: null, text: '' }
  const deadline = parsedDeadline.end ?? parsedDeadline.start

  const prefecture = extractPrefecture(
    `${entry.title} ${detail.locationLine ?? ''} ${detail.description ?? ''}`
  )

  return {
    source: SOURCE,
    source_url: SOURCE_URL,
    external_id: makeId(entry.itemCode),
    title: entry.title,
    description: detail.description,
    event_date_text: dateText,
    event_date_start: startISO,
    event_date_end: endISO,
    location: detail.locationLine,
    prefecture,
    eligibility: detail.eligibilityLine,
    application_deadline: deadline,
    application_deadline_text: detail.deadlineLine,
    // ストアの商品ページがそのまま申込ページになっている
    application_url: entry.detailUrl,
    ticket_url: null,
    contact_email: detail.contactEmail,
    detail_url: entry.detailUrl
  }
}

export async function scrape(): Promise<ScrapedTournament[]> {
  const listHtml = await fetchHtml(SOURCE_URL)
  const entries = parseList(listHtml).slice(0, MAX_DETAIL_PAGES)
  const items: ScrapedTournament[] = []
  for (const entry of entries) {
    let detail: StoreDetail = {
      description: null,
      dateLine: null,
      locationLine: null,
      deadlineLine: null,
      eligibilityLine: null,
      contactEmail: null
    }
    try {
      detail = parseDetail(await fetchHtml(entry.detailUrl))
    } catch {
      // 詳細ページが読めなくても、一覧で分かる情報（タイトル・URL）だけで登録する
    }
    items.push(buildItem(entry, detail))
    await sleep(DETAIL_INTERVAL_MS)
  }
  return items
}

function makeId(itemCode: string): string {
  // ストアの商品コード（例: 000000003749）は安定しているので、これだけで一意にする
  return createHash('sha1').update(`jsa-store|${itemCode}`).digest('hex').slice(0, 16)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
