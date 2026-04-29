'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { RegionFilter } from '@/lib/types/tournament'

const OPTIONS: Array<{ key: RegionFilter; label: string }> = [
  { key: 'all', label: 'すべて' },
  { key: 'tokyo', label: '東京' },
  { key: 'kanto', label: '関東' }
]

export function FilterBar({ active }: { active: RegionFilter }) {
  const pathname = usePathname()
  const params = useSearchParams()

  function buildHref(key: RegionFilter): string {
    const next = new URLSearchParams(params?.toString() ?? '')
    if (key === 'all') next.delete('region')
    else next.set('region', key)
    const qs = next.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <nav aria-label="地域フィルタ" className="flex flex-wrap gap-2">
      {OPTIONS.map(opt => {
        const isActive = active === opt.key
        return (
          <Link
            key={opt.key}
            href={buildHref(opt.key)}
            scroll={false}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {opt.label}
          </Link>
        )
      })}
    </nav>
  )
}
