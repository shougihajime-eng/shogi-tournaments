import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { parseDate } from '@/lib/normalizers/date'
import { extractPrefecture } from '@/lib/normalizers/region'

// HTTPS版は SNI/cert で失敗する場合があるため HTTP を一次URLにする
export const SOURCE_URL = 'http://amaren.e5.valueserver.jp/Rsys/TournamentListAll.php'
const BASE_URL = 'http://amaren.e5.valueserver.jp/Rsys/'
const SOURCE: 'amaren' = 'amaren'

// テーブル列順: No / 大会名 / 級 / 開催日 / 開催地
export function parse(html: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []

  $('#tournament-list_table tr').each((_, tr) => {
    const $tds = $(tr).find('td')
    if ($tds.length < 5) return

    const $a = $tds.eq(1).find('a').first()
    const title = $a.text().trim()
    const href = $a.attr('href') ?? ''
    if (!title || !href) return

    const detailUrl = toAbsolute(href, BASE_URL)
    const klass = $tds.eq(2).text().trim()
    const dateText = $tds.eq(3).text().trim()
    const location = $tds.eq(4).text().trim() || null

    const parsed = parseDate(dateText)

    items.push({
      source: SOURCE,
      source_url: SOURCE_URL,
      external_id: makeId(detailUrl, title, dateText),
      title,
      description: klass ? `級: ${klass}` : null,
      event_date_text: dateText || null,
      event_date_start: parsed.start,
      event_date_end: parsed.end,
      location,
      prefecture: extractPrefecture(location),
      eligibility: klass || null,
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
  const html = await fetchHtml(SOURCE_URL)
  return parse(html)
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
