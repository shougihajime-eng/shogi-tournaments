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
    <footer className="relative mt-16 overflow-hidden border-t border-shogi-900/30 bg-header-deep text-koma-100">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gold-line" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 text-sm sm:grid-cols-3">
          <div>
            <h2 className="font-serif text-base font-bold text-white">
              <span className="text-kin-400">▲</span> 将棋大会ナビについて
            </h2>
            <p className="mt-2.5 leading-relaxed text-koma-200">
              日本将棋連盟・日本アマチュア将棋連盟の公式ページから、大人が参加できる大会情報を毎日自動で集めています。
            </p>
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-white">
              <span className="text-kin-400">▲</span> 情報元
            </h2>
            <ul className="mt-2.5 space-y-2">
              <li>
                <a
                  href="https://www.shogi.or.jp/event/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-koma-200 transition-colors hover:text-kin-400 hover:underline"
                >
                  日本将棋連盟（イベント）
                </a>
              </li>
              <li>
                <a
                  href="https://www.shogi.or.jp/tournament/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-koma-200 transition-colors hover:text-kin-400 hover:underline"
                >
                  日本将棋連盟（大会）
                </a>
              </li>
              <li>
                <a
                  href="https://amaren.la.coocan.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-koma-200 transition-colors hover:text-kin-400 hover:underline"
                >
                  日本アマチュア将棋連盟
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-white">
              <span className="text-kin-400">▲</span> 更新情報
            </h2>
            <p className="mt-2.5 leading-relaxed text-koma-200">
              毎日 06:00（JST）に自動で最新情報を取得しています。
            </p>
            <p className="mt-2 text-xs tabular-nums text-koma-300">
              最終更新: {formatTimestamp(lastUpdatedAt)}
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-shogi-700/40 pt-5 text-xs text-koma-300">
          掲載情報の正確性については各大会公式ページで必ずご確認ください。
        </div>
      </div>
    </footer>
  )
}
