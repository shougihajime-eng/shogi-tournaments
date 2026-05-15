import type { Tournament } from '@/lib/types/tournament'

export type TournamentNote = {
  title: string
  bullets: string[]
  contact?: { label: string; phone?: string; url?: string }[]
  source?: string
}

type NoteRule = {
  pattern: RegExp
  note: TournamentNote
}

const NOTE_RULES: NoteRule[] = [
  {
    pattern: /茨城新聞社杯/,
    note: {
      title: '茨城新聞社杯の参加方法（県外からも参加OK）',
      bullets: [
        '4地区予選（県央・県西・県北・鹿行）のどれかに参加 → 上位8名が10月の決勝大会へ進出',
        '参加費: 一般 1,500円（県西支部会員は 1,000円、鹿行予選は小中高生 1,300円）',
        'ルール: 5対局・持ち時間15分・秒読み30秒',
        '受付 9:00〜9:40 → 10:00 開始',
        '「どなたでも参加できます」と案内文に明記。前年の県南予選は「県内外から42人が参加」と報道',
        '事前申込が必要か・段位制限の有無は不明 → 遠方からなら事前に電話確認推奨',
      ],
      contact: [
        { label: '茨城新聞社 営業局事業部', phone: '029-239-3005' },
        { label: '茨城県支部連合会 (X)', url: 'https://x.com/ibarakishogi' },
      ],
      source: 'sho-shogi.blogspot.com 案内文・茨城新聞記事（2025年）',
    },
  },
  {
    pattern: /三浦三崎マグロ|マグロ争奪/,
    note: {
      title: '三浦三崎マグロ争奪将棋大会の参加方法（全国からOK）',
      bullets: [
        '全国OK: 前回大会は北海道〜大阪まで全国から **409名** が参加',
        '5部門: A級（4段以上）/ B級（2〜3段）/ C級（初段以下）/ 小学生 / レディース',
        '参加費: 一般3,000円・小中学生&女性2,500円（参加賞 + 昼食付）',
        '定員: A〜C級 各100名 + 小学生&レディース 各50名 = 計400名',
        '当日受付制（9:00〜9:40、競技10:00開始）。例年 12月開催',
        '上位入賞者には **マグロ1本** 等が贈呈される名物大会',
      ],
      contact: [
        { label: '三浦商工会議所', phone: '046-881-5111' },
      ],
      source: '三浦商工会議所・三浦市公式ページ（2024年第44回案内）',
    },
  },
  {
    pattern: /FUYOU杯|ふようはい|フヨウ杯|茨城.*最強戦/,
    note: {
      title: 'FUYOU杯 茨城県アマ将棋最強戦は「招待制」',
      bullets: [
        '⚠️ 一般エントリー不可。**主催側が選抜する16名招待制**',
        '対象: 茨城または茨城に縁のあるアマ強豪（過去の大会優勝など実績ある人）',
        '腕に自信がある方は、まず地区予選大会で実績を作ることが第一歩',
      ],
      contact: [
        { label: '株式会社 FUYOU 公式ページ', url: 'https://fuyou-g.com/news/' },
      ],
      source: 'fuyou-g.com（第6回大会案内 2024年）',
    },
  },
  {
    pattern: /都名人戦/,
    note: {
      title: '都名人戦の参加方法（東京アマチュア将棋連盟主催）',
      bullets: [
        '主催: 東京アマチュア将棋連盟 / 会場: 御徒町将棋センター',
        '都内・都外問わず参加可能（過去の知恵袋情報による）',
        '⚠️ ウェブで詳細な参加要項が公開されていないため、御徒町将棋センターに電話確認推奨',
      ],
      contact: [
        { label: '御徒町将棋センター', phone: '03-3835-4987' },
        { label: '東京アマチュア将棋連盟 公式', url: 'https://toushouren.world.coocan.jp/' },
      ],
      source: '御徒町将棋センター公式ページ（toushouren）',
    },
  },
]

export function getTournamentNote(t: Pick<Tournament, 'title' | 'description'>): TournamentNote | null {
  const text = [t.title ?? '', t.description ?? ''].join(' ').normalize('NFKC')
  for (const rule of NOTE_RULES) {
    if (rule.pattern.test(text)) return rule.note
  }
  return null
}

export function hasTournamentNote(t: Pick<Tournament, 'title' | 'description'>): boolean {
  return getTournamentNote(t) !== null
}
