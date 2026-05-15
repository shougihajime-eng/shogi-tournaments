import type { Tournament } from '@/lib/types/tournament'

// 賞金大会の判定。
// ここに載せるルールは「公式ページ・Wikipedia・新聞報道など信頼できる出典で
// 確認できたもの」だけを記載する。
// 噂レベル・出典なしの大会は載せない（誤情報として信頼を損なうため）。
//
// 出典が確認できないが「賞金」「金一封」のキーワードを含む大会は、
// `prize-candidate.ts` の判定で別途「未確認候補」として拾い上げ、
// 運営が後でひとつずつ確認する運用とする。
type PrizeRule = {
  pattern: RegExp
  label: string
}

const PRIZE_RULES: PrizeRule[] = [
  // ① アマチュア竜王戦：優勝50万円
  // 出典: 日本将棋連盟コラム https://www.shogi.or.jp/column/2017/09/post_233.html
  { pattern: /アマチュア竜王戦|アマ竜王戦|アマ竜王/, label: '優勝50万円' },

  // ② FUYOU杯（茨城県アマ将棋最強戦）：優勝10万円
  // 出典: 株式会社FUYOU公式 https://fuyou-g.com/info/3787/
  { pattern: /FUYOU杯|ふようはい|フヨウ杯|茨城.*最強戦/, label: '優勝10万円' },

  // ③ アマ最強戦：優勝12万円（2024年実績）
  // 出典: ブログ記事「令和6年アマ最強戦」 1位12万円・2位5万円・3位3万円
  // https://blog.goo.ne.jp/sekoisyougioyaji/e/3fb80d8c447ea3c795797456e4e0c1ac
  // ※茨城最強戦のルールが先にマッチするので、このルールは茨城以外の最強戦にのみ適用
  { pattern: /(平成|令和)?最強戦|アマ最強戦/, label: '優勝12万円' },

  // ④ 三浦三崎マグロ争奪将棋大会：優勝マグロ1本
  // 出典: Wikipedia「将棋のアマチュア棋戦」・神奈川新聞報道
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

  // 説明文中に「賞金20万円」など金額が明示されている場合は信頼して採用
  const amountMatch = text.match(AMOUNT_PATTERN)
  if (amountMatch) {
    return { isPrize: true, label: `賞金${amountMatch[1]}万円`, matched: 'amount' }
  }

  return { isPrize: false, label: null, matched: null }
}

export function isPrizeTournament(t: Pick<Tournament, 'title' | 'description'>): boolean {
  return evaluatePrize(t).isPrize
}

export function prizeLabel(t: Pick<Tournament, 'title' | 'description'>): string | null {
  return evaluatePrize(t).label
}
