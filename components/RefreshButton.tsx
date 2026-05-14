'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Status = { kind: 'idle' } | { kind: 'success'; message: string } | { kind: 'error'; message: string }

export function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onClick() {
    setLoading(true)
    setStatus({ kind: 'idle' })
    try {
      const res = await fetch('/api/refresh', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`
        setStatus({ kind: 'error', message })
        return
      }
      setStatus({ kind: 'success', message: '最新の情報を取得しました' })
      startTransition(() => router.refresh())
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : '通信エラー' })
    } finally {
      setLoading(false)
    }
  }

  const busy = loading || isPending
  return (
    <div className="flex items-center gap-2">
      {status.kind === 'success' && (
        <span aria-live="polite" className="hidden text-xs font-semibold text-going-700 sm:inline">
          ✓ {status.message}
        </span>
      )}
      {status.kind === 'error' && (
        <span aria-live="polite" className="hidden text-xs font-semibold text-deadline-700 sm:inline">
          {status.message}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label={busy ? '更新中' : '最新情報を取得'}
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-koma-300/50 bg-white/10 px-4 py-2.5 text-sm font-semibold text-koma-100 backdrop-blur transition-colors hover:bg-white/20 hover:text-white active:bg-white/25 disabled:cursor-progress disabled:opacity-60"
      >
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={busy ? 'animate-spin' : ''}
        >
          <path d="M4 9.5A6 6 0 0114.7 5L17 7M16 10.5A6 6 0 015.3 15L3 13M17 3v4h-4M3 17v-4h4" />
        </svg>
        {busy ? '更新中…' : '更新'}
      </button>
    </div>
  )
}
