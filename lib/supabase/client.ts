'use client'
import { createClient } from '@supabase/supabase-js'
import { getPublicConfig } from './config'

const { url, anonKey } = getPublicConfig()

export const supabase = createClient(url, anonKey, { auth: { persistSession: false } })
