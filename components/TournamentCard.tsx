import type { Tournament } from '@/lib/types/tournament'
import { Badge } from '@/components/Badge'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function isWithinDays(iso: string | null, days: number, now: Date): boolean {
  if (!iso) return false
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return false
  const diff = (t - now.getTime()) / MS_PER_DAY
  return diff >= 0 && diff <= days
}

function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return (now.getTime() - t) / MS_PER_DAY
}

function formatDateRange(t: Tournament): string {
  if (t.event_date_start) {
    const start = formatIsoDate(t.event_date_start)
    if (t.event_date_end && t.event_date_end !== t.event_date_start) {
      return `${start} 〜 ${formatIsoDate(t.event_date_end)}`
    }
    return start
  }
  return t.event_date_text ?? '日程未定'
}

function formatIsoDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[1]}/${m[2]}/${m[3]}`
}

function formatDeadline(t: Tournament): string | null {
  if (t.application_deadline) return formatIsoDate(t.application_deadline)
  return t.application_deadline_text
}

export function TournamentCard({ tournament, now }: { tournament: Tournament; now: Date }) {
  const t = tournament
  const sinceFirst = daysSince(t.first_seen_at, now)
  const isNew = sinceFirst !== null && sinceFirst <= 7
  const isDeadlineSoon = isWithinDays(t.application_deadline, 7, now)

  const deadline = formatDeadline(t)
  const sourceLabel = t.source === 'jsa' ? 'JSA' : 'アマレン'

  return (
    <article
      className={`flex h-full flex-col rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md ${
        isDeadlineSoon ? 'border-deadline ring-2 ring-deadline/30' : 'border-slate-200'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Badge variant={t.source === 'jsa' ? 'jsa' : 'amaren'}>{sourceLabel}</Badge>
        {t.region === 'tokyo' && <Badge variant="tokyo">東京</Badge>}
        {t.region === 'kanto' && <Badge variant="kanto">関東</Badge>}
        {isNew && <Badge variant="new">NEW</Badge>}
        {isDeadlineSoon && <Badge variant="deadline">締切間近</Badge>}
      </div>

      <h3 className="text-lg font-bold leading-tight text-slate-900">{t.title}</h3>

      <dl className="mt-3 space-y-1.5 text-sm text-slate-700">
        <div className="flex gap-2">
          <dt className="w-16 shrink-0 font-semibold text-slate-500">開催日</dt>
          <dd>{formatDateRange(t)}</dd>
        </div>
        {t.location && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold text-slate-500">場所</dt>
            <dd>{t.location}</dd>
          </div>
        )}
        {t.eligibility && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold text-slate-500">参加条件</dt>
            <dd>{t.eligibility}</dd>
          </div>
        )}
        {deadline && (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 font-semibold text-slate-500">締切</dt>
            <dd className={isDeadlineSoon ? 'font-semibold text-deadline' : ''}>{deadline}</dd>
          </div>
        )}
      </dl>

      {t.description && (
        <p className="mt-3 line-clamp-3 text-sm text-slate-600">{t.description}</p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {t.application_url ? (
          <a
            href={t.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            申し込む
          </a>
        ) : (
          <a
            href={t.detail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            公式サイトで確認
          </a>
        )}
        {t.ticket_url && (
          <a
            href={t.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            チケット
          </a>
        )}
        {t.contact_email && (
          <a
            href={`mailto:${t.contact_email}`}
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            問い合わせ
          </a>
        )}
      </div>
    </article>
  )
}
