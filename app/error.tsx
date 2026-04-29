'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">エラーが発生しました</h1>
      <p className="mt-2 text-sm text-slate-600">
        ページの読み込み中に問題が発生しました。時間をおいて再度お試しください。
      </p>
      {error.message && (
        <pre className="mt-4 overflow-auto rounded-md bg-slate-100 p-3 text-xs text-slate-700">{error.message}</pre>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        再読み込み
      </button>
    </main>
  )
}
