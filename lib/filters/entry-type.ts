import type { Tournament } from '@/lib/types/tournament'

// 申込タイプの判定：description / title / eligibility に含まれる文言から、
// 「事前申込制」「当日受付OK」「両方可」を推定する。
// 公式ページに該当キーワードがない場合は null（不明）として扱い、表示しない。

const WALKIN_PATTERN =
  /当日\s*(受付|参加|エントリー|申込|申し込み|エントリー可|参加可)|予約\s*不要|事前\s*申込\s*不要|事前\s*申込\s*不要|予約\s*なし|直接\s*(来場|参加)|飛び込み\s*参加|エントリー\s*不要/

const PRE_PATTERN =
  /事前\s*申込|事前\s*予約|事前\s*受付|要\s*申込|要\s*予約|要\s*事前|申込\s*必須|申し込み\s*必須|予約\s*必須|申込\s*締切|締切日|応募\s*締切|エントリー\s*締切|登録\s*締切|申し込みフォーム|申込\s*フォーム|お申し込み\s*フォーム/

export type EntryType = 'walkin' | 'pre' | 'both'

export type EntryTypeInfo = {
  type: EntryType | null
  label: string | null
}

export function evaluateEntryType(
  t: Pick<Tournament, 'title' | 'description' | 'eligibility' | 'application_url' | 'application_deadline'>
): EntryTypeInfo {
  const text = [t.title ?? '', t.description ?? '', t.eligibility ?? ''].join(' ').normalize('NFKC')

  const hasWalkin = WALKIN_PATTERN.test(text)
  const hasPre =
    PRE_PATTERN.test(text) || Boolean(t.application_deadline) || Boolean(t.application_url)

  if (hasWalkin && hasPre) return { type: 'both', label: '事前/当日OK' }
  if (hasWalkin) return { type: 'walkin', label: '当日受付OK' }
  if (hasPre) return { type: 'pre', label: '事前申込' }
  return { type: null, label: null }
}

export function entryTypeLabel(
  t: Pick<Tournament, 'title' | 'description' | 'eligibility' | 'application_url' | 'application_deadline'>
): string | null {
  return evaluateEntryType(t).label
}
