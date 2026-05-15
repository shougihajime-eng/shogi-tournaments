import { NextResponse } from 'next/server'
import { getServerReadClient } from '@/lib/supabase/server'
import type { Tournament } from '@/lib/types/tournament'
import { evaluatePrizeCandidate } from '@/lib/filters/prize-candidate'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// 「賞金大会の可能性があるが、PRIZE_RULES でまだ確定していない大会」の一覧を返す。
// ユーザーから「気になる候補をチェックして」と言われたら、Claude がこれを読んで
// 各大会の賞金額をWeb検索で確認し、出典が見つかれば PRIZE_RULES に追加する。
export async function GET() {
  const supabase = getServerReadClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, title, description, source, detail_url, prefecture, event_date_start, event_date_end, application_deadline, first_seen_at, is_excluded')
    .eq('is_excluded', false)
    .or(
      `event_date_end.gte.${today},and(event_date_end.is.null,event_date_start.gte.${today}),and(event_date_end.is.null,event_date_start.is.null)`
    )
    .limit(800)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const tournaments = (data ?? []) as Tournament[]
  const candidates = tournaments
    .map(t => {
      const c = evaluatePrizeCandidate(t)
      if (!c.isCandidate) return null
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        source: t.source,
        detail_url: t.detail_url,
        prefecture: t.prefecture,
        event_date_start: t.event_date_start,
        event_date_end: t.event_date_end,
        first_seen_at: t.first_seen_at,
        matched_keyword: c.matched,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    // 新着順でソート（運営が見やすいように）
    .sort((a, b) => b.first_seen_at.localeCompare(a.first_seen_at))

  return NextResponse.json({
    count: candidates.length,
    note: '賞金キーワードを含むが PRIZE_RULES でまだ確定していない大会の一覧。出典が確認できたものから lib/filters/prize.ts に追加してください。',
    candidates,
  })
}
