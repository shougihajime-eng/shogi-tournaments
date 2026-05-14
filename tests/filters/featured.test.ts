import { describe, it, expect } from 'vitest'
import { evaluateFeatured, isFeaturedTournament, featuredLabel } from '@/lib/filters/featured'

describe('evaluateFeatured', () => {
  it('アマ竜王戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第39回アマチュア竜王戦 東京都予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('アマ竜王戦')
  })

  it('全日本アマ名人戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第79回全日本アマチュア将棋名人戦 県予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('アマ名人戦')
  })

  it('朝日アマ名人戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第48回 朝日アマチュア将棋名人戦 予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('朝日アマ名人戦')
  })

  it('アマ王将戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '全国アマチュア王将位戦', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('アマ王将戦')
  })

  it('赤旗名人戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第○○回 赤旗全国名人戦', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('赤旗名人戦')
  })

  it('普通の地域大会は主要大会と判定しない', () => {
    const r = evaluateFeatured({ title: '第10回 町道場親睦将棋大会', description: null })
    expect(r.isFeatured).toBe(false)
    expect(r.label).toBeNull()
  })

  it('ヘルパー', () => {
    expect(isFeaturedTournament({ title: 'アマ竜王戦', description: null })).toBe(true)
    expect(isFeaturedTournament({ title: '町道場大会', description: null })).toBe(false)
    expect(featuredLabel({ title: 'アマ名人戦', description: null })).toBe('アマ名人戦')
    expect(featuredLabel({ title: '町道場', description: null })).toBeNull()
  })
})
