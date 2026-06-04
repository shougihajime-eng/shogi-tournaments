# 将棋大会情報アプリ

大人が参加できる将棋大会情報を、日本将棋連盟（JSA）と日本アマチュア将棋連盟（アマレン）の公式サイトから自動収集して表示する Web アプリ。

## 進捗（いまここ）
最終更新: 2026-05-22

- ✅ 直近で済んだこと:
  - **本番障害復旧**（2026-05-22）: 共有Supabaseの PostgREST 設定に「存在しないスキーマ `manfune_lab`」が混入していて schema cache 構築が失敗。設定から削除して即復旧（コードは無関係）
- ✅ 過去に済んだこと:
  - **鈴木さんフィードバック5件まとめて反映**:
    - 日付に電話番号が混入する不具合修正（年範囲チェック + 日付らしさチェック）
    - 同じ大会の重複表示を排除（タイトル正規化＋開催日キー、情報量・ソース優先度で1件に統合）
    - 「事前申込」「当日受付OK」「両方可」バッジを追加
    - 賞金大会カードに金色の賞金額ボックスを大きく表示・「賞金が高い順」ソート追加
    - 日程未定の大会を下部に折りたたみ表示（デフォルト閉じる）
    - ヘッダーに「保存N件」リンク追加（クリックで「あなたの大会」へスクロール）
  - **デザイン大幅刷新**: 白背景→和紙風グラデ、ヘッダーを深い藍＋金、主要大会/賞金大会カードに装飾枠
  - ⏰締切間近フィルタ追加（statsバナーから絞り込み可能）
  - **新ソース「sho-shogi.blogspot.com」追加** → 都名人戦・茨城新聞社杯・地方賞金大会が取り込めるようになった
  - 👑主要大会 / 💰賞金大会 の2軸バッジ追加（statsバナーから絞り込み可能）
  - 茨城50万円大会の正体特定 → 「茨城新聞社杯争奪将棋大会」（賞金額は公開情報になく未確認）
  - 本番公開（https://shogi-tournaments.vercel.app）
  - 大会一覧の月別グルーピング・トップへ戻るボタン
- 🟡 進行中: なし
- 🔜 次の一歩: 未定（sho-shogi 記事内の構造化情報（参加費・申込先）の抽出精度を上げる、茨城新聞社杯の賞金額を電話確認、デザインを実機で見て微調整 など）

## 賞金大会・主要大会の判定
- `lib/filters/prize.ts`: 賞金が明示されている大会（💰）。**出典が確認できたものだけ**を載せる
- `lib/filters/featured.ts`: アマ六大棋戦（👑）。出典は Wikipedia「将棋のアマチュア棋戦」
- `lib/filters/prize-candidate.ts`: 賞金キーワードを含むが PRIZE_RULES に未登録の「未確認候補」を判定

DB変更なし、毎日のスクレイピング後に既存データへ自動反映。各 RULES 配列を編集する時は **出典コメント必須**（噂レベルでルール追加禁止）。

## 「気になる賞金候補をチェックして」と言われた時の運用（CRITICAL）
ユーザーから「気になる賞金候補チェックして」「賞金大会候補見て」等と言われたら：

1. `WebFetch https://shogi-tournaments.vercel.app/api/prize-candidates` で未確認候補リストを取得
2. 各大会について、Web検索で賞金額の出典を探す（公式ページ・新聞・Wikipedia等）
3. **出典が確認できたものだけ** `lib/filters/prize.ts` の PRIZE_RULES に追加
   （ルールに `// 出典: URL` コメント必須）
4. 出典が確認できなければスキップ（ユーザーに「○件は出典が見つかりませんでした」と報告）
5. テスト追加 → ビルド → push

❌ やってはいけないこと: 「賞金あり」とだけ書いて金額未確認のままルール追加すること

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

---

## 🚨 2026-06-04 日本将棋連盟の公式サイトが停止中（全アプリ共通のお知らせ）
- 連盟の公式ホームページ（www.shogi.or.jp）は**サーバー攻撃を受けて停止・使用不可**（本人連絡 2026-06-04）。
- 当面の公式情報は**臨時ページ** https://store.shogi.or.jp/view/page/tempsite に毎日掲載（お知らせ・対局予定/結果・イベント・奨励会など）。
- **連盟サイトから情報を取る処理・調査・リンク確認はすべて臨時ページを使うこと**。自動取得（スクレイパー）は公式サイト復旧まで失敗する前提で扱う（エラーは故障ではなく連盟側の停止が原因）。
- 復旧や新情報は本人から連絡が入り次第このメモを更新する。

### 🔎 2026-06-04 停止の影響と代わりの情報源（調査済み）
- 本アプリの自動取得3本（jsa-event=event/カレンダー・jsa-info=event/info/・jsa-tournament=tournament/）は**取得元ページごと停止中**＝毎朝の自動実行（Vercel cron 06:00 JST）は失敗または0件になる。エラーは故障ではない。
- **代わりに使える場所（確認済み・2026-06-04）**：
  1. 連盟ストアの**大会申し込み一覧** https://store.shogi.or.jp/view/category/tournament … 実際の大会（高校生王将戦・アマ名人戦 都道府県予選など）が `/view/item/...` のリンク一覧で載っており**機械で読める構造**。
  2. 臨時ページ https://store.shogi.or.jp/view/page/tempsite … 手書き更新のお知らせ面（毎朝10時ごろ更新）。【臨時掲載】主要アマ全国大会 都道府県予選情報は関西将棋情報サイト（kansai-shogi.info）へのリンク。
  3. イベントは https://store.shogi.or.jp/view/category/item 。
- 対応案（本人未決・実装する場合）：ストアの tournament/item カテゴリを読む臨時スクレイパーを `lib/scrapers/` に追加し、`source` を分けて Supabase に upsert（公式復旧後に止めやすくする）。臨時ページ自体は手書きで構造が変わりやすいのでスクレイパー化しない。

### ✅ 2026-06-04 臨時スクレイパー jsa-store 稼働開始（公式サイト停止対策・本番反映済み）
- `lib/scrapers/jsa-store.ts` 新設＝連盟ストア「大会申し込み」(`store.shogi.or.jp/view/category/tournament`) の一覧→各商品ページから 日程/会場/申込期間/参加資格/連絡先 を抽出（700ms間隔・上限30件・`category_page_id=tournament`付きリンクのみ＝「寄付する」等を除外）。申込期間「5/26～6/26」は**終わりの日を締切**に採用。日付はタイトル【7月5日開催】からも補完。external_idはストア商品コードのsha1＝安定
- 登録は `lib/scrapers/index.ts` の `jsa-store` 行。**公式復旧後はこの行を消すだけで停止**（既存jsa-*3本は残置済み＝復旧すれば自動で元に戻る）。cron/refresh に `maxDuration=60` 追加
- 検証済み：vitest 5件（実ページfixture）／tsc 0／next build成功／**本番 /api/refresh で 取得14・新規14・success**（うち除外9=子ども向け方針どおり）。トップページに「アマ名人戦/アマ竜王戦 都予選」表示確認
- 注意：ストア一覧は現在1ページ(14件)。ページ送りが増えたら parseList の拡張が必要
