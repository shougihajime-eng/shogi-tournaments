'use client'
import { createClient } from '@supabase/supabase-js'
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

const { url, anonKey } = getPublicConfig()

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
  global: { fetch: timeoutFetch(8000) }
})
