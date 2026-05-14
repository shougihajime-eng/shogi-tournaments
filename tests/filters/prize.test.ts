import { describe, it, expect } from 'vitest'
import { evaluatePrize, isPrizeTournament, prizeLabel } from '@/lib/filters/prize'

describe('evaluatePrize', () => {
  it('アマ竜王戦を50万円大会として検出', () => {
    const r = evaluatePrize({ title: '第39回アマチュア竜王戦 東京都予選', description: null })
    expect(r.isPrize).toBe(true)
    expect(r.label).toBe('優勝50万円')
  })

  it('都名人戦を15万円として検出', () => {
    const r = evaluatePrize({ title: '第75回都名人戦', description: null })
    expect(r.isPrize).toBe(true)
    expect(r.label).toBe('優勝15万円')
  })

  it('FUYOU杯茨城を10万円として検出', () => {
    const r = evaluatePrize({ title: 'FUYOU杯 茨城県アマ将棋最強戦', description: null })
    expect(r.isPrize).toBe(true)
    expect(r.label).toBe('優勝10万円')
  })

  it('全日本アマ名人戦を賞金大会として検出', () => {
    const r = evaluatePrize({ title: '第79回全日本アマチュア将棋名人戦 県予選', description: null })
    expect(r.isPrize).toBe(true)
  })

  it('朝日アマを賞金大会として検出', () => {
    const r = evaluatePrize({ title: '第48回 朝日アマチュア将棋名人戦 都道府県予選', description: null })
    expect(r.isPrize).toBe(true)
  })

  it('説明文中の「賞金20万円」を抽出', () => {
    const r = evaluatePrize({ title: '○○杯将棋大会', description: '優勝賞金20万円' })
    expect(r.isPrize).toBe(true)
    expect(r.label).toBe('賞金20万円')
  })

  it('普通の地域大会は賞金大会と判定しない', () => {
    const r = evaluatePrize({ title: '第10回 町道場親睦将棋大会', description: '参加賞あり' })
    expect(r.isPrize).toBe(false)
  })

  it('isPrizeTournament ヘルパー', () => {
    expect(isPrizeTournament({ title: 'アマ竜王戦', description: null })).toBe(true)
    expect(isPrizeTournament({ title: '町道場大会', description: null })).toBe(false)
  })

  it('prizeLabel ヘルパー', () => {
    expect(prizeLabel({ title: '都名人戦', description: null })).toBe('優勝15万円')
    expect(prizeLabel({ title: '町道場', description: null })).toBeNull()
  })
})
