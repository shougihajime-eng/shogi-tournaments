export const EXCLUSION_KEYWORDS = [
  // 子ども系（仕様で明示された10語）
  '小学生', '中学生', '高校生', '小中学生', '学生', '児童',
  '子ども', 'こども', 'キッズ', '青少年',
  // 学校形式の表記揺れ（「小・中学校団体戦」「高校選手権」等を捕まえるための合理的補完）
  '小学校', '中学校', '高校',
  // イベント系
  '親子', '観戦', '大盤解説', '解説会', '指導対局', '前夜祭', 'ツアー'
] as const

export type ExclusionResult = {
  isExcluded: boolean
  reason: string | null
}

export function evaluateExclusion(...texts: Array<string | null | undefined>): ExclusionResult {
  const haystack = texts
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .map(t => t.normalize('NFKC'))
    .join(' ')

  for (const kw of EXCLUSION_KEYWORDS) {
    if (haystack.includes(kw)) {
      return { isExcluded: true, reason: `keyword:${kw}` }
    }
  }
  return { isExcluded: false, reason: null }
}
