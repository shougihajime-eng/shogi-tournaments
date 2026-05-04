'use client'
import { useEffect, useState } from 'react'
import {
  type Reaction,
  REACTION_CHANGED_EVENT,
  readReactions,
  setReaction as persistReaction
} from '@/lib/reactions'

export function ReactionButtons({
  tournamentId,
  compact = false
}: {
  tournamentId: string
  compact?: boolean
}) {
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

  const goingActive = hydrated && reaction === 'going'
  const interestActive = hydrated && reaction === 'interested'

  const sizeClasses = compact
    ? 'px-2.5 py-1.5 text-xs'
    : 'px-3 py-2 text-sm'

  return (
    <div className="flex items-center gap-1.5" suppressHydrationWarning>
      <button
        type="button"
        onClick={onClickGoing}
        aria-pressed={goingActive}
        aria-label={goingActive ? '「行く」を解除' : '「行く」をマーク'}
        className={
          `inline-flex items-center justify-center gap-1 rounded-full border font-bold transition-all ${sizeClasses} ` +
          (goingActive
            ? 'border-going-600 bg-going-600 text-white shadow-sm hover:bg-going-700'
            : 'border-ink-300 bg-white text-ink-700 hover:border-going-400 hover:text-going-700')
        }
      >
        <svg aria-hidden width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <path d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4L9 11.6l6.3-6.3a1 1 0 011.4 0z"/>
        </svg>
        行く
      </button>
      <button
        type="button"
        onClick={onClickInterested}
        aria-pressed={interestActive}
        aria-label={interestActive ? '「気になる」を解除' : '「気になる」をマーク'}
        className={
          `inline-flex items-center justify-center gap-1 rounded-full border font-bold transition-all ${sizeClasses} ` +
          (interestActive
            ? 'border-interest-500 bg-interest-100 text-interest-700 shadow-sm hover:bg-interest-200'
            : 'border-ink-300 bg-white text-ink-700 hover:border-interest-500 hover:text-interest-700')
        }
      >
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill={interestActive ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.05 3.93a1 1 0 011.9 0l1.36 4.18a1 1 0 00.95.69h4.4a1 1 0 01.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18a1 1 0 01-1.54 1.12L10.59 17a1 1 0 00-1.18 0l-3.56 2.62a1 1 0 01-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L1.75 10.6a1 1 0 01.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z"/>
        </svg>
        気になる
      </button>
    </div>
  )
}
