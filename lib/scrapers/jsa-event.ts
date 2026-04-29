import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { extractPrefecture } from '@/lib/normalizers/region'

export const SOURCE_URL = 'https://www.shogi.or.jp/event/'
const SOURCE: 'jsa' = 'jsa'

// JSA event calendar embeds a "Add to Google Calendar" widget on each event link.
// The anchor carries data-title / data-place / data-url / data-fromdate / data-todate
// — much more reliable than parsing visible text in the calendar table cells.
export function parse(html: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const seen = new Set<string>()
  const items: ScrapedTournament[] = []

  $('a[data-title][data-url][data-fromdate]').each((_, el) => {
    const $a = $(el)
    const title = ($a.attr('data-title') ?? '').trim()
    const detailUrl = ($a.attr('data-url') ?? '').trim()
    if (!title || !detailUrl) return

    const place = ($a.attr('data-place') ?? '').trim() || null
    const from = ($a.attr('data-fromdate') ?? '').trim()
    const to = ($a.attr('data-todate') ?? '').trim()

    const startISO = from ? from.slice(0, 10) : null
    const endISO = to ? to.slice(0, 10) : null
    const dateText = startISO && endISO && startISO !== endISO
      ? `${startISO} 〜 ${endISO}`
      : startISO

    const dedupKey = `${detailUrl}|${title}|${startISO ?? ''}`
    if (seen.has(dedupKey)) return
    seen.add(dedupKey)

    items.push({
      source: SOURCE,
      source_url: SOURCE_URL,
      external_id: makeId(detailUrl, title, startISO),
      title,
      description: null,
      event_date_text: dateText,
      event_date_start: startISO,
      event_date_end: endISO,
      location: place,
      prefecture: extractPrefecture(place),
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

function makeId(detailUrl: string, title: string, dateText: string | null): string {
  return createHash('sha1')
    .update(`${SOURCE}|${detailUrl}|${title}|${dateText ?? ''}`)
    .digest('hex')
    .slice(0, 16)
}
