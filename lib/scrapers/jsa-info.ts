import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { parseDate } from '@/lib/normalizers/date'
import { extractPrefecture } from '@/lib/normalizers/region'

export const SOURCE_URL = 'https://www.shogi.or.jp/event/info/'
const SOURCE: 'jsa' = 'jsa'

export function parse(html: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  $('ul.listElementA01-10 > li > a, ul[class*="listElement"] > li > a').each((_, el) => {
    const $a = $(el)
    const href = $a.attr('href') ?? ''
    if (!href || !/\/event\//.test(href)) return

    const detailUrl = toAbsolute(href, SOURCE_URL)

    const $clone = $a.clone()
    $clone.find('small').remove()
    const title = $clone.text().trim()
    if (!title) return

    if (seen.has(detailUrl)) return
    seen.add(detailUrl)

    const m = title.match(/^(\d{1,2}\s*[\/月]\s*\d{1,2}日?)/)
    const dateText = m ? m[1] : null
    const parsed = dateText ? parseDate(dateText) : { start: null, end: null, text: '' }

    items.push({
      source: SOURCE,
      source_url: SOURCE_URL,
      external_id: makeId(detailUrl, title),
      title,
      description: null,
      event_date_text: dateText,
      event_date_start: parsed.start,
      event_date_end: parsed.end,
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

function makeId(detailUrl: string, title: string): string {
  return createHash('sha1')
    .update(`${SOURCE}|${detailUrl}|${title}`)
    .digest('hex')
    .slice(0, 16)
}
