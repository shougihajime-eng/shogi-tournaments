import { getServerReadClient } from '@/lib/supabase/server'
import type { Tournament, RegionFilter, ScrapeRun, SortKey } from '@/lib/types/tournament'
import { TournamentList } from '@/components/TournamentList'
import { FilterBar } from '@/components/FilterBar'
import { MyTournamentsSection } from '@/components/MyTournamentsSection'
import { OnboardingHint } from '@/components/OnboardingHint'
import { AppHeader } from '@/components/AppHeader'
import { StatsBanner } from '@/components/StatsBanner'
import { AppFooter } from '@/components/AppFooter'
import { SkipLink } from '@/components/SkipLink'
import { BackToTopButton } from '@/components/BackToTopButton'
import { isPrizeTournament } from '@/lib/filters/prize'
import { isFeaturedTournament } from '@/lib/filters/featured'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchParams = { region?: string; sort?: string; q?: string; prize?: string; featured?: string; deadline?: string }

const MS_PER_DAY = 24 * 60 * 60 * 1000

function normalizeRegion(input: string | undefined): RegionFilter {
  if (input === 'tokyo' || input === 'kanto') return input
  return 'all'
}

function normalizeSort(input: string | undefined): SortKey {
  if (input === 'deadline' || input === 'newest') return input
  return 'date'
}

function escapeIlike(s: string): string {
  return s.replace(/[%]/g, '').replace(/,/g, ' ').slice(0, 80)
}

function isDeadlineSoon(t: Tournament, now: Date): boolean {
  if (!t.application_deadline) return false
  const ts = Date.parse(t.application_deadline)
  if (Number.isNaN(ts)) return false
  const diff = (ts - now.getTime()) / MS_PER_DAY
  return diff >= 0 && diff <= 7
}

