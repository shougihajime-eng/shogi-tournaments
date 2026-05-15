import { describe, it, expect } from 'vitest'
import { getTournamentNote, hasTournamentNote } from '@/lib/data/tournament-notes'

describe('tournament-notes', () => {
  it('茨城新聞社杯にメモがある', () => {
    const note = getTournamentNote({ title: '第45回 茨城新聞社杯鹿行予選将棋大会', description: null })
    expect(note).not.toBeNull()
    expect(note?.title).toMatch(/茨城新聞社杯/)
    expect(note?.bullets.length).toBeGreaterThan(0)
    expect(note?.contact?.some(c => c.phone === '029-239-3005')).toBe(true)
  })

  it('一般の大会にはメモがない', () => {
    expect(hasTournamentNote({ title: '町道場親睦大会', description: null })).toBe(false)
  })

  it('hasTournamentNote ヘルパーが正しく動く', () => {
    expect(hasTournamentNote({ title: '茨城新聞社杯', description: null })).toBe(true)
  })

  it('三浦三崎マグロ大会のメモがある', () => {
    const note = getTournamentNote({ title: '第45回 三浦三崎マグロ争奪将棋大会', description: null })
    expect(note).not.toBeNull()
    expect(note?.contact?.some(c => c.phone === '046-881-5111')).toBe(true)
  })

  it('都名人戦のメモがある', () => {
    const note = getTournamentNote({ title: '第75回都名人戦', description: null })
    expect(note).not.toBeNull()
    expect(note?.contact?.some(c => c.phone === '03-3835-4987')).toBe(true)
  })

  it('FUYOU杯のメモは「招待制」を含む', () => {
    const note = getTournamentNote({ title: 'FUYOU杯 茨城県アマ将棋最強戦', description: null })
    expect(note).not.toBeNull()
    expect(note?.bullets.join(' ')).toMatch(/招待制/)
  })
})
