'use client'
import { useEffect, useState } from 'react'
import {
  type Reaction,
  REACTION_CHANGED_EVENT,
  readReactions,
  setReaction as persistReaction
} from '@/lib/reactions'

export function ReactionButtons({ tournamentId }: { tournamentId: string }) {
  const [reaction, setLocalReaction] = useState<Reaction | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const sync = () => {
      const store = readReactions()
      setLocalReaction(store[tournamentId] ?? null)
    }
    sync()
    setHydrated(true)
    window.addEventListener(REACTION_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(REACTION_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [tournamentId])

  const onClickGoing = () => {
    const next: Reaction | null = reaction === 'going' ? null : 'going'
    setLocalReaction(next)
    persistReaction(tournamentId, next)
  }
  const onClickInterested = () => {
    const next: Reaction | null = reaction === 'interested' ? null : 'interested'
    setLocalReaction(next)
    persistReaction(tournamentId, next)
  }

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
