import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { parseDate } from '@/lib/normalizers/date'
import { extractPrefecture } from '@/lib/normalizers/region'

// 2026-06-16 連盟サイトリニューアル後の共通ニュース一覧パーサ。
// /news/?cat=taikai（大会）と /news/?cat=event（イベント）は同じHTML構造なので
// jsa-info / jsa-event がこの parse を共用する。
const ORIGIN = 'https://www.shogi.or.jp'

export function parseNewsList(html: string, sourceUrl: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  $('a[href*="/news/view.php?id="]').each((_, el) => {
    const $a = $(el)
    const href = ($a.attr('href') ?? '').trim()
    const m = href.match(/\/news\/view\.php\?id=(\d{8}-\d+)/)
    if (!m) return
    const articleId = m[1]
    if (seen.has(articleId)) return

    // 一覧の各記事は <span>掲載日</span><span>カテゴリ</span><span>タイトル</span> の順。
    // タイトルは「YYYY/MM/DD 形式の掲載日」でなく、いちばん長い span のテキスト。
    let title = ''
    $a.find('span').each((__, sp) => {
      const t = $(sp).text().replace(/\s+/g, ' ').trim()
      if (!t) return
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(t)) return
      if (t.length > title.length) title = t
    })
    if (!title) title = $a.text().replace(/\s+/g, ' ').trim()
    if (!title) return

    seen.add(articleId)

    const detailUrl = `${ORIGIN}/news/view.php?id=${articleId}`

    items.push({
      source: 'jsa',
      source_url: sourceUrl,
      external_id: makeId(articleId),
      title,
      description: null,
      // 一覧の日付は「掲載日」。開催日かは記事ごとに異なるため event_date には入れず、
      // タイトルから開催日らしき月日が取れた時だけ採用する（推測しない）。
      event_date_text: titleDateText(title),
      event_date_start: titleDate(title),
      event_date_end: null,
      location: null,
      prefecture: extractPrefecture(title),
      eligibility: null,
      application_deadline: null,
      application_deadline_text: null,
      application_url: null,
      ticket_url: null,
      contact_email: null,
      detail_url: detailUrl
    })
  })

  return items
}

// タイトルに「7月5日」「8/11」のような月日があれば開催日候補として拾う（無ければ null）
function titleDate(title: string): string | null {
  return parseDate(title).start
}
function titleDateText(title: string): string | null {
  const p = parseDate(title)
  return p.start ? p.text : null
}

export async function scrapeNews(sourceUrl: string): Promise<ScrapedTournament[]> {
  const html = await fetchHtml(sourceUrl)
  return parseNewsList(html, sourceUrl)
}

function makeId(articleId: string): string {
  // 記事ID（例: 20260615-002）は安定しているのでこれだけで一意にする
  return createHash('sha1').update(`jsa-news|${articleId}`).digest('hex').slice(0, 16)
}
