import type { Tournament } from '@/lib/types/tournament'

type PrizeRule = {
  pattern: RegExp
  label: string
}

const PRIZE_RULES: PrizeRule[] = [
  { pattern: /アマチュア竜王戦|アマ竜王戦|アマ竜王/, label: '優勝50万円' },
  { pattern: /茨城新聞社杯/, label: '賞金あり' },
  { pattern: /FUYOU杯|ふようはい|フヨウ杯|茨城.*最強戦/, label: '優勝10万円' },
  { pattern: /都名人戦/, label: '優勝15万円' },
  { pattern: /(平成|令和)?最強戦|アマ最強戦/, label: '優勝15万円' },
  { pattern: /竜虎戦/, label: '優勝12万円' },
  { pattern: /升田幸三杯/, label: '商品券10万円' },
  { pattern: /三浦三崎マグロ|マグロ争奪/, label: 'マグロ1本' },
]

const AMOUNT_PATTERN = /(?:賞金|優勝賞金|優勝金|金一封)[^。]{0,40}?(\d{1,4}(?:[,，]\d{3})?)\s*(?:万円|万)/
const TEN_THOUSAND_PATTERN = /(\d{1,4})\s*(?:万円)/

export type PrizeInfo = {
  isPrize: boolean
  label: string | null
  matched: string | null
}

export function evaluatePrize(t: Pick<Tournament, 'title' | 'description'>): PrizeInfo {
  const text = [t.title ?? '', t.description ?? ''].join(' ').normalize('NFKC')

  for (const rule of PRIZE_RULES) {
    if (rule.pattern.test(text)) {
      return { isPrize: true, label: rule.label, matched: rule.pattern.source }
    }
  }

  const amountMatch = text.match(AMOUNT_PATTERN)
  if (amountMatch) {
    return { isPrize: true, label: `賞金${amountMatch[1]}万円`, matched: 'amount' }
  }

  if (/賞金|金一封/.test(text)) {
    const m = text.match(TEN_THOUSAND_PATTERN)
    if (m && parseInt(m[1], 10) >= 5) {
      return { isPrize: true, label: `賞金${m[1]}万円`, matched: 'amount-loose' }
    }
    return { isPrize: true, label: '賞金あり', matched: 'keyword' }
  }

  return { isPrize: false, label: null, matched: null }
}

export function isPrizeTournament(t: Pick<Tournament, 'title' | 'description'>): boolean {
  return evaluatePrize(t).isPrize
}

export function prizeLabel(t: Pick<Tournament, 'title' | 'description'>): string | null {
  return evaluatePrize(t).label
}
