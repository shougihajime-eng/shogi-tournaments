import { describe, it, expect } from 'vitest'
import { dedupeTournaments, __test } from '@/lib/utils/dedupe'
import type { Tournament } from '@/lib/types/tournament'

function makeT(over: Partial<Tournament>): Tournament {
  return {
    id: 'id-' + Math.random().toString(36).slice(2, 8),
    source: 'jsa',
    source_url: 'https://example.com',
    external_id: 'ext',
    title: 'タイトル',
    description: null,
    event_date_start: null,
    event_date_end: null,
    event_date_text: null,
    location: null,
    prefecture: null,
    region: null,
    eligibility: null,
    application_deadline: null,
    application_deadline_text: null,
    application_url: null,
    ticket_url: null,
    contact_email: null,
    detail_url: 'https://example.com/detail',
    is_excluded: false,
    excluded_reason: null,
    first_seen_at: '2026-01-01T00:00:00Z',
    last_seen_at: '2026-01-01T00:00:00Z',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...over
  }
}

describe('normalizeTitle', () => {
  const n = __test.normalizeTitle
  it('removes 第N回 prefix', () => {
    expect(n('第3回 将棋まつり')).toBe(n('第5回 将棋まつり'))
  })
  it('removes 西暦', () => {
    expect(n('将棋フェス2026')).toBe(n('将棋フェス2025'))
  })
  it('removes parentheticals', () => {
    expect(n('将棋大会（東京）')).toBe(n('将棋大会(東京)'))
  })
  it('treats half/full-width and spacing same', () => {
    expect(n('東竜門　新四段')).toBe(n('東竜門 新四段'))
  })
})

describe('dedupeTournaments', () => {
  it('keeps unique tournaments untouched', () => {
    const list = [
      makeT({ id: 'a', title: '将棋大会A', event_date_start: '2026-06-01' }),
      makeT({ id: 'b', title: '将棋大会B', event_date_start: '2026-06-02' })
    ]
    expect(dedupeTournaments(list)).toHaveLength(2)
  })

  it('merges duplicates with same title and date across sources', () => {
    const list = [
      makeT({
        id: 'a',
        source: 'amaren',
        title: '東竜門新四段戦',
        event_date_start: '2026-06-01'
      }),
      makeT({
        id: 'b',
        source: 'jsa',
        title: '東竜門新四段戦',
        event_date_start: '2026-06-01',
        application_url: 'https://example.com/apply'
      })
    ]
    const result = dedupeTournaments(list)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('b') // jsa & application_urlあり が選ばれる
  })

  it('merges duplicates with 第N回 / 西暦 differences when date matches', () => {
    const list = [
      makeT({ id: 'a', title: '第50回将棋まつり', event_date_start: '2026-05-03' }),
      makeT({ id: 'b', title: '第51回将棋まつり', event_date_start: '2026-05-03' })
    ]
    expect(dedupeTournaments(list)).toHaveLength(1)
  })

  it('does NOT merge when dates differ', () => {
    const list = [
      makeT({ id: 'a', title: 'マイナビ女子オープン', event_date_start: '2026-05-03' }),
      makeT({ id: 'b', title: 'マイナビ女子オープン', event_date_start: '2026-06-03' })
    ]
    expect(dedupeTournaments(list)).toHaveLength(2)
  })

  it('picks the entry with more details when dates both null', () => {
    const list = [
      makeT({ id: 'a', title: '将棋フェス', description: null }),
      makeT({
        id: 'b',
        title: '将棋フェス',
        description: 'たっぷりした説明文章で20文字を余裕で超える',
        application_url: 'https://example.com/x'
      })
    ]
    const result = dedupeTournaments(list)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('b')
  })

  it('does not group when normalized title is too short', () => {
    const list = [
      makeT({ id: 'a', title: '大会', event_date_start: '2026-06-01' }),
      makeT({ id: 'b', title: '大会', event_date_start: '2026-06-01' })
    ]
    // 短すぎる title は重複判定しない
    expect(dedupeTournaments(list)).toHaveLength(2)
  })
})
