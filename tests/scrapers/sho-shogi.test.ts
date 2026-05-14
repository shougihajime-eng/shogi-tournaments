import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from '@/lib/scrapers/sho-shogi'

const html = readFileSync(resolve(__dirname, '../fixtures/sho-shogi/top.html'), 'utf-8')

describe('sho-shogi scraper', () => {
  const items = parse(html)

  it('トップページから記事を1件以上抽出する', () => {
    expect(items.length).toBeGreaterThan(0)
  })

  it('日付・場所が一定割合で正しく抽出される', () => {
    const withDate = items.filter(t => t.event_date_start).length
    const withLocation = items.filter(t => t.location).length
    expect(withDate / items.length).toBeGreaterThanOrEqual(0.5)
    expect(withLocation / items.length).toBeGreaterThanOrEqual(0.5)
  })

  it('全アイテムが必須フィールドを持つ', () => {
    for (const t of items) {
      expect(t.title).toBeTruthy()
      expect(t.detail_url).toMatch(/^https?:\/\//)
      expect(t.source).toBe('sho-shogi')
      expect(t.external_id).toMatch(/^[0-9a-f]{16}$/)
    }
  })

  it('detail_url がブログ記事のパターンと一致', () => {
    for (const t of items) {
      expect(t.detail_url).toMatch(/sho-shogi\.blogspot\.com\/\d{4}\/\d{2}\//)
    }
  })

  it('external_id が重複しない', () => {
    const ids = items.map(t => t.external_id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
