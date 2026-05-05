import type { Tournament } from '@/lib/types/tournament'
import { TournamentCard } from '@/components/TournamentCard'

function groupByMonth(tournaments: Tournament[]): Array<[string, Tournament[]]> {
  const groups = new Map<string, Tournament[]>()
  for (const t of tournaments) {
    const key = t.event_date_start ? t.event_date_start.slice(0, 7) : '__no-date'
    const list = groups.get(key) ?? []
    list.push(t)
    groups.set(key, list)
  }
  return Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === '__no-date') return 1
    if (b === '__no-date') return -1
    return a.localeCompare(b)
  })
}

function formatMonth(key: string, now: Date): { label: string; sub: string | null } {
  if (key === '__no-date') return { label: '日程未定', sub: null }
  const [y, m] = key.split('-')
  const year = parseInt(y, 10)
  const month = parseInt(m, 10)
  const sameYear = year === now.getFullYear()
  const label = sameYear ? `${month}月` : `${year}年${month}月`
  const date = new Date(year, month - 1, 1)
  const monthsDiff = (year - now.getFullYear()) * 12 + (month - now.getMonth() - 1)
  let sub: string | null = null
  if (monthsDiff === 0) sub = '今月'
  else if (monthsDiff === 1) sub = '来月'
  else if (monthsDiff === 2) sub = '再来月'
  return { label, sub }
}

function MonthDivider({ label, sub, count }: { label: string; sub: string | null; count: number }) {
  return (
    <div className="col-span-full mb-2 mt-2 flex items-baseline gap-3 first:mt-0">
      <h3 className="font-serif text-base font-bold text-ink-700">
        {label}
        {sub && <span className="ml-2 text-xs font-normal text-ink-500">{sub}</span>}
      </h3>
      <div className="h-px flex-1 bg-ink-200" />
      <span className="text-xs tabular-nums text-ink-400">{count}件</span>
    </div>
  )
}

export function TournamentList({
  tournaments,
  now,
  emptyMessage = '該当する大会がありません',
  emptyHint,
  groupByMonth: enableGrouping = false
}: {
  tournaments: Tournament[]
  now: Date
  emptyMessage?: string
  emptyHint?: string
  groupByMonth?: boolean
}) {
  if (tournaments.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-1.5 px-6 py-10 text-center">
        <svg
          aria-hidden
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-ink-300"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" />
        </svg>
        <p className="text-sm font-semibold text-ink-700">{emptyMessage}</p>
        {emptyHint && <p className="text-xs text-ink-500">{emptyHint}</p>}
      </div>
    )
  }

  if (!enableGrouping) {
    return (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tournaments.map(t => (
          <li key={t.id} className="animate-slide-up">
            <TournamentCard tournament={t} now={now} />
          </li>
        ))}
      </ul>
    )
  }

  const groups = groupByMonth(tournaments)
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {groups.map(([key, items]) => {
        const { label, sub } = formatMonth(key, now)
        return (
          <div key={key} className="contents">
            <MonthDivider label={label} sub={sub} count={items.length} />
            {items.map(t => (
              <div key={t.id} className="animate-slide-up">
                <TournamentCard tournament={t} now={now} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
