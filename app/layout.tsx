import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Noto_Serif_JP } from 'next/font/google'
import './globals.css'

const sans = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap'
})

const serif = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    default: '将棋大会ナビ — 大人のための大会情報',
    template: '%s | 将棋大会ナビ'
  },
  description:
    '日本将棋連盟・日本アマチュア将棋連盟の公式情報から、大人が参加できる将棋大会を毎日自動収集。東京・関東を中心に開催日・場所・申込みまで一覧で確認できます。',
  keywords: ['将棋', '大会', 'アマチュア', '日本将棋連盟', 'アマレン', 'シニア大会', '段級位', '東京', '関東'],
  authors: [{ name: '将棋大会ナビ' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    title: '将棋大会ナビ',
    description: '大人のための将棋大会を毎日自動収集',
    siteName: '将棋大会ナビ'
  },
  twitter: {
    card: 'summary',
    title: '将棋大会ナビ',
    description: '大人のための将棋大会を毎日自動収集'
  },
  robots: {
    index: true,
    follow: true
  },
  formatDetection: {
    telephone: false
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#102A43'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  )
}
