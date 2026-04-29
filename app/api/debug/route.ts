import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result: Record<string, unknown> = {
    runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
    node_version: process.versions?.node ?? 'unknown',
    env: {
      has_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      has_anon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      has_service: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      has_cron: Boolean(process.env.CRON_SECRET),
      url_prefix: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').slice(0, 30)
    }
  }

  try {
    const { getServerReadClient } = await import('@/lib/supabase/server')
    const supabase = getServerReadClient()
    const today = new Date().toISOString().slice(0, 10)

    const t1 = Date.now()
    const simple = await supabase.from('tournaments').select('id', { count: 'exact', head: true })
    result.simple_count_query = {
      ms: Date.now() - t1,
      count: simple.count,
      error: simple.error?.message ?? null
    }

    const t2 = Date.now()
    const orQuery = await supabase
      .from('tournaments')
      .select('id, title')
      .eq('is_excluded', false)
      .or(`event_date_end.gte.${today},and(event_date_end.is.null,event_date_start.gte.${today}),and(event_date_end.is.null,event_date_start.is.null)`)
      .limit(1)
    result.or_query = {
      ms: Date.now() - t2,
      rows: orQuery.data?.length ?? 0,
      error: orQuery.error?.message ?? null
    }

    const t3 = Date.now()
    const runs = await supabase
      .from('scrape_runs')
      .select('id')
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    result.scrape_runs_query = {
      ms: Date.now() - t3,
      found: Boolean(runs.data),
      error: runs.error?.message ?? null
    }
  } catch (e) {
    result.exception = e instanceof Error ? { name: e.name, message: e.message, stack: e.stack?.split('\n').slice(0, 5) } : String(e)
  }

  return NextResponse.json(result)
}
