import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseList, parseDetail, buildItem } from '@/lib/scrapers/jsa-store'

const listHtml = readFileSync(resolve(__dirname, '../fixtures/jsa-store/list.html'), 'utf-8')
const itemHtml = readFileSync(resolve(__dirname, '../fixtures/jsa-store/item.html'), 'utf-8')

describe('jsa-store scraper（公式サイト停止中の臨時取り込み）', () => {
  const entries = parseList(listHtml)

  it('大会申し込み一覧から10件以上抽出する', () => {
    expect(entries.length).toBeGreaterThanOrEqual(10)
  })

  it('一覧の各項目がタイトルとURLを持つ・重複しない', () => {
    for (const e of entries) {
      expect(e.title).toBeTruthy()
      expect(e.detailUrl).toMatch(/^https:\/\/store\.shogi\.or\.jp\/view\/item\/[0-9A-Za-z_-]+$/)
    }
    const codes = entries.map(e => e.itemCode)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('詳細ページから日程・会場・申込期間・参加資格・メールを抽出する', () => {
    const d = parseDetail(itemHtml)
    expect(d.dateLine).toContain('令和8年7月5日')
    expect(d.locationLine).toContain('共和会館')
    expect(d.deadlineLine).toContain('5月26日')
    expect(d.eligibilityLine).toContain('東京23区内在住')
    expect(d.contactEmail).toBe('fukyu@shogi.or.jp')
  })

  it('buildItem が日付をISOに変換し、申込期間の終わりを締切にする', () => {
    const entry = {
      title: '【一般】第80回全日本アマチュア将棋名人戦 東京23区予選【7月5日開催】',
      detailUrl: 'https://store.shogi.or.jp/view/item/000000003749',
      itemCode: '000000003749'
    }
    const item = buildItem(entry, parseDetail(itemHtml))
    expect(item.event_date_start).toBe('2026-07-05') // 令和8年7月5日
    expect(item.application_deadline).toBe('2026-06-26') // 申込期間 5/26〜6/26 の終わり
    expect(item.prefecture).toBe('東京都')
    expect(item.source).toBe('jsa')
    expect(item.external_id).toMatch(/^[0-9a-f]{16}$/)
    expect(item.application_url).toBe(entry.detailUrl)
  })

  it('詳細が読めなくても一覧の情報だけで登録できる（タイトルから日付を拾う）', () => {
    const entry = {
      title: '【東京都予選】第47回全国中学生選抜将棋選手権大会【6月14日(日)開催】',
      detailUrl: 'https://store.shogi.or.jp/view/item/000000003728',
      itemCode: '000000003728'
    }
    const empty = {
      description: null,
      dateLine: null,
      locationLine: null,
      deadlineLine: null,
      eligibilityLine: null,
      contactEmail: null
    }
    const item = buildItem(entry, empty)
    expect(item.title).toBe(entry.title)
    expect(item.event_date_start).toMatch(/-06-14$/) // タイトルの「6月14日」から
  })
})
