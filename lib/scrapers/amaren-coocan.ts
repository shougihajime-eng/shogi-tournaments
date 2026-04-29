import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { parseDate } from '@/lib/normalizers/date'
import { extractPrefecture } from '@/lib/normalizers/region'

// アマレンの coocan サイトはフレームセット。実コンテンツは index_kore.html
export const SOURCE_URL = 'https://amaren.la.coocan.jp/'
const CONTENT_URL = 'https://amaren.la.coocan.jp/index_kore.html'
const SOURCE: 'amaren' = 'amaren'

// coocanは大会お知らせ・結果PDF・YouTubeリンクが混在する古い静的HTML。
// 大会タイトル＋日付がセル内にあるテーブル行を拾い、PDFとYouTubeは除外する。
export function parse(html: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  $('a[href]').each((_, a) => {
    const $a = $(a)
    const href = ($a.attr('href') ?? '').trim()
    if (!href) return
    if (/youtube\.com|youtu\.be|asahi\.com|facebook\.com|twitter\.com/i.test(href)) return

    const title = $a.text().replace(/\s+/g, ' ').trim()
    if (!title || title.length < 3) return

    // タイトルや周辺テキストに日付が含まれる場合のみ採用
    const $row = $a.closest('tr,td,p,li')
    const rowText = ($row.text() || title).normalize('NFKC').replace(/\s+/g, ' ').trim()
    const dateText = extractDate(rowText)
    if (!dateText) return

    const detailUrl = toAbsolute(href, CONTENT_URL)
    if (seen.has(`${detailUrl}|${title}`)) return
    seen.add(`${detailUrl}|${title}`)

    const parsed = parseDate(dateText)
    // タイトル内の都道府県名のみを採用（rowText 全体だと隣接コンテンツの誤マッチが多い）
    const prefecture = extractPrefecture(title)

    items.push({
      source: SOURCE,
      source_url: SOURCE_URL,
      external_id: makeId(detailUrl, title, dateText),
      title,
      description: null,
      event_date_text: dateText,
      event_date_start: parsed.start,
      event_date_end: parsed.end,
      location: null,
      prefecture,
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

export async function scrape(): Promise<ScrapedTournament[]> {
  const html = await fetchHtml(CONTENT_URL)
  return parse(html)
}

function extractDate(text: string): string | null {
  const ymd = text.match(/(\d{4})\s*[\/\-年]\s*(\d{1,2})\s*[\/\-月]\s*(\d{1,2})\s*日?/)
  if (ymd) return ymd[0]
  return null
}

function toAbsolute(href: string, base: string): string {
  try {
    return new URL(href, base).toString()
  } catch {
    return href
  }
}

function makeId(detailUrl: string, title: string, dateText: string | null): string {
  return createHash('sha1')
    .update(`${SOURCE}|${detailUrl}|${title}|${dateText ?? ''}`)
    .digest('hex')
    .slice(0, 16)
}
