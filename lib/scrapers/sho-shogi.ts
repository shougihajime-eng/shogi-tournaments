import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { extractPrefecture } from '@/lib/normalizers/region'
import { parseDate } from '@/lib/normalizers/date'

export const SOURCE_URL = 'https://sho-shogi.blogspot.com/'
const SOURCE: 'sho-shogi' = 'sho-shogi'

const LOCATION_PATTERN = /(?:会場|場所|開催地)[：:\s]*([^\n。、,]+?)(?=\s|$|。|、|\n)/
const DATE_LINE_PATTERN = /(?:開催日|日時|日程)[：:\s]*([^\n]+)/
const APPLICATION_LINE_PATTERN = /(?:申込締切|締切|締め切り|申込み締切)[：:\s]*([^\n]+)/
const APPLICATION_URL_PATTERN = /^https?:\/\/(?:docs\.google\.com|forms\.gle|peatix\.com|passmarket\.yahoo\.co\.jp|ws\.formzu\.net|forms\.office\.com)/

export function parse(html: string, baseUrl = SOURCE_URL): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  $('article.post.hentry, article.hentry, .post.hentry').each((_, el) => {
    const $post = $(el)
    const titleEl = $post.find('h1.post-title.entry-title, h2.post-title.entry-title, .post-title.entry-title').first()
    const title = titleEl.text().replace(/\s+/g, ' ').trim()
    if (!title) return

    const linkEl = titleEl.find('a').first()
    let detailUrl = (linkEl.attr('href') ?? '').trim()
    if (!detailUrl) {
      const canonical = $post.find('a[rel="bookmark"]').first().attr('href')
      if (canonical) detailUrl = canonical.trim()
    }
    if (!detailUrl) return
    if (detailUrl.startsWith('/')) detailUrl = new URL(detailUrl, baseUrl).toString()

    const body = $post.find('.post-body.entry-content, .post-body, .entry-content').first()
    const bodyText = body.text().replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim()

    const dateLine = bodyText.match(DATE_LINE_PATTERN)?.[1] ?? null
    const parsedDate = dateLine ? parseDate(dateLine) : { start: null, end: null, text: '' }
    let startISO = parsedDate.start
    let endISO = parsedDate.end
    let dateText = parsedDate.text || dateLine

    if (!startISO) {
      const fallback = parseDate(title)
      if (fallback.start) {
        startISO = fallback.start
        endISO = endISO ?? fallback.end
        dateText = dateText ?? fallback.text
      }
    }

    const locationLine = bodyText.match(LOCATION_PATTERN)?.[1]?.trim() ?? null
    const prefecture = extractPrefecture(`${title} ${locationLine ?? ''} ${bodyText.slice(0, 400)}`)

    const deadlineLine = bodyText.match(APPLICATION_LINE_PATTERN)?.[1] ?? null
    const parsedDeadline = deadlineLine ? parseDate(deadlineLine) : { start: null, end: null, text: '' }

    let applicationUrl: string | null = null
    body.find('a[href]').each((_, a) => {
      if (applicationUrl) return
      const href = ($(a).attr('href') ?? '').trim()
      if (!href) return
      if (APPLICATION_URL_PATTERN.test(href)) applicationUrl = href
    })

    const description = bodyText.slice(0, 280) || null

    const externalId = makeId(detailUrl, title, startISO)
    if (seen.has(externalId)) return
    seen.add(externalId)

    items.push({
      source: SOURCE,
      source_url: SOURCE_URL,
      external_id: externalId,
      title,
      description,
      event_date_text: dateText,
      event_date_start: startISO,
      event_date_end: endISO,
      location: locationLine,
      prefecture,
      eligibility: null,
      application_deadline: parsedDeadline.start,
      application_deadline_text: deadlineLine,
      application_url: applicationUrl,
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
