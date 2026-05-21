import { describe, it, expect } from 'vitest'
import { evaluateEntryType } from '@/lib/filters/entry-type'

function t(over: Partial<{
  title: string
  description: string | null
  eligibility: string | null
  application_url: string | null
  application_deadline: string | null
}>) {
  return {
    title: '将棋大会',
    description: null,
    eligibility: null,
    application_url: null,
    application_deadline: null,
    ...over
  }
}

describe('evaluateEntryType', () => {
  it('returns pre when application_deadline is set', () => {
    expect(evaluateEntryType(t({ application_deadline: '2026-06-30' })).type).toBe('pre')
  })

  it('returns pre when application_url is set', () => {
    expect(evaluateEntryType(t({ application_url: 'https://example.com/apply' })).type).toBe('pre')
  })

  it('returns walkin when description says 当日受付', () => {
    expect(evaluateEntryType(t({ description: '当日受付OKです' })).type).toBe('walkin')
  })

  it('returns walkin when description says 予約不要', () => {
    expect(evaluateEntryType(t({ description: '予約不要で参加できます' })).type).toBe('walkin')
  })

  it('returns both when both signals present', () => {
    expect(
      evaluateEntryType(
        t({
          description: '事前申込もできますが、当日参加も可能です',
          application_deadline: '2026-06-30'
        })
      ).type
    ).toBe('both')
  })

  it('returns null when no signals', () => {
    expect(evaluateEntryType(t({ description: '楽しい大会です' })).type).toBeNull()
  })

  it('detects 事前申込必須', () => {
    expect(evaluateEntryType(t({ description: '事前申込必須' })).type).toBe('pre')
  })
})
