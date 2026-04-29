import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let writer: SupabaseClient | null = null
let reader: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (writer) return writer
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  writer = createClient(url, serviceKey, { auth: { persistSession: false } })
  return writer
}

export function getServerReadClient(): SupabaseClient {
  if (reader) return reader
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  reader = createClient(url, anonKey, { auth: { persistSession: false } })
  return reader
}
