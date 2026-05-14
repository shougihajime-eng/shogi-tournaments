import type { Tournament } from '@/lib/types/tournament'

// アマ六大棋戦：奨励会三段リーグ編入試験の受験資格が得られる6つのアマチュア全国棋戦
// 出典: ja.wikipedia.org/wiki/将棋のアマチュア棋戦
// 1. アマチュア竜王戦（読売新聞社・日本将棋連盟共催）
// 2. 全日本アマチュア名人戦（日本将棋連盟）
// 3. 全国アマチュア王将位大会（囲碁・将棋チャンネル）
// 4. 全国支部将棋対抗戦個人戦（日本将棋連盟）
// 5. 朝日アマチュア将棋名人戦（朝日新聞社）
// 6. しんぶん赤旗全国囲碁・将棋大会（しんぶん赤旗）
type FeaturedRule = {
  pattern: RegExp
  label: string
}

const FEATURED_RULES: FeaturedRule[] = [
  { pattern: /アマチュア竜王戦|アマ竜王戦|アマ竜王/, label: 'アマ竜王戦' },
  { pattern: /全日本アマチュア(将棋)?名人戦|全日本アマ(チュア)?名人戦|アマ名人戦/, label: 'アマ名人戦' },
  { pattern: /朝日アマチュア(将棋)?名人戦|朝日アマ(名人)?/, label: '朝日アマ名人戦' },
  { pattern: /全国アマチュア王将位|アマ王将位|アマ王将戦/, label: 'アマ王将戦' },
  { pattern: /(全国)?支部(将棋)?対抗戦|支部対抗戦個人戦|支部名人戦/, label: '支部対抗戦' },
  { pattern: /赤旗(全国)?(囲碁)?(・)?将棋大会|赤旗(全国)?名人戦|赤旗名人/, label: '赤旗名人戦' },
]

export type FeaturedInfo = {
  isFeatured: boolean
  label: string | null
}

export function evaluateFeatured(t: Pick<Tournament, 'title' | 'description'>): FeaturedInfo {
  const text = [t.title ?? '', t.description ?? ''].join(' ').normalize('NFKC')
  for (const rule of FEATURED_RULES) {
    if (rule.pattern.test(text)) {
      return { isFeatured: true, label: rule.label }
    }
  }
  return { isFeatured: false, label: null }
}

export function isFeaturedTournament(t: Pick<Tournament, 'title' | 'description'>): boolean {
  return evaluateFeatured(t).isFeatured
}

export function featuredLabel(t: Pick<Tournament, 'title' | 'description'>): string | null {
  return evaluateFeatured(t).label
}
