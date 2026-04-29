import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function PageTransition({ children }) {
  const location = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
    return () => cancelAnimationFrame(raf)
  }, [location.pathname])

  return <div ref={ref}>{children}</div>
}
