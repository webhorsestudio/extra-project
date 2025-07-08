'use client'

import { useEffect, useState } from 'react'

export default function FooterScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200)
    
    // Only add event listener on client side
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll)
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 left-8 z-50 bg-white text-black rounded-lg p-3 shadow-lg hover:bg-black hover:text-white transition"
      aria-label="Scroll to top"
    >
      <span className="text-xl">↑</span>
    </button>
  )
} 