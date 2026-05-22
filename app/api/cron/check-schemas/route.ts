import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 2026-05-22 障害再発防止:
// PostgREST 設定の `db_schema` に「存在しないスキーマ名」が混入すると、
// 共有 Supabase 全体で schema cache 構築が失敗し本番が落ちる。
// 毎日 cron で「設定中のスキーマがすべて pg_namespace に存在するか」を検査し、
// 不整合があれば自動で除去する。

function getProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const m = url.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i)
  return m ? m[1] : null
}

async function getPostgrestConfig(ref: string, token: string) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/postgrest`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  })
  if (!r.ok) throw new Error(`getPostgrestConfig failed: ${r.status} ${await r.text()}`)
  return (await r.json()) as { db_schema: string; max_rows: number; db_extra_search_path: string; db_pool: number }
}

async function patchPostgrestSchemas(ref: string, token: string, newSchemaList: string) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/postgrest`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ db_schema: newSchemaList })
  })
  if (!r.ok) throw new Error(`patch failed: ${r.status} ${await r.text()}`)
  return await r.json()
}

async function listExistingSchemas(ref: string, token: string): Promise<Set<string>> {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: "select nspname from pg_namespace where nspname not like 'pg_%'" })
  })
  if (!r.ok) throw new Error(`listSchemas failed: ${r.status} ${await r.text()}`)
  const rows = (await r.json()) as { nspname: string }[]
  return new Set(rows.map(row => row.nspname))
}

async function handle(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'SUPABASE_ACCESS_TOKEN missing' }, { status: 503 })
  }
  const ref = getProjectRef()
  if (!ref) {
    return NextResponse.json({ error: 'cannot derive project ref from NEXT_PUBLIC_SUPABASE_URL' }, { status: 503 })
  }

  try {
    const cfg = await getPostgrestConfig(ref, token)
    const configured = cfg.db_schema.split(',').map(s => s.trim()).filter(Boolean)
    const existing = await listExistingSchemas(ref, token)
    const missing = configured.filter(name => !existing.has(name))

    if (missing.length === 0) {
      return NextResponse.json({ ok: true, action: 'noop', configured })
    }

    const cleaned = configured.filter(name => existing.has(name))
    await patchPostgrestSchemas(ref, token, cleaned.join(','))
    return NextResponse.json({ ok: true, action: 'removed', removed: missing, kept: cleaned })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const GET = handle
export const POST = handle
