'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-deadline-50">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-deadline-600">
          <path d="M12 9v3m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
      </div>
      <h1 className="font-serif text-2xl font-bold text-ink-900 sm:text-3xl">
        ページの読み込みに失敗しました
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        一時的な問題が起きている可能性があります。
        <br className="hidden sm:inline" />
        時間をおいて、再度お試しください。
      </p>
      {error.message && (
        <details className="mt-4 w-full max-w-lg">
          <summary className="cursor-pointer text-xs text-ink-500 hover:text-ink-700">
            エラー詳細
          </summary>
          <pre className="mt-2 overflow-auto rounded-md bg-ink-100 p-3 text-left text-xs text-ink-700">
            {error.message}
            {error.digest && `\n[${error.digest}]`}
          </pre>
        </details>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          もう一度ためす
        </button>
        <a href="/" className="btn-secondary">
          トップへ戻る
        </a>
      </div>
    </main>
  )
}
