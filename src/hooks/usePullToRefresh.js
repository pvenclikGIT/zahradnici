import { useState, useEffect, useRef } from 'react'

export function usePullToRefresh(onRefresh) {
  const [pulling, setPulling] = useState(false)
  const [progress, setProgress] = useState(0)
  const startY = useRef(null)
  const THRESHOLD = 80

  useEffect(() => {
    function onTouchStart(e) {
      if (window.scrollY === 0) startY.current = e.touches[0].clientY
    }
    function onTouchMove(e) {
      if (startY.current === null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0) {
        setPulling(true)
        setProgress(Math.min(100, (dy / THRESHOLD) * 100))
      }
    }
    function onTouchEnd() {
      if (progress >= 100) onRefresh?.()
      setPulling(false)
      setProgress(0)
      startY.current = null
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchend',   onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [progress, onRefresh])

  return { pulling, progress }
}
