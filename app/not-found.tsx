import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-slate-600">URLをご確認ください。</p>
      <Link href="/" className="mt-6 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
        トップへ戻る
      </Link>
    </main>
  )
}
