import type { MetadataRoute } from 'next'

// スマホの「ホーム画面に追加」で、本物のアプリのように全画面で開くための設定
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '将棋大会｜大会・イベント情報',
    short_name: '将棋大会',
    description:
      '大人が参加できる将棋大会・イベントの開催日・場所・申込みを毎日自動で集めて一覧で見られます。',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#102A43',
    theme_color: '#102A43',
    lang: 'ja',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
