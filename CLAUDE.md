# 将棋大会情報アプリ

大人が参加できる将棋大会情報を、日本将棋連盟（JSA）と日本アマチュア将棋連盟（アマレン）の公式サイトから自動収集して表示する Web アプリ。

## 進捗（いまここ）
最終更新: 2026-05-15

- ✅ 直近で済んだこと:
  - **新ソース「sho-shogi.blogspot.com」追加** → 都名人戦・茨城新聞社杯・地方賞金大会が取り込めるようになった
  - 👑主要大会 / 💰賞金大会 の2軸バッジ追加（statsバナーから絞り込み可能）
  - 茨城50万円大会の正体特定 → 「茨城新聞社杯争奪将棋大会」（賞金額は公開情報になく未確認）
  - 本番公開（https://shogi-tournaments.vercel.app）
  - 大会一覧の月別グルーピング・トップへ戻るボタン
  - スマホタップしやすさ・キーボードショートカット・印刷・SEO
- 🟡 進行中: なし
- 🔜 次の一歩: 未定（sho-shogi 記事内の構造化情報（参加費・申込先）の抽出精度を上げる、茨城新聞社杯の賞金額を電話確認 など）

## 賞金大会・主要大会の判定
- `lib/filters/prize.ts`: 賞金が明示されている大会（💰）
- `lib/filters/featured.ts`: 全国規模の主要大会（👑）
DB変更なし、毎日のスクレイピング後に既存データへ自動反映。新しい大会名を追加する場合は各 RULES 配列を編集。

## ステータス
- フェーズ: 本番稼働中
- 本番URL: https://shogi-tournaments.vercel.app
- リポジトリ: https://github.com/shougihajime-eng/shogi-tournaments
- Vercel ダッシュボード: https://vercel.com/dashboard （プロジェクト名 `shogi-tournaments`）
- Supabase ダッシュボード: https://supabase.com/dashboard
- 自動更新: Vercel Cron で毎日 06:00 JST（`vercel.json` の `0 21 * * *` UTC）

## 技術スタック
- Next.js 14+ (App Router) / TypeScript
- Tailwind CSS
- Supabase Postgres（`public` スキーマ）
- スクレイピング: cheerio + fetch（動的レンダリングが必要なら Playwright + @sparticuz/chromium に切替）

## ソースURL（6本）
1. https://www.shogi.or.jp/event/
2. https://www.shogi.or.jp/event/info/
3. https://www.shogi.or.jp/tournament/
4. https://amaren.la.coocan.jp/
5. https://amaren.e5.valueserver.jp/Rsys/TournamentListAll.php
6. https://sho-shogi.blogspot.com/ （全国アマチュア将棋大会の集約サイト・都名人戦/茨城新聞社杯などの記事が掲載される）

## 除外キーワード（タイトル/概要にマッチで `is_excluded=true`）
- 子ども系: 小学生 / 中学生 / 高校生 / 小中学生 / 学生 / 児童 / 子ども / こども / キッズ / 青少年
- イベント系: 親子 / 観戦 / 大盤解説 / 解説会 / 指導対局 / 前夜祭 / ツアー

## 強調ロジック
- **NEW**: `first_seen_at` から 7日以内
- **締切間近**: `application_deadline` まで 7日以内
- **東京**: `prefecture='東京都'` → バッジ + 上部固定セクション
- **関東**: 神奈川/千葉/埼玉/茨城/栃木/群馬 → バッジ

## ディレクトリ
- `app/` - Next.js ルート
- `lib/scrapers/` - サイトごとの抽出器（1ソース1ファイル）
- `lib/normalizers/` - 日付/地域/申込URL の正規化
- `lib/filters/exclusion.ts` - 除外キーワード判定
- `lib/supabase/` - クライアント / サーバ用ファクトリ
- `tests/fixtures/` - 各ソースのHTMLサンプル
- `docs/schema.sql` - DBスキーマ
- `docs/supabase-setup.md` - Supabase 初期セットアップ手順

## サブエージェント
| 名前 | 役割 |
|---|---|
| `pm` | 要件確認・スコープ判断（実装はしない） |
| `scraper-engineer` | 5ソースのHTMLパース・正規化 |
| `frontend-engineer` | Next.js / Tailwind / UI |
| `qa-tester` | スクレイパーのスナップショットテスト・E2E |

並行作業は Agent ツールで上記4つを同時呼び出し。

## 守るべきルール（CRITICAL）
1. **推測でURL・メールアドレス・締切を生成しない**。元ページから取得できなければ `null`
2. **本番サイトへの連打禁止**。デバッグは `tests/fixtures/` のローカルHTMLで行う
3. **DB書き込みは service_role キー経由のみ**（Vercel サーバ環境変数）。クライアント直書き禁止
4. **anon key は SELECT のみ**。RLS で `is_excluded=false` のみ公開
5. **コメントは WHY が非自明な時のみ**。説明的コメントは書かない
6. **不明なことは「不明」と書く**。事実に基づかない解析・コード修正をしない

## ローカル開発（実装後に追記）
- `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` を配置
- `npm install` → `npm run dev`
