'use client'

import { useEffect, useState } from 'react'
import { REACTION_CHANGED_EVENT, readReactions } from '@/lib/reactions'

export function MyListLink() {
  const [count, setCount] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const sync = () => {
      const store = readReactions()
      setCount(Object.keys(store).length)
    }
    sync()
    setHydrated(true)
    window.addEventListener(REACTION_CHANGED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(REACTION_CHANGED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!hydrated) {
    // SSR と一致するために常に同じものを返す（数値だけ後で出す）
    return null
  }

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('my-tournaments')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href="#my-tournaments"
      onClick={onClick}
      aria-label={`あなたの保存: ${count}件。タップで「あなたの大会」セクションへ`}
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ' +
        (count > 0
          ? 'bg-interest-100 text-interest-700 ring-1 ring-interest-500/40 hover:bg-interest-200'
          : 'bg-white/10 text-koma-200 hover:bg-white/20')
      }
    >
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill={count > 0 ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.05 3.93a1 1 0 011.9 0l1.36 4.18a1 1 0 00.95.69h4.4a1 1 0 01.59 1.81l-3.56 2.59a1 1 0 00-.36 1.12l1.36 4.18a1 1 0 01-1.54 1.12L10.59 17a1 1 0 00-1.18 0l-3.56 2.62a1 1 0 01-1.54-1.12l1.36-4.18a1 1 0 00-.36-1.12L1.75 10.6a1 1 0 01.59-1.81h4.4a1 1 0 00.95-.69l1.36-4.18z"
        />
      </svg>
      {count > 0 ? `保存 ${count}件` : '保存なし'}
    </a>
  )
}
