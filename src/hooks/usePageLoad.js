import { useState, useEffect } from 'react'

// Simulates page load for skeleton UI demonstration
export function usePageLoad(delay = 600) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), delay)
    return () => clearTimeout(t)
  }, [])
  return loaded
}
