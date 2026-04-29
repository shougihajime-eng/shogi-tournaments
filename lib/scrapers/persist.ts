import type { ScrapedTournament, ScrapeOutcome, Source } from '@/lib/scrapers/types'
import { getServiceClient } from '@/lib/supabase/server'
import { evaluateExclusion } from '@/lib/filters/exclusion'
import { classifyRegion, extractPrefecture } from '@/lib/normalizers/region'
import { parseDate } from '@/lib/normalizers/date'

export type PersistResult = {
  source: Source
  items_found: number
  items_inserted: number
  items_updated: number
  items_excluded: number
  status: 'success' | 'failure' | 'partial'
  error_message: string | null
}

type ExistingRow = {
  id: string
  source: Source
  external_id: string
  first_seen_at: string
}

type UpsertRow = {
  source: Source
  source_url: string
  external_id: string
  title: string
  description: string | null
  event_date_start: string | null
  event_date_end: string | null
  event_date_text: string | null
  location: string | null
  prefecture: string | null
  region: 'tokyo' | 'kanto' | 'other'
  eligibility: string | null
  application_deadline: string | null
  application_deadline_text: string | null
  application_url: string | null
  ticket_url: string | null
  contact_email: string | null
  detail_url: string
  is_excluded: boolean
  excluded_reason: string | null
  first_seen_at: string
  last_seen_at: string
}

function buildRow(item: ScrapedTournament, now: string, firstSeenAt: string | null): UpsertRow {
  const exclusion = evaluateExclusion(item.title, item.description, item.eligibility)

  const prefecture =
    item.prefecture ?? extractPrefecture(`${item.title} ${item.location ?? ''} ${item.description ?? ''}`)
  const region = classifyRegion(prefecture, item.location)

  let start = item.event_date_start
  let end = item.event_date_end
  let dateText = item.event_date_text
  if ((!start || !end) && item.event_date_text) {
    const parsed = parseDate(item.event_date_text)
    if (!start) start = parsed.start
    if (!end) end = parsed.end
    if (!dateText) dateText = parsed.text || item.event_date_text
  }

  let deadline = item.application_deadline
  if (!deadline && item.application_deadline_text) {
    const parsed = parseDate(item.application_deadline_text)
    deadline = parsed.start
  }

  return {
    source: item.source,
    source_url: item.source_url,
    external_id: item.external_id,
    title: item.title,
    description: item.description,
    event_date_start: start,
    event_date_end: end,
    event_date_text: dateText,
    location: item.location,
    prefecture,
    region,
    eligibility: item.eligibility,
    application_deadline: deadline,
    application_deadline_text: item.application_deadline_text,
    application_url: item.application_url,
    ticket_url: item.ticket_url,
    contact_email: item.contact_email,
    detail_url: item.detail_url,
    is_excluded: exclusion.isExcluded,
    excluded_reason: exclusion.reason,
    first_seen_at: firstSeenAt ?? now,
    last_seen_at: now
  }
}

async function fetchExisting(
  supabase: ReturnType<typeof getServiceClient>,
  source: Source,
  externalIds: string[]
): Promise<Map<string, ExistingRow>> {
  if (externalIds.length === 0) return new Map()
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, source, external_id, first_seen_at')
    .eq('source', source)
    .in('external_id', externalIds)
  if (error) throw new Error(`select existing failed: ${error.message}`)
  const map = new Map<string, ExistingRow>()
  for (const row of (data ?? []) as ExistingRow[]) {
    map.set(row.external_id, row)
  }
  return map
}

export async function persistOutcome(outcome: ScrapeOutcome): Promise<PersistResult> {
  const supabase = getServiceClient()
  const startedAt = new Date().toISOString()

  const { data: runInsert, error: runErr } = await supabase
    .from('scrape_runs')
    .insert({
      source: outcome.source,
      started_at: startedAt,
      status: 'running',
      items_found: outcome.items.length
    })
    .select('id')
    .single()
  if (runErr) throw new Error(`insert scrape_runs failed: ${runErr.message}`)
  const runId = (runInsert as { id: string }).id

  let inserted = 0
  let updated = 0
  let excluded = 0
  let status: 'success' | 'failure' | 'partial' = outcome.errors.length > 0 ? 'partial' : 'success'
  let errorMessage: string | null = outcome.errors.length > 0 ? outcome.errors.map(e => e.message).join('; ') : null

  try {
    const externalIds = outcome.items.map(i => i.external_id)
    const existing = await fetchExisting(supabase, outcome.source, externalIds)

    const now = new Date().toISOString()
    const rows: UpsertRow[] = outcome.items.map(item => {
      const prev = existing.get(item.external_id)
      return buildRow(item, now, prev?.first_seen_at ?? null)
    })

    for (const row of rows) {
      if (row.is_excluded) excluded += 1
    }
    inserted = rows.filter(r => !existing.has(r.external_id)).length
    updated = rows.length - inserted

    if (rows.length > 0) {
      const { error: upsertErr } = await supabase
        .from('tournaments')
        .upsert(rows, { onConflict: 'source,external_id' })
      if (upsertErr) throw new Error(`upsert failed: ${upsertErr.message}`)
    }
  } catch (e) {
    status = 'failure'
    errorMessage = e instanceof Error ? e.message : String(e)
  }

  const finishedAt = new Date().toISOString()
  await supabase
    .from('scrape_runs')
    .update({
      finished_at: finishedAt,
      status,
      items_found: outcome.items.length,
      items_inserted: inserted,
      items_updated: updated,
      items_excluded: excluded,
      error_message: errorMessage
    })
    .eq('id', runId)

  return {
    source: outcome.source,
    items_found: outcome.items.length,
    items_inserted: inserted,
    items_updated: updated,
    items_excluded: excluded,
    status,
    error_message: errorMessage
  }
}

export async function persistAll(outcomes: ScrapeOutcome[]): Promise<PersistResult[]> {
  const results: PersistResult[] = []
  for (const outcome of outcomes) {
    results.push(await persistOutcome(outcome))
  }
  return results
}
