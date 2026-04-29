-- ============================================================
-- 将棋大会情報アプリ スキーマ（v1）
-- 適用先: Supabase 新規プロジェクト / public スキーマ
-- 適用方法: Supabase ダッシュボード > SQL Editor で全文を実行
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- tournaments
-- スクレイプで取得した大会情報の主テーブル
-- ============================================================
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),

  -- ソース情報
  source        text not null check (source in ('jsa', 'amaren')),
  source_url    text not null,                        -- 取得元の一覧/詳細URL
  external_id   text not null,                        -- ソース内の安定ID（hashでも可）

  -- 大会情報
  title         text not null,
  description   text,
  event_date_start  date,                             -- パース成功時のみ
  event_date_end    date,
  event_date_text   text,                             -- 原文（パース不可時に必須）

  -- 場所
  location      text,                                 -- 原文（例: 「東京都千代田区将棋会館」）
  prefecture    text,                                 -- 正規化（例: 「東京都」）
  region        text check (region in ('tokyo', 'kanto', 'other')),

  -- 参加条件・締切
  eligibility               text,                     -- 参加条件 原文
  application_deadline      date,
  application_deadline_text text,

  -- 申込・チケット
  application_url   text,                             -- 申込フォーム
  ticket_url        text,                             -- Peatix / PassMarket 等
  contact_email     text,                             -- mailto 用
  detail_url        text not null,                    -- 公式詳細ページ

  -- 除外フラグ
  is_excluded     boolean not null default false,     -- 子ども大会・観戦イベント等
  excluded_reason text,                               -- 例: 'keyword:小学生'

  -- メタ
  raw_html      text,                                 -- パース失敗調査用（任意）
  first_seen_at timestamptz not null default now(),   -- NEW判定基準
  last_seen_at  timestamptz not null default now(),   -- 最後に再確認した時刻
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  unique (source, external_id)
);

create index idx_tournaments_event_date_start     on public.tournaments(event_date_start);
create index idx_tournaments_application_deadline on public.tournaments(application_deadline);
create index idx_tournaments_region               on public.tournaments(region);
create index idx_tournaments_is_excluded          on public.tournaments(is_excluded);
create index idx_tournaments_first_seen_at        on public.tournaments(first_seen_at);
create index idx_tournaments_source               on public.tournaments(source);

-- updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_tournaments_set_updated_at
  before update on public.tournaments
  for each row execute function public.set_updated_at();

-- ============================================================
-- scrape_runs
-- スクレイプジョブの実行ログ（最終更新時刻表示・失敗監視に使う）
-- ============================================================
create table public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source        text not null,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  status        text check (status in ('running', 'success', 'failure', 'partial')),
  items_found   int  not null default 0,
  items_inserted int not null default 0,
  items_updated int  not null default 0,
  items_excluded int not null default 0,
  error_message text
);

create index idx_scrape_runs_started_at on public.scrape_runs(started_at desc);
create index idx_scrape_runs_source     on public.scrape_runs(source);

-- ============================================================
-- RLS（Row Level Security）
-- ・anon: SELECT のみ。tournaments は除外行を読めない
-- ・service_role: バイパス（明示ポリシー不要）
-- ============================================================
alter table public.tournaments enable row level security;
alter table public.scrape_runs enable row level security;

create policy "anon_select_non_excluded_tournaments"
  on public.tournaments for select
  to anon
  using (is_excluded = false);

create policy "anon_select_scrape_runs"
  on public.scrape_runs for select
  to anon
  using (true);
