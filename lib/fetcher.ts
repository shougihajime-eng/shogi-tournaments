const USER_AGENT = 'shogi-tournaments-bot/0.1 (https://github.com/example/shogi-tournaments)'

export async function fetchHtml(url: string, init?: RequestInit): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ja,en;q=0.8',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  })
  if (!res.ok) {
    throw new Error(`fetch ${url} failed: ${res.status} ${res.statusText}`)
  }
  return await res.text()
}
