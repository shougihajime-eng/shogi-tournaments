import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseNewsList } from '@/lib/scrapers/jsa-news'

const taikai = readFileSync(resolve(__dirname, '../fixtures/jsa-news/taikai.html'), 'utf-8')
const event = readFileSync(resolve(__dirname, '../fixtures/jsa-news/event.html'), 'utf-8')

describe('jsa-news 共通パーサ（2026-06-16 新サイト /news/）', () => {
  const taikaiItems = parseNewsList(taikai, 'https://www.shogi.or.jp/news/?cat=taikai')
  const eventItems = parseNewsList(event, 'https://www.shogi.or.jp/news/?cat=event')

  it('大会お知らせ(cat=taikai)を1件以上抽出する', () => {
    expect(taikaiItems.length).toBeGreaterThanOrEqual(1)
  })

  it('イベントお知らせ(cat=event)を1件以上抽出する', () => {
    expect(eventItems.length).toBeGreaterThanOrEqual(1)
  })

  it('全アイテムがタイトル・記事URL・IDを持つ', () => {
    for (const t of [...taikaiItems, ...eventItems]) {
      expect(t.title).toBeTruthy()
      expect(t.title).not.toMatch(/^\d{4}\/\d{1,2}\/\d{1,2}$/) // 掲載日をタイトルにしない
      expect(t.detail_url).toMatch(/^https:\/\/www\.shogi\.or\.jp\/news\/view\.php\?id=\d{8}-\d+$/)
      expect(t.source).toBe('jsa')
      expect(t.external_id).toMatch(/^[0-9a-f]{16}$/)
    }
  })

  it('external_id が重複しない（一覧内）', () => {
    const ids = taikaiItems.map(t => t.external_id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('代表的な大会お知らせのタイトルが取れている', () => {
    expect(taikaiItems.some(t => t.title.includes('将棋大会'))).toBe(true)
  })
})
