'use client'
import { useEffect, useState } from 'react'

type Reaction = 'going' | 'interested' | null

const STORAGE_KEY = 'shogi-reactions:v1'

type Store = Record<string, 'going' | 'interested'>

function readStore(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Store = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (v === 'going' || v === 'interested') out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

function writeStore(store: Store): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function ReactionButtons({ tournamentId }: { tournamentId: string }) {
  const [reaction, setReaction] = useState<Reaction>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const store = readStore()
    const v = store[tournamentId]
    if (v === 'going' || v === 'interested') setReaction(v)
    setHydrated(true)
  }, [tournamentId])

  const update = (next: Reaction) => {
    setReaction(next)
    const store = readStore()
    if (next) store[tournamentId] = next
    else delete store[tournamentId]
    writeStore(store)
  }

  const onClickGoing = () => update(reaction === 'going' ? null : 'going')
  const onClickInterested = () => update(reaction === 'interested' ? null : 'interested')

  return (
    <div className="flex flex-wrap gap-2" suppressHydrationWarning>
      <button
        type="button"
        onClick={onClickGoing}
        aria-pressed={hydrated && reaction === 'going'}
        className={
          'inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-semibold transition ' +
          (hydrated && reaction === 'going'
            ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50')
        }
      >
        {hydrated && reaction === 'going' ? '✓ 行く' : '行く'}
      </button>
      <button
        type="button"
        onClick={onClickInterested}
        aria-pressed={hydrated && reaction === 'interested'}
        className={
          'inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-semibold transition ' +
          (hydrated && reaction === 'interested'
            ? 'border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50')
        }
      >
        {hydrated && reaction === 'interested' ? '★ 気になる' : '気になる'}
      </button>
    </div>
  )
}
