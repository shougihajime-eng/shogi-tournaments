import type { Tournament } from '@/lib/types/tournament'

type FeaturedRule = {
  pattern: RegExp
  label: string
}

const FEATURED_RULES: FeaturedRule[] = [
  { pattern: /アマチュア竜王戦|アマ竜王戦|アマ竜王/, label: 'アマ竜王戦' },
  { pattern: /全日本アマチュア(将棋)?名人戦|全日本アマ(チュア)?名人戦|アマ名人戦/, label: 'アマ名人戦' },
  { pattern: /朝日アマチュア(将棋)?名人戦|朝日アマ(名人)?/, label: '朝日アマ名人戦' },
  { pattern: /全国アマチュア王将位|アマ王将位|アマ王将戦/, label: 'アマ王将戦' },
  { pattern: /赤旗(全国)?名人戦|赤旗名人/, label: '赤旗名人戦' },
  { pattern: /全国アマチュア王座戦|アマ王座戦/, label: 'アマ王座戦' },
  { pattern: /(平成|令和)?最強戦|アマ最強戦/, label: 'アマ最強戦' },
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
