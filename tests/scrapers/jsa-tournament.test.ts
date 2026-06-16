import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from '@/lib/scrapers/jsa-tournament'

const html = readFileSync(resolve(__dirname, '../fixtures/jsa-tournament/index.html'), 'utf-8')

describe('jsa-tournament scraper（2026-06-16 新サイト /event/tournament/）', () => {
  const items = parse(html)

  it('大会カードを1件以上抽出する', () => {
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('全アイテムが必須フィールドを持つ', () => {
    for (const t of items) {
      expect(t.title).toBeTruthy()
      expect(t.detail_url).toMatch(/^https:\/\/www\.shogi\.or\.jp\/event\/tournament\/[a-z0-9_-]+\/$/i)
      expect(t.source).toBe('jsa')
      expect(t.external_id).toMatch(/^[0-9a-f]{16}$/)
    }
  })

  it('external_id が重複しない', () => {
    const ids = items.map(t => t.external_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('説明文に開催日があるカードは日付をISOに変換する', () => {
    const high = items.find(t => t.title.includes('高校生王将戦'))
    expect(high).toBeDefined()
    expect(high?.event_date_start).toMatch(/-08-12$/) // 「8月12日に開催」
  })

  it('全日本アマチュア将棋名人戦のカードを取り込む', () => {
    expect(items.some(t => t.title.includes('全日本アマチュア将棋名人戦'))).toBe(true)
  })
})
