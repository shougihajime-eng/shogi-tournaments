import { getServerReadClient } from '@/lib/supabase/server'
import type { Tournament, RegionFilter, ScrapeRun } from '@/lib/types/tournament'
import { TournamentList } from '@/components/TournamentList'
import { FilterBar } from '@/components/FilterBar'
import { RefreshButton } from '@/components/RefreshButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchParams = { region?: string }

function normalizeRegionFilter(input: string | undefined): RegionFilter {
  if (input === 'tokyo' || input === 'kanto') return input
  return 'all'
}

async function loadTournaments(filter: RegionFilter): Promise<Tournament[]> {
  const supabase = getServerReadClient()
  // 開催日が過ぎた大会は非表示（end > today なら表示。end が無ければ start > today で判定。両方 null なら表示継続）
  const today = new Date().toISOString().slice(0, 10)

  let query = supabase
    .from('tournaments')
    .select('*')
    .eq('is_excluded', false)
    .or(`event_date_end.gte.${today},and(event_date_end.is.null,event_date_start.gte.${today}),and(event_date_end.is.null,event_date_start.is.null)`)
    .order('event_date_start', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true })
    .limit(500)

  if (filter === 'tokyo') query = query.eq('region', 'tokyo')
  else if (filter === 'kanto') query = query.in('region', ['tokyo', 'kanto'])

  const { data, error } = await query
  if (error) throw new Error(`tournaments query failed: ${error.message}`)
  return (data ?? []) as Tournament[]
}

async function loadLatestRun(): Promise<ScrapeRun | null> {
  const supabase = getServerReadClient()
  const { data } = await supabase
    .from('scrape_runs')
    .select('*')
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as ScrapeRun | null) ?? null
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return '未取得'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yy}/${mm}/${dd} ${hh}:${mi}`
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const filter = normalizeRegionFilter(params.region)

  const [tournaments, latestRun] = await Promise.all([loadTournaments(filter), loadLatestRun()])
  const now = new Date()

  const featured = tournaments.filter(t => t.region === 'tokyo' || t.region === 'kanto')
  const others = filter === 'all' ? tournaments.filter(t => t.region !== 'tokyo' && t.region !== 'kanto') : []

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">将棋大会情報</h1>
          <p className="mt-1 text-sm text-slate-600">
            日本将棋連盟・日本アマチュア将棋連盟の大人向け大会を集約
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <RefreshButton />
        </div>
      </header>

      <div className="mb-6">
        <FilterBar active={filter} />
      </div>

      {filter === 'all' && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-slate-900">東京・関東の大会</h2>
          <TournamentList
            tournaments={featured}
            now={now}
            emptyMessage="現在、東京・関東で公開中の大会はありません"
          />
        </section>
      )}

      {filter === 'all' ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">その他の大会</h2>
          <TournamentList
            tournaments={others}
            now={now}
            emptyMessage="その他地域の大会はありません"
          />
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">
            {filter === 'tokyo' ? '東京の大会' : '関東の大会（東京含む）'}
          </h2>
          <TournamentList tournaments={tournaments} now={now} />
        </section>
      )}

      <footer className="mt-12 border-t border-slate-200 pt-4 text-xs text-slate-500">
        <p>最終更新: {formatTimestamp(latestRun?.finished_at ?? null)}</p>
        <p className="mt-1">
          情報元: 日本将棋連盟 (shogi.or.jp) / 日本アマチュア将棋連盟 (amaren)
        </p>
      </footer>
    </main>
  )
}
