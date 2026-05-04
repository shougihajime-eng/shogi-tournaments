import type { Tournament } from '@/lib/types/tournament'

function within(iso: string | null, now: Date, days: number): boolean {
  if (!iso) return false
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return false
  const diff = (t - now.getTime()) / (24 * 60 * 60 * 1000)
  return diff >= 0 && diff <= days
}

export function StatsBanner({ tournaments, now }: { tournaments: Tournament[]; now: Date }) {
  const total = tournaments.length
  const tokyoCount = tournaments.filter(t => t.region === 'tokyo').length
  const kantoCount = tournaments.filter(t => t.region === 'kanto').length
  const thisWeek = tournaments.filter(t => within(t.event_date_start, now, 7)).length
  const deadlineSoon = tournaments.filter(t => within(t.application_deadline, now, 7)).length

  const stats = [
    { label: '掲載中', value: total, accent: 'text-ink-900' },
    { label: '東京', value: tokyoCount, accent: 'text-tokyo-600' },
    { label: '関東', value: kantoCount, accent: 'text-kanto-600' },
    { label: '今週', value: thisWeek, accent: 'text-shogi-700' },
    { label: '締切間近', value: deadlineSoon, accent: 'text-deadline-600' }
  ]

  return (
    <section aria-label="掲載中の大会の概況" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="surface overflow-hidden">
        <dl className="grid grid-cols-2 divide-y divide-ink-200 sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
          {stats.map((s, idx) => (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-1 px-3 py-4 sm:py-5 ${idx === 0 && stats.length % 2 !== 0 ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <dt className="text-xs font-medium tracking-wide text-ink-500">{s.label}</dt>
              <dd className={`font-serif text-2xl font-bold tabular-nums ${s.accent} sm:text-3xl`}>
                {s.value}
                <span className="ml-1 text-xs font-normal text-ink-400">件</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
