# 将棋大会情報アプリ

大人が参加できる将棋大会情報を、日本将棋連盟（JSA）と日本アマチュア将棋連盟（アマレン）の公式サイトから自動収集して表示する Web アプリ。

## ステータス
- フェーズ: 設計（スキーマレビュー待ち）
- リポジトリ: 未 git init
- Supabase: 新規プロジェクト作成予定（ユーザー側で実施）
- デプロイ先: Vercel + Vercel Cron（24h）

## 技術スタック
- Next.js 14+ (App Router) / TypeScript
- Tailwind CSS
- Supabase Postgres（`public` スキーマ）
- スクレイピング: cheerio + fetch（動的レンダリングが必要なら Playwright + @sparticuz/chromium に切替）

## ソースURL（5本）
1. https://www.shogi.or.jp/event/
2. https://www.shogi.or.jp/event/info/
3. https://www.shogi.or.jp/tournament/
4. https://amaren.la.coocan.jp/
5. https://amaren.e5.valueserver.jp/Rsys/TournamentListAll.php

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
