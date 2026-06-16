import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getPublicConfig } from './config'

function timeoutFetch(timeoutMs = 8000): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(input as RequestInfo, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }
}

let writer: SupabaseClient | null = null
let reader: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (writer) return writer
  const { url } = getPublicConfig()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
  if (!serviceKey || !/^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/.test(serviceKey)) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing or malformed (set it in Vercel env vars)')
  }
  writer = createClient(url, serviceKey, {
    auth: { persistSession: false },
    global: { fetch: timeoutFetch(8000) }
  })
  return writer
}

export function getServerReadClient(): SupabaseClient {
  if (reader) return reader
  const { url, anonKey } = getPublicConfig()
  reader = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { fetch: timeoutFetch(8000) }
  })
  return reader
}

export function isServiceClientAvailable(): boolean {
  const k = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
  return Boolean(k && /^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/.test(k))
}
