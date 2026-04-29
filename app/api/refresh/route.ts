import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServiceClient } from '@/lib/supabase/server'
import { persistAll } from '@/lib/scrapers/persist'
import type { ScrapeOutcome } from '@/lib/scrapers/types'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_SECONDS = 60

async function runScrapers(): Promise<ScrapeOutcome[]> {
  try {
    const mod = (await import('@/lib/scrapers/index')) as {
      scrapeAll?: () => Promise<ScrapeOutcome[]>
    }
    if (typeof mod.scrapeAll === 'function') return await mod.scrapeAll()
  } catch {
    // TODO: scrapers が未完成なので空配列を返す
  }
  return []
}

export async function POST() {
  const supabase = getServiceClient()
  const { data: latest, error: latestErr } = await supabase
    .from('scrape_runs')
    .select('finished_at')
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestErr) {
    return NextResponse.json({ error: latestErr.message }, { status: 500 })
  }

  if (latest?.finished_at) {
    const elapsed = (Date.now() - Date.parse(latest.finished_at)) / 1000
    if (elapsed < RATE_LIMIT_SECONDS) {
      const retry = Math.ceil(RATE_LIMIT_SECONDS - elapsed)
      return NextResponse.json(
        { error: `更新は${RATE_LIMIT_SECONDS}秒に1回までです`, retryAfter: retry },
        { status: 429, headers: { 'Retry-After': String(retry) } }
      )
    }
  }

  try {
    const outcomes = await runScrapers()
    const results = await persistAll(outcomes)
    revalidatePath('/')
    return NextResponse.json({ ok: true, results })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
