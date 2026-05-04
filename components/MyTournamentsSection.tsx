'use client'
import { useEffect, useState } from 'react'
import type { Tournament } from '@/lib/types/tournament'
import { TournamentList } from '@/components/TournamentList'
import { REACTION_CHANGED_EVENT, type ReactionStore, readReactions } from '@/lib/reactions'

export function MyTournamentsSection({ tournaments, now }: { tournaments: Tournament[]; now: Date }) {
  const [store, setStore] = useState<ReactionStore>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const sync = () => setStore(readReactions())
    sync()
    setHydrated(true)
    window.addEventListener(REACTION_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(REACTION_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!hydrated) return null

  const going = tournaments.filter(t => store[t.id] === 'going')
  const interested = tournaments.filter(t => store[t.id] === 'interested')
  if (going.length === 0 && interested.length === 0) return null

  return (
    <section className="mb-8 rounded-lg border border-slate-300 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <span>あなたの大会</span>
        <span className="text-xs font-normal text-slate-500">（このブラウザに保存）</span>
      </h2>

      {going.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-700">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs text-white">
              ✓
            </span>
            行く（{going.length}）
          </h3>
          <TournamentList tournaments={going} now={now} />
        </div>
      )}

      {interested.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs text-white">
              ★
            </span>
            気になる（{interested.length}）
          </h3>
          <TournamentList tournaments={interested} now={now} />
        </div>
      )}
    </section>
  )
}
