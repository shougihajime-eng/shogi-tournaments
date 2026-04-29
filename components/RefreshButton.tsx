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
      setStatus({ kind: 'success', message: '更新しました' })
      startTransition(() => router.refresh())
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : '通信エラー' })
    } finally {
      setLoading(false)
    }
  }

  const busy = loading || isPending
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? '更新中…' : '今すぐ更新'}
      </button>
      {status.kind === 'success' && <span className="text-xs text-emerald-700">{status.message}</span>}
      {status.kind === 'error' && <span className="text-xs text-deadline">{status.message}</span>}
    </div>
  )
}
