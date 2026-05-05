'use client'
import { useEffect, useState } from 'react'
import { REACTION_CHANGED_EVENT, readReactions } from '@/lib/reactions'

const DISMISS_KEY = 'shogi-onboard-dismissed:v1'

export function OnboardingHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => {
      try {
        if (window.localStorage.getItem(DISMISS_KEY) === '1') {
          setShow(false)
          return
        }
        const store = readReactions()
        setShow(Object.keys(store).length === 0)
      } catch {
        setShow(false)
      }
    }
    check()
    window.addEventListener(REACTION_CHANGED_EVENT, check)
    return () => window.removeEventListener(REACTION_CHANGED_EVENT, check)
  }, [])

  if (!show) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setShow(false)
  }

  return (
    <aside className="mb-6 rounded-xl border border-shogi-200 bg-shogi-50/60 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shogi-800 text-sm font-bold text-white">
          ?
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-base font-bold text-shogi-900">
            気になった大会は「行く」「気になる」をタップ
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-700">
            各カードの右下にある2つのボタンで、行く予定の大会・気になる大会を分けて記録できます。マークした大会はこのページの一番上に集まり、後から探しやすくなります。
          </p>
          <p className="mt-2 text-xs text-ink-500">
            ※ お使いのブラウザに保存されます（アカウント登録は不要）
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="このヒントを閉じる"
          className="-mr-1 -mt-1 rounded-md p-1.5 text-ink-400 hover:bg-white hover:text-ink-700"
        >
          <svg aria-hidden width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 11-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 11-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
