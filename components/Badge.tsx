import type { ReactNode } from 'react'

type Variant = 'tokyo' | 'kanto' | 'new' | 'jsa' | 'amaren' | 'deadline' | 'neutral'

const STYLES: Record<Variant, string> = {
  tokyo: 'bg-tokyo text-white',
  kanto: 'bg-kanto text-white',
  new: 'bg-emerald-600 text-white',
  jsa: 'bg-slate-800 text-white',
  amaren: 'bg-indigo-700 text-white',
  deadline: 'bg-deadline text-white',
  neutral: 'bg-slate-200 text-slate-700'
}

export function Badge({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[variant]}`}>
      {children}
    </span>
  )
}
