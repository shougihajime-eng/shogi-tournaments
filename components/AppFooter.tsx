function formatTimestamp(iso: string | null): string {
  if (!iso) return '未取得'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AppFooter({ lastUpdatedAt }: { lastUpdatedAt: string | null }) {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 text-sm text-ink-600 sm:grid-cols-3">
          <div>
            <h2 className="font-serif text-base font-bold text-ink-900">将棋大会ナビについて</h2>
            <p className="mt-2 leading-relaxed text-ink-600">
              日本将棋連盟・日本アマチュア将棋連盟の公式ページから、大人が参加できる大会情報を毎日自動で集めています。
            </p>
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-ink-900">情報元</h2>
            <ul className="mt-2 space-y-1.5">
              <li>
                <a
                  href="https://www.shogi.or.jp/event/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shogi-700 hover:text-shogi-900 hover:underline"
                >
                  日本将棋連盟（イベント）
                </a>
              </li>
              <li>
                <a
                  href="https://www.shogi.or.jp/tournament/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shogi-700 hover:text-shogi-900 hover:underline"
                >
                  日本将棋連盟（大会）
                </a>
              </li>
              <li>
                <a
                  href="https://amaren.la.coocan.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shogi-700 hover:text-shogi-900 hover:underline"
                >
                  日本アマチュア将棋連盟
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-ink-900">更新情報</h2>
            <p className="mt-2 leading-relaxed text-ink-600">
              毎日 06:00（JST）に自動で最新情報を取得しています。
            </p>
            <p className="mt-2 text-xs tabular-nums text-ink-500">
              最終更新: {formatTimestamp(lastUpdatedAt)}
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-ink-100 pt-4 text-xs text-ink-400">
          掲載情報の正確性については各大会公式ページで必ずご確認ください。
        </div>
      </div>
    </footer>
  )
}
