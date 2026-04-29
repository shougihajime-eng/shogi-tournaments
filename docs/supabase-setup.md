# Supabase 初期セットアップ手順

将棋大会アプリ用の Supabase プロジェクトをセットアップするための手順書。**ユーザー側で実施** してください。所要時間は10〜15分です。

---

## 1. 新規プロジェクト作成

1. https://supabase.com にログイン
2. **New project** をクリック
3. 以下を入力：
   - **Name**: `shogi-tournaments`（任意）
   - **Database Password**: 強いパスワードを生成して保管（後で使う場面はほぼ無いがバックアップ用）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
   - **Pricing Plan**: Free
4. **Create new project** を押し、プロビジョニング完了まで2〜3分待つ

---

## 2. スキーマ適用

1. 左メニュー **SQL Editor** を開く
2. **New query** を押す
3. このリポジトリの `docs/schema.sql` の内容を **全文コピペ**
4. 右下 **Run** を押す
5. 結果が `Success. No rows returned` 等になればOK

確認：
- 左メニュー **Table Editor** で `tournaments` と `scrape_runs` が見えること
- **Authentication > Policies** で各テーブルに RLS ポリシーが2つ表示されていること

---

## 3. API 鍵の取得

左メニュー **Project Settings > API** を開き、以下を控えてください：

| 項目 | 用途 | 公開可否 |
|---|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | フロント / サーバ両方 | 公開可 |
| **anon public key** | フロント（読み取り専用） | 公開可 |
| **service_role key** | スクレイパー（書き込み） | **絶対に公開しない** |

---

## 4. 鍵の渡し方

プロジェクトルートに `.env.local` を作って、以下を貼ってください：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
CRON_SECRET=<任意の長いランダム文字列>
```

- `CRON_SECRET` は Vercel Cron からのリクエストを認証するためのトークン。`openssl rand -hex 32` 等で生成
- `.env.local` は **絶対に git に含めない**（`.gitignore` で除外する）

Vercel にデプロイする際は、上記4つを **Project Settings > Environment Variables** に同じ値で登録します（実装フェーズで詳しく案内します）。

---

## 5. 動作確認（任意）

SQL Editor で以下を実行し、anon ロールで除外行が見えないことを確認できます：

```sql
-- service_role で1件 INSERT
insert into public.tournaments (source, source_url, external_id, title, detail_url, is_excluded, excluded_reason)
values ('jsa', 'https://example.com', 'test-001', '小学生大会（テスト）', 'https://example.com/1', true, 'keyword:小学生');

insert into public.tournaments (source, source_url, external_id, title, detail_url)
values ('jsa', 'https://example.com', 'test-002', 'シニア大会（テスト）', 'https://example.com/2');

-- 確認
select id, title, is_excluded from public.tournaments;
-- → 2件見える（service_role なので RLS バイパス）
```

ターミナルから anon キーで叩くと除外行が出ないことも確認できます：

```bash
curl "https://xxxx.supabase.co/rest/v1/tournaments?select=title,is_excluded" \
  -H "apikey: <anon key>" \
  -H "Authorization: Bearer <anon key>"
# → シニア大会のみ表示される
```

確認後はテストデータを削除：

```sql
delete from public.tournaments where external_id like 'test-%';
```

---

## 6. 完了報告

以下を Claude に伝えてください：
- スキーマ適用が成功したか
- 上記4つの環境変数の値（`.env.local` への貼り付けを Claude にお願いするなら）
  - **service_role key と CRON_SECRET は機微情報** です。共有チャットで貼る運用で問題なければそのまま、不安があれば貼らずに自分で `.env.local` を作成してください
