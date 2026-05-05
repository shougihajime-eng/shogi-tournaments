// キーボードユーザー向けの「メインコンテンツへスキップ」リンク。Tab を押すと表示される。
export function SkipLink() {
  return (
    <a
      href="#main"
      className="absolute left-2 top-2 z-50 -translate-y-20 rounded-md bg-shogi-900 px-4 py-2 text-sm font-semibold text-white shadow-elevated transition-transform focus:translate-y-0"
    >
      メインコンテンツへスキップ
    </a>
  )
}
