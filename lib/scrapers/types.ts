export type Source = 'jsa' | 'amaren'

export type ScrapedTournament = {
  source: Source
  source_url: string
  external_id: string
  title: string
  description: string | null
  event_date_text: string | null
  event_date_start: string | null
  event_date_end: string | null
  location: string | null
  prefecture: string | null
  eligibility: string | null
  application_deadline: string | null
  application_deadline_text: string | null
  application_url: string | null
  ticket_url: string | null
  contact_email: string | null
  detail_url: string
}

export type ScrapeError = {
  scraperId: string
  message: string
  cause?: unknown
}

export type ScrapeOutcome = {
  scraperId: string
  source: Source
  items: ScrapedTournament[]
  errors: ScrapeError[]
}
