import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-shogi-50">
        <span aria-hidden className="font-serif text-2xl font-bold text-shogi-800">
          ?
        </span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-ink-900 sm:text-4xl">
        ページが見つかりません
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        URLが間違っているか、ページが移動・削除された可能性があります。
      </p>
      <Link href="/" className="btn-primary mt-6">
        トップへ戻る
      </Link>
    </main>
  )
}
