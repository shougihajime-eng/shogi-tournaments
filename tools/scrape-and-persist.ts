import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(__dirname, '..', '.env.local') })

async function main() {
  const { scrapeAll } = await import('../lib/scrapers/index')
  const { persistAll } = await import('../lib/scrapers/persist')

  console.log('Scraping all sources...')
  const outcomes = await scrapeAll()
  for (const o of outcomes) {
    console.log(`  ${o.scraperId}: ${o.items.length} items, ${o.errors.length} errors`)
    for (const e of o.errors) console.log(`    ERROR: ${e.message}`)
  }

  console.log('Persisting to Supabase...')
  const results = await persistAll(outcomes)
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const id = outcomes[i]?.scraperId ?? r.source
    console.log(`  ${id}: status=${r.status} found=${r.items_found} inserted=${r.items_inserted} updated=${r.items_updated} excluded=${r.items_excluded}`)
    if (r.error_message) console.log(`    error: ${r.error_message}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
