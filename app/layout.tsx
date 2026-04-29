import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '将棋大会情報',
  description: '日本将棋連盟・アマレンの大人向け大会情報を一覧表示'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
