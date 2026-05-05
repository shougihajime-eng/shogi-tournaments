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
    <header className="border-b border-ink-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 -mx-2 rounded-md px-2 py-1 hover:bg-ink-50 focus:bg-ink-50"
          aria-label="トップへ"
        >
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-shogi-800 to-shogi-900 font-serif text-lg font-bold text-white shadow-sm">
            王
          </span>
          <div className="leading-tight">
            <span className="block font-serif text-xl font-bold text-ink-900 sm:text-2xl">
              将棋大会ナビ
            </span>
            <span className="block text-xs text-ink-500 sm:text-sm">
              大人のための大会情報を毎日自動収集
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-500 sm:inline tabular-nums">
            {formatRelative(lastUpdatedAt, now)}
          </span>
          <RefreshButton />
        </div>
      </div>
    </header>
  )
}
