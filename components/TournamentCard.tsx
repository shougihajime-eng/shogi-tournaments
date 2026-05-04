import type { Tournament } from '@/lib/types/tournament'
import { Badge } from '@/components/Badge'
import { ReactionButtons } from '@/components/ReactionButtons'

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

function daysUntil(iso: string | null, now: Date): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  // 当日は0、明日は1
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfThen = new Date(new Date(t).getFullYear(), new Date(t).getMonth(), new Date(t).getDate()).getTime()
  return Math.round((startOfThen - startOfNow) / MS_PER_DAY)
}

function formatIsoDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  const [, y, mo, d] = m
  const date = new Date(`${y}-${mo}-${d}T00:00:00+09:00`)
  const dow = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()] ?? ''
  return `${parseInt(mo, 10)}月${parseInt(d, 10)}日（${dow}）`
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

function formatRelativeDay(iso: string | null, now: Date): string | null {
  const d = daysUntil(iso, now)
  if (d === null) return null
  if (d < 0) return null
  if (d === 0) return '本日'
  if (d === 1) return '明日'
  if (d <= 7) return `${d}日後`
  if (d <= 30) return `${d}日後`
  return null
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
  const isToday = daysUntil(t.event_date_start, now) === 0

  const deadline = formatDeadline(t)
  const deadlineRelative = formatRelativeDay(t.application_deadline, now)
  const eventRelative = formatRelativeDay(t.event_date_start, now)
  const sourceLabel = t.source === 'jsa' ? '日本将棋連盟' : 'アマレン'
  const yearISO = t.event_date_start ? t.event_date_start.slice(0, 4) : null

  return (
    <article
      className={
        'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ' +
        (isToday
          ? 'border-shogi-700 ring-2 ring-shogi-700/15'
          : isDeadlineSoon
            ? 'border-deadline-500 ring-2 ring-deadline-500/20'
            : 'border-ink-200')
      }
    >
      {/* 縦アクセントバー */}
      {(isToday || isDeadlineSoon) && (
        <div
          aria-hidden
          className={
            'absolute left-0 top-0 h-full w-1 ' +
            (isToday ? 'bg-shogi-700' : 'bg-deadline-500')
          }
        />
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* バッジ群 */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <Badge variant={t.source === 'jsa' ? 'jsa' : 'amaren'}>{sourceLabel}</Badge>
          {t.region === 'tokyo' && <Badge variant="tokyo">東京</Badge>}
          {t.region === 'kanto' && <Badge variant="kanto">関東</Badge>}
          {isNew && <Badge variant="new">NEW</Badge>}
          {isDeadlineSoon && <Badge variant="deadline">締切間近</Badge>}
        </div>

        {/* タイトル */}
        <h3 className="font-serif text-lg font-bold leading-snug text-ink-900 group-hover:text-shogi-800">
          {t.title}
        </h3>

        {/* 開催日（強調） */}
        <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-xs font-semibold tracking-wide text-ink-500">開催日</div>
            {eventRelative && (
              <span
                className={
                  'text-xs font-bold tabular-nums ' +
                  (isToday ? 'text-shogi-700' : 'text-ink-600')
                }
              >
                {eventRelative}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-serif text-base font-bold tabular-nums text-ink-900 sm:text-lg">
              {formatDateRange(t)}
            </span>
            {yearISO && (
              <span className="text-xs tabular-nums text-ink-400">{yearISO}年</span>
            )}
          </div>
        </div>

        {/* 詳細リスト */}
        <dl className="mt-3 space-y-2 text-sm text-ink-700">
          {t.location && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-xs font-semibold tracking-wide text-ink-500">場所</dt>
              <dd className="leading-snug">{t.location}</dd>
            </div>
          )}
          {t.eligibility && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-xs font-semibold tracking-wide text-ink-500">参加条件</dt>
              <dd className="leading-snug">{t.eligibility}</dd>
            </div>
          )}
          {deadline && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-xs font-semibold tracking-wide text-ink-500">申込締切</dt>
              <dd
                className={
                  'leading-snug tabular-nums ' +
                  (isDeadlineSoon ? 'font-bold text-deadline-700' : '')
                }
              >
                {deadline}
                {deadlineRelative && (
                  <span className="ml-1.5 text-xs font-medium text-ink-500">
                    （あと{deadlineRelative}）
                  </span>
                )}
              </dd>
            </div>
          )}
        </dl>

        {t.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">
            {t.description}
          </p>
        )}

        {/* 申込ボタン群 */}
        <div className="mt-4 flex flex-wrap items-stretch gap-2">
          {t.application_url ? (
            <a
              href={t.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`${t.title} の申込ページを別タブで開く`}
            >
              申し込む
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </a>
          ) : (
            <a
              href={t.detail_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`${t.title} の公式ページを別タブで開く`}
            >
              公式サイトで確認
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
            </a>
          )}
          {t.ticket_url && (
            <a
              href={t.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              aria-label={`${t.title} のチケットページを別タブで開く`}
            >
              チケット
            </a>
          )}
          {t.contact_email && (
            <a
              href={`mailto:${t.contact_email}`}
              className="btn-secondary"
              aria-label="メールで問い合わせる"
            >
              問い合わせ
            </a>
          )}
        </div>
      </div>

      {/* 右下: 反応ボタン（区切り背景） */}
      <div className="border-t border-ink-100 bg-ink-50/60 px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-ink-500">この大会は…</span>
          <ReactionButtons tournamentId={t.id} compact />
        </div>
      </div>
    </article>
  )
}
