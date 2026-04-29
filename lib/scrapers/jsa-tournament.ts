import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'

export const SOURCE_URL = 'https://www.shogi.or.jp/tournament/'
const SOURCE: 'jsa' = 'jsa'

// /tournament/ は大会カテゴリのディレクトリ（アマ竜王戦・支部対抗戦・シニア名人戦など）。
// 一覧ページに開催日は載らないため、ここでは「カテゴリ」をカード化して詳細URLへの導線だけ提供する。
export function parse(html: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  $('a[href^="/tournament/"]').each((_, el) => {
    const $a = $(el)
    const href = $a.attr('href') ?? ''
    if (!href || href === '/tournament/' || href.startsWith('#')) return
    if (!/\/tournament\/[a-z0-9_\-]+\//i.test(href)) return

    const detailUrl = toAbsolute(href, SOURCE_URL)
    if (seen.has(detailUrl)) return

    let title = ($a.find('img[alt]').first().attr('alt') ?? '').trim()
    if (!title) title = $a.text().replace(/\s+/g, ' ').trim()
    if (!title) {
      title = ($a.closest('li,div,section').find('h2,h3,h4,.title').first().text() ?? '').trim()
    }
    if (!title || title.length > 80) return

    seen.add(detailUrl)

    items.push({
      source: SOURCE,
      source_url: SOURCE_URL,
      external_id: makeId(detailUrl, title),
      title,
      description: null,
      event_date_text: null,
      event_date_start: null,
      event_date_end: null,
      location: null,
      prefecture: null,
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
