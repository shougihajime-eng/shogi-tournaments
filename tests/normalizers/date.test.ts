import { describe, it, expect } from 'vitest'
import { looksLikeDateText, parseDate } from '@/lib/normalizers/date'

describe('parseDate', () => {
  describe('single date formats', () => {
    it('parses 2026/5/3', () => {
      const result = parseDate('2026/5/3')
      expect(result.start).toBe('2026-05-03')
      expect(result.end).toBeNull()
    })

    it('parses 2026-5-3', () => {
      const result = parseDate('2026-5-3')
      expect(result.start).toBe('2026-05-03')
    })

    it('parses 2026年5月3日', () => {
      const result = parseDate('2026年5月3日')
      expect(result.start).toBe('2026-05-03')
    })

    it('parses 令和8年5月3日 as 2026-05-03', () => {
      const result = parseDate('令和8年5月3日')
      expect(result.start).toBe('2026-05-03')
    })

    it('parses 令和元年5月1日 as 2019-05-01', () => {
      const result = parseDate('令和元年5月1日')
      expect(result.start).toBe('2019-05-01')
    })
  })

  describe('non-date / unparseable', () => {
    it('returns null start for 5月上旬, retains text', () => {
      const result = parseDate('5月上旬')
      expect(result.start).toBeNull()
      expect(result.text).toBe('5月上旬')
    })

    it('returns null start for 未定', () => {
      const result = parseDate('未定')
      expect(result.start).toBeNull()
    })

    it('returns null/empty for empty string', () => {
      const result = parseDate('')
      expect(result.start).toBeNull()
      expect(result.text).toBe('')
    })

    it('returns null/empty for null input', () => {
      const result = parseDate(null)
      expect(result.start).toBeNull()
      expect(result.text).toBe('')
    })
  })

  describe('range formats', () => {
    it('parses 5/3〜5/5 with currentYear=2026', () => {
      const result = parseDate('5/3〜5/5', 2026)
      expect(result.start).toBe('2026-05-03')
      expect(result.end).toBe('2026-05-05')
    })

    it('parses 2026/5/3〜5/5', () => {
      const result = parseDate('2026/5/3〜5/5')
      expect(result.start).toBe('2026-05-03')
      expect(result.end).toBe('2026-05-05')
    })

    it('parses 2026/5/3 〜 2026/5/5', () => {
      const result = parseDate('2026/5/3 〜 2026/5/5')
      expect(result.start).toBe('2026-05-03')
      expect(result.end).toBe('2026-05-05')
    })
  })

  describe('invalid dates', () => {
    it('returns null start for 2026/2/30 (invalid day)', () => {
      const result = parseDate('2026/2/30')
      expect(result.start).toBeNull()
    })

    it('returns null start for 2026/13/1 (invalid month)', () => {
      const result = parseDate('2026/13/1')
      expect(result.start).toBeNull()
    })
  })

  describe('NFKC normalization', () => {
    it('parses full-width digits ２０２６／５／３', () => {
      const result = parseDate('２０２６／５／３')
      expect(result.start).toBe('2026-05-03')
    })
  })

  describe('phone-number-like strings are rejected', () => {
    it('returns null for 0880-9-68 (looks like phone area code)', () => {
      const result = parseDate('0880-9-68')
      expect(result.start).toBeNull()
      expect(result.end).toBeNull()
    })

    it('returns null for 0880-9-6 (4-digit year out of range)', () => {
      const result = parseDate('0880-9-6')
      expect(result.start).toBeNull()
    })

    it('returns null for 0120-456-789 (toll-free pattern)', () => {
      const result = parseDate('0120-456-789')
      expect(result.start).toBeNull()
    })

    it('returns null for year 1899 (too old)', () => {
      const result = parseDate('1899-5-3')
      expect(result.start).toBeNull()
    })

    it('returns null for year 2200 (too far future)', () => {
      const result = parseDate('2200-5-3')
      expect(result.start).toBeNull()
    })
  })
})

describe('looksLikeDateText', () => {
  it('returns true for 月 / 日 / 年 keywords', () => {
    expect(looksLikeDateText('5月上旬')).toBe(true)
    expect(looksLikeDateText('2026年内')).toBe(true)
    expect(looksLikeDateText('未定')).toBe(true)
    expect(looksLikeDateText('第3週')).toBe(true)
    expect(looksLikeDateText('第二週')).toBe(true)
  })

  it('returns false for phone-number-like strings', () => {
    expect(looksLikeDateText('0880-9-68')).toBe(false)
    expect(looksLikeDateText('03-1234-5678')).toBe(false)
    expect(looksLikeDateText('')).toBe(false)
    expect(looksLikeDateText(null)).toBe(false)
  })
})
