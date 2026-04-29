export type Region = 'tokyo' | 'kanto' | 'other'

const KANTO_PREFECTURES = ['神奈川県', '千葉県', '埼玉県', '茨城県', '栃木県', '群馬県'] as const

const PREF_LIST = [
  '北海道',
  '青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県',
  '三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
] as const

export function classifyRegion(prefecture: string | null, location: string | null): Region {
  const text = `${prefecture ?? ''} ${location ?? ''}`
  if (text.includes('東京')) return 'tokyo'
  if (KANTO_PREFECTURES.some(p => text.includes(p))) return 'kanto'
  // Match short kanto names without 県
  if (['神奈川', '千葉', '埼玉', '茨城', '栃木', '群馬'].some(p => text.includes(p))) return 'kanto'
  return 'other'
}

export function extractPrefecture(text: string | null | undefined): string | null {
  if (!text) return null
  const normalized = text.normalize('NFKC')
  for (const pref of PREF_LIST) {
    if (normalized.includes(pref)) return pref
  }
  if (normalized.includes('東京')) return '東京都'
  return null
}
