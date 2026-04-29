// 公開可能な接続情報（NEXT_PUBLIC_* と同等扱い）
// anon key は RLS で保護されているため、クライアント JS に埋め込まれる前提の値
// service_role key は **絶対に** ここに書かない（環境変数のみ）
export const SUPABASE_PUBLIC_CONFIG = {
  url: 'https://eqkaaohdbqefuszxwqzr.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxa2Fhb2hkYnFlZnVzenh3cXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDg4NjcsImV4cCI6MjA5MzAyNDg2N30.91ypwWiV3jLKh0OL2NOQsRBXf3PfFAiR1kHbHlxYLA8'
} as const

// 環境変数があればそちらを優先、不正/未設定時はコード内定数にフォールバック
export function getPublicConfig(): { url: string; anonKey: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const url = isValidUrl(envUrl) ? envUrl! : SUPABASE_PUBLIC_CONFIG.url
  const anonKey = isValidJwt(envAnon) ? envAnon! : SUPABASE_PUBLIC_CONFIG.anonKey
  return { url, anonKey }
}

function isValidUrl(v: string | undefined): boolean {
  return Boolean(v && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(v.trim()))
}

function isValidJwt(v: string | undefined): boolean {
  return Boolean(v && /^eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+$/.test(v.trim()))
}
