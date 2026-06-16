import type { ScrapedTournament } from '@/lib/scrapers/types'
import { parseNewsList, scrapeNews } from '@/lib/scrapers/jsa-news'

// 2026-06-16 連盟サイトリニューアル後：旧 /event/ はAlpine.jsのJS描画になり
// fetch+cheerio ではイベントデータが1件も取れない。
// イベントお知らせは /news/?cat=event に静的で載るのでこちらを取り込む。
export const SOURCE_URL = 'https://www.shogi.or.jp/news/?cat=event'

export function parse(html: string): ScrapedTournament[] {
  return parseNewsList(html, SOURCE_URL)
}

export async function scrape(): Promise<ScrapedTournament[]> {
  return scrapeNews(SOURCE_URL)
}
