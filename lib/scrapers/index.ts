import type { ScrapeOutcome } from './types'
import * as jsaEvent from './jsa-event'
import * as jsaInfo from './jsa-info'
import * as jsaTournament from './jsa-tournament'
import * as amarenCoocan from './amaren-coocan'
import * as amarenRsys from './amaren-rsys'
import * as shoShogi from './sho-shogi'
import * as jsaStore from './jsa-store'

export const SCRAPERS = [
  { id: 'jsa-event', source: 'jsa' as const, scrape: jsaEvent.scrape },
  { id: 'jsa-info', source: 'jsa' as const, scrape: jsaInfo.scrape },
  { id: 'jsa-tournament', source: 'jsa' as const, scrape: jsaTournament.scrape },
  // 【臨時】公式サイト停止中(2026-06-04〜)の代替: 連盟ストアの大会申し込み一覧。
  // 公式が復旧して上3本が動き出したら、この行を消すだけで止められる。
  { id: 'jsa-store', source: 'jsa' as const, scrape: jsaStore.scrape },
  { id: 'amaren-coocan', source: 'amaren' as const, scrape: amarenCoocan.scrape },
  { id: 'amaren-rsys', source: 'amaren' as const, scrape: amarenRsys.scrape },
  { id: 'sho-shogi', source: 'sho-shogi' as const, scrape: shoShogi.scrape }
]

export async function scrapeAll(): Promise<ScrapeOutcome[]> {
  const results: ScrapeOutcome[] = []
  for (const s of SCRAPERS) {
    try {
      const items = await s.scrape()
      results.push({ scraperId: s.id, source: s.source, items, errors: [] })
    } catch (e) {
      results.push({
        scraperId: s.id,
        source: s.source,
        items: [],
        errors: [{ scraperId: s.id, message: String(e) }]
      })
    }
  }
  return results
}
