import { describe, it, expect } from 'vitest'
import { evaluateExclusion } from '@/lib/filters/exclusion'

describe('evaluateExclusion', () => {
  describe('excluded titles', () => {
    it('excludes 小学生大会 with reason keyword:小学生', () => {
      const result = evaluateExclusion('小学生大会')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:小学生')
    })

    it('excludes 中学生選手権 with reason keyword:中学生', () => {
      const result = evaluateExclusion('中学生選手権')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:中学生')
    })

    it('excludes 親子将棋大会 with reason keyword:親子', () => {
      const result = evaluateExclusion('親子将棋大会')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:親子')
    })

    it('excludes 大盤解説会 with reason keyword:大盤解説', () => {
      const result = evaluateExclusion('大盤解説会')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:大盤解説')
    })

    it('excludes 解説会のお知らせ with reason keyword:解説会', () => {
      const result = evaluateExclusion('解説会のお知らせ')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:解説会')
    })

    it('excludes 指導対局会 with reason keyword:指導対局', () => {
      const result = evaluateExclusion('指導対局会')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:指導対局')
    })

    it('excludes 前夜祭ディナーショー with reason keyword:前夜祭', () => {
      const result = evaluateExclusion('前夜祭ディナーショー')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:前夜祭')
    })

    it('excludes プロ棋戦観戦ツアー (matches 観戦 or ツアー)', () => {
      const result = evaluateExclusion('プロ棋戦観戦ツアー')
      expect(result.isExcluded).toBe(true)
      expect(['keyword:観戦', 'keyword:ツアー']).toContain(result.reason)
    })
  })

  describe('included titles', () => {
    it('includes シニア将棋大会', () => {
      const result = evaluateExclusion('シニア将棋大会')
      expect(result.isExcluded).toBe(false)
      expect(result.reason).toBeNull()
    })

    it('includes 支部対抗戦', () => {
      const result = evaluateExclusion('支部対抗戦')
      expect(result.isExcluded).toBe(false)
      expect(result.reason).toBeNull()
    })

    it('includes 段級位認定大会', () => {
      const result = evaluateExclusion('段級位認定大会')
      expect(result.isExcluded).toBe(false)
      expect(result.reason).toBeNull()
    })

    it('includes アマチュア竜王戦', () => {
      const result = evaluateExclusion('アマチュア竜王戦')
      expect(result.isExcluded).toBe(false)
      expect(result.reason).toBeNull()
    })
  })

  describe('multiple arguments', () => {
    it('excludes when keyword in second argument', () => {
      const result = evaluateExclusion('大会タイトル', '対象: 小学生以上')
      expect(result.isExcluded).toBe(true)
      expect(result.reason).toBe('keyword:小学生')
    })

    it('handles null/undefined mixed in arguments', () => {
      const result = evaluateExclusion('大会', null, undefined)
      expect(result.isExcluded).toBe(false)
      expect(result.reason).toBeNull()
    })
  })
})