async function loadTournaments(): Promise<Tournament[]> {
  const supabase = getServerReadClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('is_excluded', false)
    .or(
      `event_date_end.gte.${today},and(event_date_end.is.null,event_date_start.gte.${today}),and(event_date_end.is.null,event_date_start.is.null)`
    )
    .limit(800)
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

function applySearch(items: Tournament[], q: string): Tournament[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return items
  const tokens = needle.split(/\s+/).filter(Boolean)
  return items.filter(t => {
    const haystack = [
      t.title,
      t.description ?? '',
      t.location ?? '',
      t.prefecture ?? '',
      t.eligibility ?? ''
    ]
      .join(' ')
      .toLowerCase()
    return tokens.every(tok => haystack.includes(tok))
  })
}

function applyRegion(items: Tournament[], region: RegionFilter): Tournament[] {
  if (region === 'tokyo') return items.filter(t => t.region === 'tokyo')
  if (region === 'kanto') return items.filter(t => t.region === 'tokyo' || t.region === 'kanto')
  return items
}

function applySort(items: Tournament[], sort: SortKey): Tournament[] {
  const list = [...items]
  if (sort === 'deadline') {
    list.sort((a, b) => {
      const aHas = Boolean(a.application_deadline)
      const bHas = Boolean(b.application_deadline)
      if (aHas !== bHas) return aHas ? -1 : 1
      if (a.application_deadline && b.application_deadline) {
        return a.application_deadline.localeCompare(b.application_deadline)
      }
      return 0
    })
  } else if (sort === 'newest') {
    list.sort((a, b) => b.first_seen_at.localeCompare(a.first_seen_at))
  } else {
    list.sort((a, b) => {
      const aHas = Boolean(a.event_date_start)
      const bHas = Boolean(b.event_date_start)
      if (aHas !== bHas) return aHas ? -1 : 1
      if (a.event_date_start && b.event_date_start) {
        return a.event_date_start.localeCompare(b.event_date_start)
      }
      return a.title.localeCompare(b.title, 'ja')
    })
  }
  return list
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const region = normalizeRegion(params.region)
  const sort = normalizeSort(params.sort)
  const query = escapeIlike((params.q ?? '').toString())
  const prizeOnly = params.prize === '1'
  const featuredOnly = params.featured === '1'
  const deadlineOnly = params.deadline === '1'

  const [allTournaments, latestRun] = await Promise.all([loadTournaments(), loadLatestRun()])
  const now = new Date()

  const counts = {
    all: allTournaments.length,
    tokyo: allTournaments.filter(t => t.region === 'tokyo').length,
    kanto: allTournaments.filter(t => t.region === 'tokyo' || t.region === 'kanto').length
  }

  const searched = applySearch(allTournaments, query)
  const regioned = applyRegion(searched, region)
  const prizeFiltered = prizeOnly ? regioned.filter(t => isPrizeTournament(t)) : regioned
  const featuredFiltered = featuredOnly ? prizeFiltered.filter(t => isFeaturedTournament(t)) : prizeFiltered
  const deadlineFiltered = deadlineOnly ? featuredFiltered.filter(t => isDeadlineSoon(t, now)) : featuredFiltered
  const sorted = applySort(deadlineFiltered, deadlineOnly ? 'deadline' : sort)

  const isSearching = Boolean(query.trim())
  const isFilteredView = prizeOnly || featuredOnly || deadlineOnly
  const showSegmentedSections = !isSearching && !isFilteredView && region === 'all'
  const groupByMonth = sort === 'date' && !isSearching && !isFilteredView

  const featuredTournaments = showSegmentedSections
    ? sorted.filter(t => isFeaturedTournament(t))
    : []
  const featuredIds = new Set(featuredTournaments.map(t => t.id))
  const prizeTournaments = showSegmentedSections
    ? sorted.filter(t => !featuredIds.has(t.id) && isPrizeTournament(t))
    : []
  const prizeIds = new Set(prizeTournaments.map(t => t.id))
  const deadlineSoonTournaments = showSegmentedSections
    ? sorted.filter(t => !featuredIds.has(t.id) && !prizeIds.has(t.id) && isDeadlineSoon(t, now))
    : []
  const deadlineIds = new Set(deadlineSoonTournaments.map(t => t.id))
  const consumedIds = new Set([...featuredIds, ...prizeIds, ...deadlineIds])
  const featured = showSegmentedSections
    ? sorted.filter(t => !consumedIds.has(t.id) && (t.region === 'tokyo' || t.region === 'kanto'))
    : []
  const others = showSegmentedSections
    ? sorted.filter(t => !consumedIds.has(t.id) && t.region !== 'tokyo' && t.region !== 'kanto')
    : []

  return (
    <>
      <SkipLink />
      <AppHeader lastUpdatedAt={latestRun?.finished_at ?? null} now={now} />

      <StatsBanner tournaments={allTournaments} now={now} />

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="sr-only">将棋大会一覧</h1>
        <Suspense>
          <OnboardingHint />
          <MyTournamentsSection tournaments={allTournaments} now={now} />
        </Suspense>

        <section aria-label="絞り込み" className="mb-6">
          <FilterBar region={region} sort={sort} query={query} counts={counts} />
        </section>

        {isSearching ? (
          <section>
            <SectionHeading
              title="検索結果"
              caption={`「${query}」 ・ ${sorted.length}件`}
            />
            <TournamentList
              tournaments={sorted}
              now={now}
              emptyMessage={`「${query}」 に該当する大会はありません`}
              emptyHint="別のキーワードや、検索ボックスをクリアして全件表示してみてください"
            />
          </section>
        ) : deadlineOnly ? (
          <section>
            <SectionHeading
              title="⏰ 締切が7日以内に迫っている大会"
              caption={`${sorted.length}件`}
              accent="deadline"
            />
            <TournamentList
              tournaments={sorted}
              now={now}
              emptyMessage="今は締切が近い大会はありません"
              emptyHint="トップに戻って、開催日順の一覧をご覧ください"
            />
          </section>
        ) : featuredOnly ? (
          <section>
            <SectionHeading
              title="👑 全国アマチュアの主要大会"
              caption={`${sorted.length}件`}
              accent="featured"
            />
            <TournamentList
              tournaments={sorted}
              now={now}
              emptyMessage="今は主要大会の掲載がありません"
              emptyHint="アマ竜王戦・アマ名人戦などは年に1度の開催です。トップに戻って通常の一覧をご覧ください"
            />
          </section>
        ) : prizeOnly ? (
          <section>
            <SectionHeading
              title="💰 賞金が出る大会"
              caption={`${sorted.length}件`}
              accent="prize"
            />
            <TournamentList
              tournaments={sorted}
              now={now}
              emptyMessage="今は賞金大会の掲載がありません"
              emptyHint="アマ竜王戦・都名人戦などは年に1度の開催です。トップに戻って通常の一覧をご覧ください"
            />
          </section>
        ) : region === 'all' ? (
          <>
            {featuredTournaments.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  title="👑 全国アマチュアの主要大会"
                  caption={`${featuredTournaments.length}件`}
                  accent="featured"
                />
                <TournamentList
                  tournaments={featuredTournaments}
                  now={now}
                  emptyMessage="今は主要大会の掲載がありません"
                />
              </section>
            )}
            {prizeTournaments.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  title="💰 賞金が出る大会"
                  caption={`${prizeTournaments.length}件`}
                  accent="prize"
                />
                <TournamentList
                  tournaments={prizeTournaments}
                  now={now}
                  emptyMessage="今は賞金大会の掲載がありません"
                />
              </section>
            )}
            {deadlineSoonTournaments.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  title="⏰ 締切が7日以内に迫っている大会"
                  caption={`${deadlineSoonTournaments.length}件`}
                  accent="deadline"
                />
                <TournamentList
                  tournaments={deadlineSoonTournaments}
                  now={now}
                  emptyMessage="今は締切が近い大会はありません"
                />
              </section>
            )}
            <section className="mb-10">
              <SectionHeading
                title="東京・関東で開かれる大会"
                caption={`${featured.length}件`}
                accent="tokyo"
              />
              <TournamentList
                tournaments={featured}
                now={now}
                emptyMessage="今は東京・関東の公開中の大会はありません"
                emptyHint="数日後に再度ご確認ください"
                groupByMonth={groupByMonth}
              />
            </section>
            <section>
              <SectionHeading
                title="そのほかの地域の大会"
                caption={`${others.length}件`}
              />
              <TournamentList
                tournaments={others}
                now={now}
                emptyMessage="ほかの地域の大会はありません"
                groupByMonth={groupByMonth}
              />
            </section>
          </>
        ) : (
          <section>
            <SectionHeading
              title={region === 'tokyo' ? '東京の大会' : '関東を含む大会（東京含む）'}
              caption={`${sorted.length}件`}
              accent={region === 'tokyo' ? 'tokyo' : 'kanto'}
            />
            <TournamentList
              tournaments={sorted}
              now={now}
              emptyMessage={region === 'tokyo' ? '今は東京の大会はありません' : '今は関東の大会はありません'}
              emptyHint="数日後に再度ご確認ください"
              groupByMonth={groupByMonth}
            />
          </section>
        )}
      </main>

      <AppFooter lastUpdatedAt={latestRun?.finished_at ?? null} />
      <BackToTopButton />
    </>
  )
}

function SectionHeading({
  title,
  caption,
  accent
}: {
  title: string
  caption?: string
  accent?: 'tokyo' | 'kanto' | 'prize' | 'featured' | 'deadline'
}) {
  const accentClass =
    accent === 'tokyo'
      ? 'before:bg-tokyo-600'
      : accent === 'kanto'
        ? 'before:bg-kanto-600'
        : accent === 'prize'
          ? 'before:bg-amber-500'
          : accent === 'featured'
            ? 'before:bg-gradient-to-b before:from-violet-600 before:to-fuchsia-600'
            : accent === 'deadline'
              ? 'before:bg-deadline-500'
              : 'before:bg-shogi-700'
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2
        className={`relative pl-3 font-serif text-xl font-bold text-ink-900 before:absolute before:left-0 before:top-1.5 before:h-5 before:w-1 before:rounded-full sm:text-2xl ${accentClass}`}
      >
        {title}
      </h2>
      {caption && <span className="text-xs tabular-nums text-ink-500 sm:text-sm">{caption}</span>}
    </div>
  )
}
