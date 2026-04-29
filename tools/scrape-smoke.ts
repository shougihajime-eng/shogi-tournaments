import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as jsaEvent from '../lib/scrapers/jsa-event'
import * as jsaInfo from '../lib/scrapers/jsa-info'
import * as jsaTournament from '../lib/scrapers/jsa-tournament'
import * as amarenCoocan from '../lib/scrapers/amaren-coocan'
import * as amarenRsys from '../lib/scrapers/amaren-rsys'

const root = resolve(__dirname, '..')

const cases = [
  { id: 'jsa-event', fixture: 'tests/fixtures/jsa-event/list.html', parse: jsaEvent.parse },
  { id: 'jsa-info', fixture: 'tests/fixtures/jsa-info/list.html', parse: jsaInfo.parse },
  { id: 'jsa-tournament', fixture: 'tests/fixtures/jsa-tournament/list.html', parse: jsaTournament.parse },
  { id: 'amaren-coocan', fixture: 'tests/fixtures/amaren-coocan/list.html', parse: amarenCoocan.parse },
  { id: 'amaren-rsys', fixture: 'tests/fixtures/amaren-rsys/list.html', parse: amarenRsys.parse }
]

for (const c of cases) {
  const html = readFileSync(resolve(root, c.fixture), 'utf-8')
  const items = c.parse(html)
  console.log(`\n=== ${c.id} (${items.length} items) ===`)
  for (const it of items.slice(0, 3)) {
    console.log(`  - ${it.title}`)
    console.log(`    date_text: ${it.event_date_text}`)
    console.log(`    date_start: ${it.event_date_start}`)
    console.log(`    location: ${it.location}`)
    console.log(`    prefecture: ${it.prefecture}`)
    console.log(`    detail_url: ${it.detail_url}`)
  }
  if (items.length > 3) console.log(`  ... +${items.length - 3} more`)
}
