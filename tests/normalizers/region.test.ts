import { describe, it, expect } from 'vitest'
import { classifyRegion, extractPrefecture } from '@/lib/normalizers/region'

describe('classifyRegion', () => {
  it("returns 'tokyo' for ('東京都', '千代田区将棋会館')", () => {
    expect(classifyRegion('東京都', '千代田区将棋会館')).toBe('tokyo')
  })

  it("returns 'tokyo' for ('東京都', null)", () => {
    expect(classifyRegion('東京都', null)).toBe('tokyo')
  })

  it("returns 'tokyo' for (null, '東京都渋谷区')", () => {
    expect(classifyRegion(null, '東京都渋谷区')).toBe('tokyo')
  })

  it("returns 'kanto' for ('神奈川県', '横浜市')", () => {
    expect(classifyRegion('神奈川県', '横浜市')).toBe('kanto')
  })

  it("returns 'kanto' for ('千葉県', null)", () => {
    expect(classifyRegion('千葉県', null)).toBe('kanto')
  })

  it("returns 'kanto' for ('埼玉県', 'さいたま市')", () => {
    expect(classifyRegion('埼玉県', 'さいたま市')).toBe('kanto')
  })

  it("returns 'kanto' for ('茨城県', null)", () => {
    expect(classifyRegion('茨城県', null)).toBe('kanto')
  })

  it("returns 'kanto' for ('栃木県', null)", () => {
    expect(classifyRegion('栃木県', null)).toBe('kanto')
  })

  it("returns 'kanto' for ('群馬県', null)", () => {
    expect(classifyRegion('群馬県', null)).toBe('kanto')
  })

  it("returns 'other' for ('大阪府', '大阪市')", () => {
    expect(classifyRegion('大阪府', '大阪市')).toBe('other')
  })

  it("returns 'other' for (null, null)", () => {
    expect(classifyRegion(null, null)).toBe('other')
  })

  it("returns 'other' for ('', '')", () => {
    expect(classifyRegion('', '')).toBe('other')
  })

  it("returns 'kanto' for (null, '神奈川県横浜市')", () => {
    expect(classifyRegion(null, '神奈川県横浜市')).toBe('kanto')
  })
})

describe('extractPrefecture', () => {
  it("extracts '東京都' from '東京都千代田区将棋会館'", () => {
    expect(extractPrefecture('東京都千代田区将棋会館')).toBe('東京都')
  })

  it("extracts '神奈川県' from '神奈川県横浜市西区'", () => {
    expect(extractPrefecture('神奈川県横浜市西区')).toBe('神奈川県')
  })

  it("extracts '大阪府' from '大阪府大阪市'", () => {
    expect(extractPrefecture('大阪府大阪市')).toBe('大阪府')
  })

  it("extracts '京都府' from '京都府京都市'", () => {
    expect(extractPrefecture('京都府京都市')).toBe('京都府')
  })

  it("returns null for 'アマチュア竜王戦'", () => {
    expect(extractPrefecture('アマチュア竜王戦')).toBeNull()
  })

  it("returns null for ''", () => {
    expect(extractPrefecture('')).toBeNull()
  })

  it('returns null for null', () => {
    expect(extractPrefecture(null)).toBeNull()
  })

  it("extracts '東京都' from '東京都　千代田区' (full-width space)", () => {
    expect(extractPrefecture('東京都　千代田区')).toBe('東京都')
  })
})
