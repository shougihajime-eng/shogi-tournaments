import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { persistAll } from '@/lib/scrapers/persist'
import type { ScrapeOutcome } from '@/lib/scrapers/types'

export const dynamic = 'force-dynamic'

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

async function handle(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
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

// Vercel Cron sends GET with `Authorization: Bearer ${CRON_SECRET}` automatically
export const GET = handle
export const POST = handle
