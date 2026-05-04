import type { Tournament } from '@/lib/types/tournament'
import { TournamentCard } from '@/components/TournamentCard'

export function TournamentList({
  tournaments,
  now,
  emptyMessage = '該当する大会がありません',
  emptyHint
}: {
  tournaments: Tournament[]
  now: Date
  emptyMessage?: string
  emptyHint?: string
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
