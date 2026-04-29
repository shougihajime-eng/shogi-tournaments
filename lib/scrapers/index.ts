import type { ScrapeOutcome } from './types'
import * as jsaEvent from './jsa-event'
import * as jsaInfo from './jsa-info'
import * as jsaTournament from './jsa-tournament'
import * as amarenCoocan from './amaren-coocan'
import * as amarenRsys from './amaren-rsys'

export const SCRAPERS = [
  { id: 'jsa-event', source: 'jsa' as const, scrape: jsaEvent.scrape },
  { id: 'jsa-info', source: 'jsa' as const, scrape: jsaInfo.scrape },
  { id: 'jsa-tournament', source: 'jsa' as const, scrape: jsaTournament.scrape },
  { id: 'amaren-coocan', source: 'amaren' as const, scrape: amarenCoocan.scrape },
  { id: 'amaren-rsys', source: 'amaren' as const, scrape: amarenRsys.scrape }
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
