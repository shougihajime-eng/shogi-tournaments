import Link from 'next/link'
import type { Tournament } from '@/lib/types/tournament'
import { isPrizeTournament } from '@/lib/filters/prize'

function within(iso: string | null, now: Date, days: number): boolean {
  if (!iso) return false
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return false
  const diff = (t - now.getTime()) / (24 * 60 * 60 * 1000)
  return diff >= 0 && diff <= days
}

type StatItem = {
  label: string
  value: number
  accent: string
  href: string | null
}

export function StatsBanner({ tournaments, now }: { tournaments: Tournament[]; now: Date }) {
  const total = tournaments.length
  const tokyoCount = tournaments.filter(t => t.region === 'tokyo').length
  const kantoCount = tournaments.filter(t => t.region === 'kanto').length
  const prizeCount = tournaments.filter(t => isPrizeTournament(t)).length
  const thisWeek = tournaments.filter(t => within(t.event_date_start, now, 7)).length
  const deadlineSoon = tournaments.filter(t => within(t.application_deadline, now, 7)).length

  const stats: StatItem[] = [
    { label: '掲載中', value: total, accent: 'text-ink-900', href: '/' },
    { label: '東京', value: tokyoCount, accent: 'text-tokyo-600', href: '/?region=tokyo' },
    { label: '関東', value: kantoCount, accent: 'text-kanto-600', href: '/?region=kanto' },
    { label: '💰賞金大会', value: prizeCount, accent: 'text-amber-700', href: '/?prize=1' },
    { label: '今週', value: thisWeek, accent: 'text-shogi-700', href: null },
    { label: '締切間近', value: deadlineSoon, accent: 'text-deadline-600', href: null }
  ]

  return (
    <section aria-label="掲載中の大会の概況" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="surface overflow-hidden">
        <dl className="grid grid-cols-2 divide-y divide-ink-200 sm:grid-cols-6 sm:divide-y-0 sm:divide-x">
          {stats.map((s, idx) => {
            const inner = (
              <>
                <dt className="text-xs font-medium tracking-wide text-ink-500">{s.label}</dt>
                <dd className={`font-serif text-2xl font-bold tabular-nums ${s.accent} sm:text-3xl`}>
                  {s.value}
                  <span className="ml-1 text-xs font-normal text-ink-400">件</span>
                </dd>
              </>
            )
            const cls = `flex flex-col items-center gap-1 px-3 py-4 sm:py-5 ${idx === 0 && stats.length % 2 !== 0 ? 'col-span-2 sm:col-span-1' : ''}`
            if (s.href) {
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className={`${cls} transition-colors hover:bg-ink-50`}
                  aria-label={`${s.label}で絞り込む（${s.value}件）`}
                >
                  {inner}
                </Link>
              )
            }
            return (
              <div key={s.label} className={cls}>
                {inner}
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
