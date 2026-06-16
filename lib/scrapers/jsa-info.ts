import type { ScrapedTournament } from '@/lib/scrapers/types'
import { parseNewsList, scrapeNews } from '@/lib/scrapers/jsa-news'

// 2026-06-16 連盟サイトリニューアル後：旧 /event/info/ は404廃止。
// 大会お知らせは /news/?cat=taikai に移行したのでこちらを取り込む。
export const SOURCE_URL = 'https://www.shogi.or.jp/news/?cat=taikai'

export function parse(html: string): ScrapedTournament[] {
  return parseNewsList(html, SOURCE_URL)
}

export async function scrape(): Promise<ScrapedTournament[]> {
  return scrapeNews(SOURCE_URL)
}
