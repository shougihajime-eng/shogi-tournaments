import type { Tournament } from '@/lib/types/tournament'

// 同じ大会が複数ソースに掲載されたり、JSA内の event/info/tournament 3つに重複登録される
// ケースを表示時点で1件に統合する。
//
// 判定キー: タイトル正規化（記号・年・回数・カッコ書きを除去）+ 開催日 (null は別キー)
// 同一キー内で「情報量が多い」「優先ソース」のレコードを採用する。

const SOURCE_PRIORITY: Record<string, number> = {
  jsa: 3,
  amaren: 2,
  'sho-shogi': 1
}

function normalizeTitle(title: string): string {
  return title
    .normalize('NFKC')
    .replace(/[(（][^)）]*[)）]/g, '') // カッコ書きを除去
    .replace(/第\s*[\d０-９一二三四五六七八九十百千]+\s*回/g, '') // 第◯回
    .replace(/\d{4}\s*年?\s*度?/g, '') // 西暦
    .replace(/令和\s*[\d元]+\s*年?\s*度?/g, '') // 令和n年
    .replace(/平成\s*[\d元]+\s*年?\s*度?/g, '') // 平成n年
    .replace(/[\s\-_~〜～・,、。.【】「」『』〈〉《》"'!?]/g, '')
    .toLowerCase()
}

function scoreCompleteness(t: Tournament): number {
  let s = 0
  if (t.event_date_start) s += 4
  if (t.application_url) s += 3
  if (t.description && t.description.length > 20) s += 2
  if (t.location) s += 1
  if (t.application_deadline) s += 1
  if (t.contact_email) s += 1
  if (t.eligibility) s += 1
  return s
}

function pickBetter(a: Tournament, b: Tournament): Tournament {
  const scoreDiff = scoreCompleteness(b) - scoreCompleteness(a)
  if (scoreDiff !== 0) return scoreDiff > 0 ? b : a
  const prioDiff = (SOURCE_PRIORITY[b.source] ?? 0) - (SOURCE_PRIORITY[a.source] ?? 0)
  if (prioDiff !== 0) return prioDiff > 0 ? b : a
  return a.first_seen_at <= b.first_seen_at ? a : b
}

export function dedupeTournaments(tournaments: Tournament[]): Tournament[] {
  const groups = new Map<string, Tournament>()
  const ungrouped: Tournament[] = []

  for (const t of tournaments) {
    const normalized = normalizeTitle(t.title)
    if (normalized.length < 4) {
      // 正規化後にタイトルが短すぎる場合は誤集約防止のため重複判定しない
      ungrouped.push(t)
      continue
    }
    const key = `${normalized}|${t.event_date_start ?? ''}`
    const current = groups.get(key)
    if (!current) {
      groups.set(key, t)
    } else {
      groups.set(key, pickBetter(current, t))
    }
  }

  return [...groups.values(), ...ungrouped]
}

export const __test = { normalizeTitle, scoreCompleteness }
