'use client'
import { useEffect, useState } from 'react'
import type { Tournament } from '@/lib/types/tournament'
import { TournamentList } from '@/components/TournamentList'
import { REACTION_CHANGED_EVENT, type ReactionStore, readReactions, writeReactions } from '@/lib/reactions'

export function MyTournamentsSection({ tournaments, now }: { tournaments: Tournament[]; now: Date }) {
  const [store, setStore] = useState<ReactionStore>({})
  const [hydrated, setHydrated] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

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
  const total = going.length + interested.length
  if (total === 0) return null

  const clearAll = () => {
    if (typeof window === 'undefined') return
    if (!window.confirm('保存した「行く」「気になる」をすべて解除します。よろしいですか？')) return
    writeReactions({})
  }

  return (
    <section
      aria-label="あなたが選んだ大会"
      className="mb-8 overflow-hidden rounded-xl border border-shogi-200 bg-gradient-to-br from-shogi-50 via-white to-white shadow-card"
    >
      <header className="flex items-center justify-between gap-3 border-b border-shogi-100 bg-white/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-shogi-800 font-serif text-sm font-bold text-white">
            ★
          </span>
          <div>
            <h2 className="font-serif text-lg font-bold text-ink-900">あなたの大会</h2>
            <p className="text-xs text-ink-500">
              {total}件保存中・このブラウザに保存
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            aria-expanded={!collapsed}
            className="btn-ghost text-xs"
          >
            {collapsed ? '開く' : '閉じる'}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="btn-ghost text-xs text-ink-500 hover:text-deadline-700"
          >
            すべて解除
          </button>
        </div>
      </header>

      {!collapsed && (
        <div className="space-y-6 p-5">
          {going.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-going-700">
                <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-going-600 text-xs text-white">
                  ✓
                </span>
                行く（{going.length}）
              </h3>
              <TournamentList tournaments={going} now={now} />
            </div>
          )}

          {interested.length > 0 && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-interest-700">
                <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-interest-500 text-xs text-white">
                  ★
                </span>
                気になる（{interested.length}）
              </h3>
              <TournamentList tournaments={interested} now={now} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
