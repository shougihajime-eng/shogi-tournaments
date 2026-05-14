import { describe, it, expect } from 'vitest'
import { evaluateFeatured, isFeaturedTournament, featuredLabel } from '@/lib/filters/featured'

// アマ六大棋戦：奨励会三段リーグ編入試験の受験資格が得られる6棋戦
// 出典: ja.wikipedia.org/wiki/将棋のアマチュア棋戦
describe('evaluateFeatured（アマ六大棋戦のみを判定する）', () => {
  it('① アマ竜王戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第39回アマチュア竜王戦 東京都予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('アマ竜王戦')
  })

  it('② 全日本アマ名人戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第79回全日本アマチュア将棋名人戦 県予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('アマ名人戦')
  })

  it('③ アマ王将戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '全国アマチュア王将位戦', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('アマ王将戦')
  })

  it('④ 全国支部将棋対抗戦個人戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '全国支部将棋対抗戦個人戦', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('支部対抗戦')
  })

  it('④-2 「支部対抗戦」という略称でも検出', () => {
    const r = evaluateFeatured({ title: '第○○回支部対抗戦 県予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('支部対抗戦')
  })

  it('⑤ 朝日アマ名人戦を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第48回 朝日アマチュア将棋名人戦 予選', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('朝日アマ名人戦')
  })

  it('⑥ しんぶん赤旗全国大会を主要大会として検出', () => {
    const r = evaluateFeatured({ title: '第○○回 赤旗全国名人戦', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('赤旗名人戦')
  })

  it('⑥-2 「しんぶん赤旗全国囲碁・将棋大会」の正式名でも検出', () => {
    const r = evaluateFeatured({ title: 'しんぶん赤旗全国囲碁・将棋大会', description: null })
    expect(r.isFeatured).toBe(true)
    expect(r.label).toBe('赤旗名人戦')
  })

  it('六大棋戦には含まれない「アマ王座戦」は判定しない', () => {
    const r = evaluateFeatured({ title: '全国アマチュア王座戦 県予選', description: null })
    expect(r.isFeatured).toBe(false)
  })

  it('六大棋戦には含まれない「アマ最強戦」は判定しない', () => {
    const r = evaluateFeatured({ title: 'アマ最強戦', description: null })
    expect(r.isFeatured).toBe(false)
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
