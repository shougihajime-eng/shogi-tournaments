import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { parse } from '@/lib/scrapers/jsa-event'

const html = readFileSync(resolve(__dirname, '../fixtures/jsa-event/list.html'), 'utf-8')

describe('jsa-event scraper（2026-06-16 /event/ の _eventData 解析・正確な開催日つき）', () => {
  const items = parse(html)

  it('イベントを1件以上抽出する', () => {
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('全アイテムが必須フィールドを持つ', () => {
    for (const t of items) {
      expect(t.title).toBeTruthy()
      expect(t.detail_url).toMatch(/^https:\/\/www\.shogi\.or\.jp\//)
      expect(t.source).toBe('jsa')
      expect(t.external_id).toMatch(/^[0-9a-f]{16}$/)
    }
  })

  it('event_date_start が実日付(YYYY-MM-DD)で取れている', () => {
    const dated = items.filter(t => t.event_date_start)
    expect(dated.length).toBeGreaterThanOrEqual(1)
    for (const t of dated) {
      expect(t.event_date_start).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(t.event_date_end).toBe(t.event_date_start) // 単日イベント
    }
  })

  it('会場(location)は _eventData に無いので必ず null（推測しない）', () => {
    for (const t of items) {
      expect(t.location).toBeNull()
    }
  })

  it('external_id が重複しない', () => {
    const ids = items.map(t => t.external_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('/news/view.php?id= を指すイベントの external_id は jsa-news と同じ採番（DBで1行に収れん）', () => {
    const newsItem = items.find(t => /\/news\/view\.php\?id=(\d{8}-\d+)/.test(t.detail_url))
    expect(newsItem).toBeDefined()
    const m = newsItem!.detail_url.match(/\/news\/view\.php\?id=(\d{8}-\d+)/)!
    const expected = createHash('sha1').update(`jsa-news|${m[1]}`).digest('hex').slice(0, 16)
    expect(newsItem!.external_id).toBe(expected)
  })
})
