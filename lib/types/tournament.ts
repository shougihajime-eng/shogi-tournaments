export type Tournament = {
  id: string
  source: 'jsa' | 'amaren'
  source_url: string
  external_id: string
  title: string
  description: string | null
  event_date_start: string | null
  event_date_end: string | null
  event_date_text: string | null
  location: string | null
  prefecture: string | null
  region: 'tokyo' | 'kanto' | 'other' | null
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
  created_at: string
  updated_at: string
}

export type ScrapeRun = {
  id: string
  source: string
  started_at: string
  finished_at: string | null
  status: 'running' | 'success' | 'failure' | 'partial' | null
  items_found: number
  items_inserted: number
  items_updated: number
  items_excluded: number
  error_message: string | null
}

export type RegionFilter = 'all' | 'tokyo' | 'kanto'
