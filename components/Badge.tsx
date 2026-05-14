import type { ReactNode } from 'react'

type Variant =
  | 'jsa'
  | 'amaren'
  | 'tokyo'
  | 'kanto'
  | 'new'
  | 'deadline'
  | 'going'
  | 'interest'
  | 'neutral'
  | 'prize'

const STYLES: Record<Variant, string> = {
  jsa: 'bg-shogi-50 text-shogi-800 ring-1 ring-inset ring-shogi-200',
  amaren: 'bg-ink-100 text-ink-800 ring-1 ring-inset ring-ink-300',
  tokyo: 'bg-tokyo-50 text-tokyo-700 ring-1 ring-inset ring-tokyo-100',
  kanto: 'bg-kanto-50 text-kanto-700 ring-1 ring-inset ring-kanto-100',
  new: 'bg-going-600 text-white',
  deadline: 'bg-deadline-600 text-white',
  going: 'bg-going-600 text-white',
  interest: 'bg-interest-100 text-interest-700 ring-1 ring-inset ring-interest-500/40',
  neutral: 'bg-ink-100 text-ink-700 ring-1 ring-inset ring-ink-200',
  prize: 'bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300'
}

export function Badge({ variant, children }: { variant: Variant; children: ReactNode }) {
  return <span className={`chip ${STYLES[variant]}`}>{children}</span>
}
