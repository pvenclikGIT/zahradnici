import { useRef, useState } from 'react'
import { cn } from '../lib/utils'

export function SwipeCard({ children, onSwipeLeft, onSwipeRight, leftLabel, leftColor, rightLabel, rightColor, leftIcon, rightIcon }) {
  const startX = useRef(null)
  const [offset, setOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const THRESHOLD = 72
  const MAX = 100

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }
  function handleTouchMove(e) {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    setOffset(Math.max(-MAX, Math.min(MAX, dx)))
  }
  function handleTouchEnd() {
    setSwiping(false)
    if (offset <= -THRESHOLD && onSwipeLeft)  { onSwipeLeft();  setOffset(0); return }
    if (offset >= THRESHOLD  && onSwipeRight) { onSwipeRight(); setOffset(0); return }
    setOffset(0)
    startX.current = null
  }

  const showLeft  = offset < -20
  const showRight = offset > 20

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Right action bg (swipe left reveals) */}
      {onSwipeLeft && (
        <div className={cn('absolute right-0 top-0 bottom-0 w-24 flex flex-col items-center justify-center gap-1 rounded-r-xl transition-opacity duration-150',
          leftColor || 'bg-red-500', showLeft ? 'opacity-100' : 'opacity-0'
        )}>
          {leftIcon && <span className="text-white">{leftIcon}</span>}
          {leftLabel && <span className="text-[10px] font-bold text-white">{leftLabel}</span>}
        </div>
      )}
      {/* Left action bg (swipe right reveals) */}
      {onSwipeRight && (
        <div className={cn('absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center justify-center gap-1 rounded-l-xl transition-opacity duration-150',
          rightColor || 'bg-green-500', showRight ? 'opacity-100' : 'opacity-0'
        )}>
          {rightIcon && <span className="text-white">{rightIcon}</span>}
          {rightLabel && <span className="text-[10px] font-bold text-white">{rightLabel}</span>}
        </div>
      )}
      {/* Card */}
      <div
        style={{ transform:`translateX(${offset}px)`, transition: swiping ? 'none' : 'transform 0.25s cubic-bezier(.25,.46,.45,.94)' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
