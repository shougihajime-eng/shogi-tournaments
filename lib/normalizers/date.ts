// 令和元年 = 2019 → year = REIWA_OFFSET + reiwaYear
const REIWA_OFFSET = 2018

// 電話番号や郵便番号の誤マッチを防ぐため、現実的な年範囲のみ採用する
const MIN_YEAR = 1990
const MAX_YEAR = 2100

export type ParsedDate = {
  start: string | null
  end: string | null
  text: string
}

export function parseDate(input: string | null | undefined, currentYear?: number): ParsedDate {
  const raw = (input ?? '').trim()
  if (!raw) return { start: null, end: null, text: '' }

  const text = raw.normalize('NFKC')
  const year = currentYear ?? new Date().getFullYear()

  // 4桁年が現実離れしている (例: 0880-9-68 のような電話番号) はYMD扱いしない
  const ymd = text.match(/(\d{4})\s*[\/\-年]\s*(\d{1,2})\s*[\/\-月]\s*(\d{1,2})\s*日?/)
  if (ymd) {
    const y = parseInt(ymd[1], 10)
    if (y >= MIN_YEAR && y <= MAX_YEAR) {
      const start = isoOrNull(y, parseInt(ymd[2], 10), parseInt(ymd[3], 10))
      const end = parseEndAfter(text, ymd.index! + ymd[0].length, y)
      return { start, end, text: raw }
    }
  }

  const reiwa = text.match(/令和\s*(\d+|元)\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日?/)
  if (reiwa) {
    const r = reiwa[1] === '元' ? 1 : parseInt(reiwa[1], 10)
    const y = REIWA_OFFSET + r
    const start = isoOrNull(y, parseInt(reiwa[2], 10), parseInt(reiwa[3], 10))
    const end = parseEndAfter(text, reiwa.index! + reiwa[0].length, y)
    return { start, end, text: raw }
  }

  const md = text.match(/(\d{1,2})\s*[\/月]\s*(\d{1,2})\s*日?/)
  if (md) {
    const start = isoOrNull(year, parseInt(md[1], 10), parseInt(md[2], 10))
    const end = parseEndAfter(text, md.index! + md[0].length, year)
    return { start, end, text: raw }
  }

  return { start: null, end: null, text: raw }
}

function parseEndAfter(text: string, fromIdx: number, year: number): string | null {
  const rest = text.slice(fromIdx)
  const m = rest.match(/[〜～\-~]\s*(?:(\d{4})\s*[\/\-年]\s*)?(\d{1,2})\s*[\/月]\s*(\d{1,2})/)
  if (m) {
    const y = m[1] ? parseInt(m[1], 10) : year
    return isoOrNull(y, parseInt(m[2], 10), parseInt(m[3], 10))
  }
  return null
}

// 「○月」「○日」「上旬」「未定」のような日付らしいキーワードを含まない場合、
// それは日付テキストではない（電話番号などの可能性が高い）
export function looksLikeDateText(s: string | null | undefined): boolean {
  if (!s) return false
  return /月|日|年|上旬|中旬|下旬|未定|未発表|予定|春|夏|秋|冬|初旬|末|週|第[\d一二三四五六七八九十]/.test(
    s
  )
}

function isoOrNull(y: number, m: number, d: number): string | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  if (y < MIN_YEAR || y > MAX_YEAR) return null
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null
  const mm = String(m).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}
