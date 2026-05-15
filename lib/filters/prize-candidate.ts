import type { Tournament } from '@/lib/types/tournament'
import { isPrizeTournament } from '@/lib/filters/prize'

// 「賞金大会の可能性があるが、ルールでまだ確定していない大会」を判定する。
// 毎日のスクレイピング後、運営（Claude）がここに引っかかった大会を1件ずつ
// Web検索で確認し、出典が見つかれば PRIZE_RULES に追加する運用。
//
// 拾うキーワード: 賞金 / 金一封 / 商品券 / ○万円 / マグロ等
const CANDIDATE_KEYWORDS = [
  /賞金/,
  /金一封/,
  /商品券/,
  /\d{1,4}\s*万円/,
  /マグロ/,
  /景品/,
]

export type PrizeCandidateInfo = {
  isCandidate: boolean
  matched: string | null
}

export function evaluatePrizeCandidate(
  t: Pick<Tournament, 'title' | 'description'>
): PrizeCandidateInfo {
  // すでに確定ルールでマッチしている大会は候補にしない（重複を避ける）
  if (isPrizeTournament(t)) return { isCandidate: false, matched: null }

  const text = [t.title ?? '', t.description ?? ''].join(' ').normalize('NFKC')

  for (const kw of CANDIDATE_KEYWORDS) {
    if (kw.test(text)) {
      return { isCandidate: true, matched: kw.source }
    }
  }

  return { isCandidate: false, matched: null }
}

export function isPrizeCandidate(
  t: Pick<Tournament, 'title' | 'description'>
): boolean {
  return evaluatePrizeCandidate(t).isCandidate
}
