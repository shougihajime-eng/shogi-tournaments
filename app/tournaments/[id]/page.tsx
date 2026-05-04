import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerReadClient } from '@/lib/supabase/server'
import type { Tournament } from '@/lib/types/tournament'
import { Badge } from '@/components/Badge'
import { ReactionButtons } from '@/components/ReactionButtons'
import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const MS_PER_DAY = 24 * 60 * 60 * 1000

async function loadTournament(id: string): Promise<Tournament | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const supabase = getServerReadClient()
  const { data } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .eq('is_excluded', false)
    .maybeSingle()
  return (data as Tournament | null) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const t = await loadTournament(id)
  if (!t) return { title: '大会が見つかりません' }
  return {
    title: t.title,
    description: `${t.event_date_text ?? ''} ${t.location ?? ''} ${t.eligibility ?? ''}`.trim() || t.title,
    openGraph: { title: t.title, type: 'article' }
  }
}

function formatIsoDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  const [, y, mo, d] = m
  const dt = new Date(`${y}-${mo}-${d}T00:00:00+09:00`)
  const dow = ['日', '月', '火', '水', '木', '金', '土'][dt.getDay()] ?? ''
  return `${y}年${parseInt(mo, 10)}月${parseInt(d, 10)}日（${dow}）`
}

function formatDateRange(t: Tournament): string {
  if (t.event_date_start) {
    const s = formatIsoDate(t.event_date_start)
    if (t.event_date_end && t.event_date_end !== t.event_date_start) {
      return `${s} 〜 ${formatIsoDate(t.event_date_end)}`
    }
    return s
  }
  return t.event_date_text ?? '日程未定'
}

function daysUntil(iso: string | null, now: Date): number | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  return Math.round((t - now.getTime()) / MS_PER_DAY)
}

export default async function TournamentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await loadTournament(id)
  if (!t) notFound()

  const now = new Date()
  const daysToEvent = daysUntil(t.event_date_start, now)
  const daysToDeadline = daysUntil(t.application_deadline, now)
  const isToday = daysToEvent === 0
  const isDeadlineSoon = daysToDeadline !== null && daysToDeadline >= 0 && daysToDeadline <= 7

  return (
    <>
      <AppHeader lastUpdatedAt={t.last_seen_at} now={now} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-shogi-700 hover:text-shogi-900 hover:underline"
        >
          <svg aria-hidden width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12.7 4.3a1 1 0 010 1.4L8.4 10l4.3 4.3a1 1 0 11-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z"/>
          </svg>
          一覧へもどる
        </Link>

        <article className="surface overflow-hidden">
          <div className="border-b border-ink-100 px-6 py-6 sm:px-8 sm:py-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={t.source === 'jsa' ? 'jsa' : 'amaren'}>
                {t.source === 'jsa' ? '日本将棋連盟' : 'アマレン'}
              </Badge>
              {t.region === 'tokyo' && <Badge variant="tokyo">東京</Badge>}
              {t.region === 'kanto' && <Badge variant="kanto">関東</Badge>}
              {isToday && <Badge variant="new">本日開催</Badge>}
              {isDeadlineSoon && <Badge variant="deadline">締切間近</Badge>}
            </div>
            <h1 className="font-serif text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
              {t.title}
            </h1>
            {t.description && (
              <p className="mt-3 text-base leading-relaxed text-ink-700">{t.description}</p>
            )}
          </div>

          <dl className="divide-y divide-ink-100 px-6 sm:px-8">
            <Row label="開催日" value={formatDateRange(t)} accent={isToday} />
            {t.location && <Row label="場所" value={t.location} />}
            {t.eligibility && <Row label="参加条件" value={t.eligibility} />}
            {(t.application_deadline || t.application_deadline_text) && (
              <Row
                label="申込締切"
                value={
                  t.application_deadline ? formatIsoDate(t.application_deadline) : (t.application_deadline_text ?? '')
                }
                accent={isDeadlineSoon}
                hint={
                  daysToDeadline !== null && daysToDeadline >= 0
                    ? daysToDeadline === 0
                      ? '本日まで'
                      : `あと${daysToDeadline}日`
                    : null
                }
              />
            )}
            <Row
              label="情報元"
              value={
                <a
                  href={t.detail_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shogi-700 hover:text-shogi-900 hover:underline"
                >
                  {t.source === 'jsa' ? '日本将棋連盟の公式ページ' : 'アマレンの公式ページ'} →
                </a>
              }
            />
          </dl>

          <div className="border-t border-ink-100 bg-ink-50/40 px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {t.application_url ? (
                  <a
                    href={t.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    申し込みページへ
                    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                  </a>
                ) : (
                  <a
                    href={t.detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    公式ページで詳細を見る
                    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                  </a>
                )}
                {t.ticket_url && (
                  <a
                    href={t.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    チケット
                  </a>
                )}
                {t.contact_email && (
                  <a
                    href={`mailto:${t.contact_email}`}
                    className="btn-secondary"
                  >
                    メールで問い合わせ
                  </a>
                )}
              </div>
              <ReactionButtons tournamentId={t.id} />
            </div>
          </div>
        </article>

        <p className="mt-6 text-center text-xs text-ink-500">
          掲載情報は変更される場合があります。最新の正確な情報は必ず公式ページでご確認ください。
        </p>
      </main>

      <AppFooter lastUpdatedAt={t.last_seen_at} />
    </>
  )
}

function Row({
  label,
  value,
  accent,
  hint
}: {
  label: string
  value: React.ReactNode
  accent?: boolean
  hint?: string | null
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[140px_1fr] sm:gap-4 sm:py-5">
      <dt className="text-xs font-bold tracking-wide text-ink-500 sm:text-sm">{label}</dt>
      <dd className={`text-base ${accent ? 'font-bold text-deadline-700' : 'text-ink-900'}`}>
        {value}
        {hint && (
          <span className="ml-2 text-xs font-medium text-ink-500">（{hint}）</span>
        )}
      </dd>
    </div>
  )
}
