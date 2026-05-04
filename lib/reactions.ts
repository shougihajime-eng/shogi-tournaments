export const REACTION_STORAGE_KEY = 'shogi-reactions:v1'
export const REACTION_CHANGED_EVENT = 'shogi-reactions-changed'

export type Reaction = 'going' | 'interested'
export type ReactionStore = Record<string, Reaction>

export function readReactions(): ReactionStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(REACTION_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    const out: ReactionStore = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (v === 'going' || v === 'interested') out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

export function writeReactions(store: ReactionStore): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REACTION_STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new CustomEvent(REACTION_CHANGED_EVENT))
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function setReaction(id: string, next: Reaction | null): void {
  const store = readReactions()
  if (next) store[id] = next
  else delete store[id]
  writeReactions(store)
}
