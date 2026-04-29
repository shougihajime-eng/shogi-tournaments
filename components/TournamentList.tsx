import type { Tournament } from '@/lib/types/tournament'
import { TournamentCard } from '@/components/TournamentCard'

export function TournamentList({
  tournaments,
  now,
  emptyMessage = '該当する大会がありません'
}: {
  tournaments: Tournament[]
  now: Date
  emptyMessage?: string
}) {
  if (tournaments.length === 0) {
    return <p className="rounded-md bg-white p-6 text-center text-sm text-slate-500">{emptyMessage}</p>
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tournaments.map(t => (
        <li key={t.id}>
          <TournamentCard tournament={t} now={now} />
        </li>
      ))}
    </ul>
  )
}
