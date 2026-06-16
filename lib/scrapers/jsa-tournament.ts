import * as cheerio from 'cheerio'
import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { parseDate } from '@/lib/normalizers/date'
import { extractPrefecture } from '@/lib/normalizers/region'

// 2026-06-16 連盟サイトリニューアル後：旧 /tournament/ は404。新住所は /event/tournament/。
// 一覧ページは各大会を「カード」（h3=大会名 + p=ひとこと説明）で静的に出している。
// 開催日は説明文に「8月12日に開催」のように書かれることがあるので、取れた時だけ採用する。
export const SOURCE_URL = 'https://www.shogi.or.jp/event/tournament/'
const ORIGIN = 'https://www.shogi.or.jp'

export function parse(html: string): ScrapedTournament[] {
  const $ = cheerio.load(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  // 大会名を載せた見出しリンク（カード上部の <a class="block ..."><h3>大会名</h3></a>）
  $('a[href^="/event/tournament/"]').each((_, el) => {
    const $a = $(el)
    const href = ($a.attr('href') ?? '').trim()
    // カテゴリ配下リンクのみ（一覧トップ /event/tournament/ 自身やアンカーは除外）
    const m = href.match(/^\/event\/tournament\/([a-z0-9_-]+)\/$/i)
    if (!m) return
    const slug = m[1]
    if (seen.has(slug)) return

    const $h = $a.find('h3').first()
    const title = $h.text().replace(/\s+/g, ' ').trim()
    if (!title) return // 見出しを持つリンクだけを大会カードとして採用（「詳細情報」リンク等は除外）

    seen.add(slug)

    // カードの説明文（同じカード内の <p>）から開催日らしき月日を拾う（無ければ null）
    const desc = $a.parent().find('p').first().text().replace(/\s+/g, ' ').trim() || null
    const parsed = desc ? parseDate(desc) : { start: null, end: null, text: '' }

    const detailUrl = `${ORIGIN}/event/tournament/${slug}/`

    items.push({
      source: 'jsa',
      source_url: SOURCE_URL,
      external_id: makeId(slug),
      title,
      description: desc,
      event_date_text: parsed.start ? parsed.text : null,
      event_date_start: parsed.start,
      event_date_end: parsed.end,
      location: null,
      prefecture: extractPrefecture(`${title} ${desc ?? ''}`),
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

function makeId(slug: string): string {
  // カテゴリslug（例: ama_meijin）は安定しているのでこれだけで一意にする
  return createHash('sha1').update(`jsa-tournament|${slug}`).digest('hex').slice(0, 16)
}
