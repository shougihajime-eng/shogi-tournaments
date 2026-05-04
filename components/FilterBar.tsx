'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import type { RegionFilter, SortKey } from '@/lib/types/tournament'

const REGION_OPTIONS: Array<{ key: RegionFilter; label: string; count?: number }> = [
  { key: 'all', label: 'すべて' },
  { key: 'tokyo', label: '東京' },
  { key: 'kanto', label: '関東を含む' }
]

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'date', label: '開催日が近い順' },
  { key: 'deadline', label: '締切が近い順' },
  { key: 'newest', label: '新着順' }
]

export function FilterBar({
  region,
  sort,
  query,
  counts
}: {
  region: RegionFilter
  sort: SortKey
  query: string
  counts: { all: number; tokyo: number; kanto: number }
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const [localQuery, setLocalQuery] = useState(query)

  // URLが変化したら入力を同期
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  function pushParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params?.toString() ?? '')
    mutate(next)
    const qs = next.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  function setRegion(key: RegionFilter) {
    pushParams(next => {
      if (key === 'all') next.delete('region')
      else next.set('region', key)
    })
  }

  function setSort(key: SortKey) {
    pushParams(next => {
      if (key === 'date') next.delete('sort')
      else next.set('sort', key)
    })
  }

  // 検索のデバウンス
  useEffect(() => {
    if (localQuery === query) return
    const id = window.setTimeout(() => {
      pushParams(next => {
        const trimmed = localQuery.trim()
        if (trimmed) next.set('q', trimmed)
        else next.delete('q')
      })
    }, 220)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery])

  function clearQuery() {
    setLocalQuery('')
  }

  const counted: Record<RegionFilter, number> = {
    all: counts.all,
    tokyo: counts.tokyo,
    kanto: counts.kanto
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 検索ボックス */}
      <label className="surface flex items-center gap-2 px-3.5 py-2.5 focus-within:border-shogi-700 focus-within:ring-2 focus-within:ring-shogi-700/15">
        <svg
          aria-hidden
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          aria-label="大会名・場所で検索"
          placeholder="大会名・場所で検索（例: シニア、横浜）"
          className="w-full bg-transparent text-base outline-none placeholder:text-ink-400 sm:text-sm"
          value={localQuery}
          onChange={e => setLocalQuery(e.target.value)}
        />
        {localQuery && (
          <button
            type="button"
            onClick={clearQuery}
            aria-label="検索をクリア"
            className="rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <svg aria-hidden width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 11-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 11-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z"/>
            </svg>
          </button>
        )}
      </label>

      {/* 地域チップと並び替え */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="地域で絞り込み" className="flex flex-wrap items-center gap-1.5">
          {REGION_OPTIONS.map(opt => {
            const isActive = region === opt.key
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRegion(opt.key)}
                aria-pressed={isActive}
                className={
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all ' +
                  (isActive
                    ? 'border-shogi-800 bg-shogi-800 text-white shadow-sm'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50')
                }
              >
                {opt.label}
                <span
                  className={
                    'inline-flex min-w-5 items-center justify-center rounded-full px-1 text-xs tabular-nums ' +
                    (isActive ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-600')
                  }
                >
                  {counted[opt.key]}
                </span>
              </button>
            )
          })}
        </nav>

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <span className="hidden sm:inline">並び替え</span>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              aria-label="並び替え"
              className="appearance-none rounded-md border border-ink-200 bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-ink-800 hover:border-ink-300 focus:border-shogi-700 focus:outline-none focus:ring-2 focus:ring-shogi-700/15"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <svg
              aria-hidden
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-500"
            >
              <path d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"/>
            </svg>
          </div>
        </label>
      </div>
    </div>
  )
}
