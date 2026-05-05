'use client'
import { useEffect, useState } from 'react'

export function BackToTopButton() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      type="button"
      aria-label="ページの先頭へ戻る"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="no-print fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-shogi-800 text-white shadow-elevated transition hover:bg-shogi-900 focus-visible:ring-2 focus-visible:ring-shogi-700/40 sm:bottom-8 sm:right-8"
    >
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  )
}
