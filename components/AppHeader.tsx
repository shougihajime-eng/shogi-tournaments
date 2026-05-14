import Link from 'next/link'
import { RefreshButton } from '@/components/RefreshButton'

function formatRelative(iso: string | null, now: Date): string {
  if (!iso) return '未取得'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  const diffMin = Math.round((now.getTime() - t) / 60000)
  if (diffMin < 1) return 'たった今更新'
  if (diffMin < 60) return `${diffMin}分前に更新`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour}時間前に更新`
  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 30) return `${diffDay}日前に更新`
  return new Date(t).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function AppHeader({ lastUpdatedAt, now }: { lastUpdatedAt: string | null; now: Date }) {
  return (
    <header className="relative overflow-hidden border-b border-shogi-900/30 bg-header-deep shadow-elevated">
      {/* 装飾：右上に淡い金の同心円 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full opacity-25"
        style={{
          background:
            'radial-gradient(circle at center, rgba(224, 179, 84, 0.55) 0%, rgba(224, 179, 84, 0) 60%)'
        }}
      />
      {/* 装飾：金色の細いライン（下端） */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gold-line" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3.5 -mx-2 rounded-md px-2 py-1 transition-colors hover:bg-white/5 focus:bg-white/5"
          aria-label="トップへ"
        >
          <span
            aria-hidden
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-koma-200 via-koma-300 to-koma-400 font-serif text-2xl font-extrabold text-shogi-900 shadow-lg ring-1 ring-koma-500/40 sm:h-14 sm:w-14 sm:text-3xl"
            style={{
              boxShadow:
                '0 4px 12px -2px rgba(16, 42, 67, 0.4), inset 0 -2px 4px rgba(102, 72, 24, 0.25), inset 0 1px 2px rgba(255, 251, 240, 0.6)'
            }}
          >
            王
          </span>
          <div className="leading-tight">
            <span className="block font-serif text-2xl font-bold tracking-wide text-white sm:text-3xl">
              将棋大会ナビ
            </span>
            <span className="mt-1 block text-xs text-koma-200 sm:text-sm">
              <span className="text-kin-400">▲</span> 大人のための大会情報を毎日自動収集
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-koma-200 sm:inline tabular-nums">
            {formatRelative(lastUpdatedAt, now)}
          </span>
          <RefreshButton />
        </div>
      </div>
    </header>
  )
}
