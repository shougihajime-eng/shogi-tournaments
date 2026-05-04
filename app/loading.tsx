export default function Loading() {
  return (
    <>
      <header className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div className="h-10 w-10 animate-pulse rounded-md bg-ink-200" />
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-ink-200" />
            <div className="h-3 w-56 animate-pulse rounded bg-ink-100" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white shadow-card" />
          ))}
        </div>
        <div className="mb-6 h-12 animate-pulse rounded-xl bg-white shadow-card" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-white shadow-card" />
          ))}
        </div>
      </main>
    </>
  )
}
