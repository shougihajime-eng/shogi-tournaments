import { createHash } from 'node:crypto'
import type { ScrapedTournament } from '@/lib/scrapers/types'
import { fetchHtml } from '@/lib/fetcher'
import { extractPrefecture } from '@/lib/normalizers/region'

// 2026-06-16 連盟サイトのイベントカレンダー /event/ は Alpine.js のJS描画だが、
// 描画に使う配列 `_eventData` が静的HTML内の <script> に丸ごと埋め込まれている。
// fetch でHTMLを取り→正規表現で配列を取り出し JSON.parse すれば、ブラウザ自動操作なしで
// 「正確な開催日(date=YYYY/MM/DD)」つきの全イベントが構造化データで取れる。
export const SOURCE_URL = 'https://www.shogi.or.jp/event/'
const ORIGIN = 'https://www.shogi.or.jp'

type EventDataEntry = {
  id?: string
  date?: string // "2026/06/16"
  month?: string // "2026年6月"
  day?: number
  dow?: string // 曜日
  title?: string
  href?: string // "/news/view.php?id=20260616-001"
}

export function parse(html: string): ScrapedTournament[] {
  const entries = extractEventData(html)
  const items: ScrapedTournament[] = []
  const seen = new Set<string>()

  for (const e of entries) {
    const title = (e.title ?? '').replace(/\s+/g, ' ').trim()
    const href = (e.href ?? '').trim()
    if (!title || !href) continue

    const detailUrl = new URL(href, ORIGIN + '/').toString()
    if (seen.has(detailUrl)) continue
    seen.add(detailUrl)

    const startIso = isoFromSlashDate(e.date)
    const dateText = eventDateText(e)

    items.push({
      source: 'jsa',
      source_url: SOURCE_URL,
      external_id: makeId(detailUrl),
      title,
      description: null,
      // 開催日は _eventData の date（YYYY/MM/DD）＝正確。単日イベントとして start=end とする。
      event_date_text: startIso ? dateText : null,
      event_date_start: startIso,
      event_date_end: startIso,
      // 会場(location)は _eventData に存在しない。詳細ページは自由文で会場の確実な抽出が
      // できないため、推測せず null にする（プロジェクトの「取れなければ null」ルール）。
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
  }

  return items
}

// 静的HTML内の `_eventData = [ ... ];` を取り出して JSON.parse する
function extractEventData(html: string): EventDataEntry[] {
  const m = html.match(/_eventData\s*=\s*(\[.*?\])\s*;/s)
  if (!m) return []
  try {
    const arr = JSON.parse(m[1])
    return Array.isArray(arr) ? (arr as EventDataEntry[]) : []
  } catch {
    return []
  }
}

// "2026/06/16" → "2026-06-16"（不正なら null。推測で日付を作らない）
function isoFromSlashDate(date: string | undefined): string | null {
  const m = (date ?? '').trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!m) return null
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10)
  const d = parseInt(m[3], 10)
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  const dt = new Date(Date.UTC(y, mo - 1, d))
  if (dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function eventDateText(e: EventDataEntry): string {
  if (e.month && typeof e.day === 'number') return `${e.month}${e.day}日`
  return (e.date ?? '').replace(/\//g, '/')
}

function makeId(detailUrl: string): string {
  // 多くのイベントは /news/view.php?id=YYYYMMDD-NNN を指す＝ jsa-news(=jsa-info) と同じ記事。
  // 同じ記事を別 external_id にすると DB(source,external_id)で重複行になるため、
  // jsa-news と同じ採番ルール（記事ID基準）にそろえて upsert で1行に収れんさせる。
  const article = detailUrl.match(/\/news\/view\.php\?id=(\d{8}-\d+)/)
  if (article) {
    return createHash('sha1').update(`jsa-news|${article[1]}`).digest('hex').slice(0, 16)
  }
  // 記事URL以外（将来別ページを指す場合）は detail_url 基準で安定ハッシュ
  return createHash('sha1').update(`jsa-event|${detailUrl}`).digest('hex').slice(0, 16)
}

export async function scrape(): Promise<ScrapedTournament[]> {
  const html = await fetchHtml(SOURCE_URL)
  return parse(html)
}
