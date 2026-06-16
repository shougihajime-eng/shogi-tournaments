import type { ScrapeOutcome } from './types'
import * as jsaEvent from './jsa-event'
import * as jsaInfo from './jsa-info'
import * as jsaTournament from './jsa-tournament'
import * as amarenCoocan from './amaren-coocan'
import * as amarenRsys from './amaren-rsys'
import * as shoShogi from './sho-shogi'
import * as jsaStore from './jsa-store'

export const SCRAPERS = [
  // 2026-06-16 連盟サイトリニューアル後の新ソースに対応:
  //   jsa-event     → /event/ の埋め込み配列 _eventData を解析（正確な開催日つき）
  //   jsa-info      → /news/?cat=taikai（旧 /event/info/ は404廃止）
  //   jsa-tournament→ /event/tournament/（旧 /tournament/ は404）
  { id: 'jsa-event', source: 'jsa' as const, scrape: jsaEvent.scrape },
  { id: 'jsa-info', source: 'jsa' as const, scrape: jsaInfo.scrape },
  { id: 'jsa-tournament', source: 'jsa' as const, scrape: jsaTournament.scrape },
  // 連盟ストアの大会申し込み一覧（store.shogi.or.jp）。公式サイト停止中に追加した補完ソース。
  // 今も生きているので残す（大会の申込ページ・締切が取れる）。
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
