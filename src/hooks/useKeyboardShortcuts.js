import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useKeyboardShortcuts(onSearch) {
  const navigate = useNavigate()
  useEffect(() => {
    const handler = (e) => {
      // Skip if typing in input/textarea
      if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return
      if (e.metaKey || e.ctrlKey) return // handled elsewhere

      switch(e.key) {
        case 'n': case 'N': navigate('/orders?new=1'); break
        case 'c': case 'C': navigate('/clients'); break
        case 'k': case 'K': navigate('/checklist'); break
        case 'f': case 'F': navigate('/invoices'); break
        case 'd': case 'D': navigate('/'); break
        case '?': onSearch?.(); break
        default: break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, onSearch])
}
