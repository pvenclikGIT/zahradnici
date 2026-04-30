import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { Plus, ClipboardList, Users, Receipt } from 'lucide-react'

const fabActions = [
  { icon:ClipboardList, label:'Nová zakázka', to:'/orders?new=1',  color:'bg-blue-500',   perm:'orders'   },
  { icon:Users,         label:'Nový klient',  to:'/clients?new=1', color:'bg-purple-500', perm:'clients'  },
  { icon:Receipt,       label:'Nová faktura', to:'/invoices?new=1',color:'bg-amber-500',  perm:'invoices' },
]

export function FAB() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  const { can } = useAuth() || { can: () => true }

  useEffect(() => {
    function onClickOutside(e) {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', onClickOutside)
      document.addEventListener('touchstart', onClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('touchstart', onClickOutside)
    }
  }, [open])

  function go(to) { setOpen(false); navigate(to) }
  const visibleActions = fabActions.filter(a => !a.perm || can(a.perm))

  return (
    <div ref={ref} className="lg:hidden fixed bottom-20 right-4 z-30 flex flex-col items-end gap-3">
      {open && visibleActions.map((a, i) => (
        <div key={i} className="flex items-center gap-2" style={{animation:`fadeInUp 0.2s ease ${i*40}ms backwards`}}>
          <span className="bg-white border border-border rounded-xl px-3 py-1.5 text-xs font-semibold shadow-md whitespace-nowrap">{a.label}</span>
          <button onClick={() => go(a.to)}
            className={cn('w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 touch-manipulation', a.color)}>
            <a.icon size={18}/>
          </button>
        </div>
      ))}
      <button onClick={() => setOpen(!open)}
        className={cn('w-14 h-14 rounded-full text-white flex items-center justify-center shadow-xl active:scale-95 touch-manipulation transition-all',
          open ? 'bg-gray-700 shadow-gray-400' : 'bg-primary shadow-green-200'
        )}>
        <div className={cn('transition-transform duration-200', open && 'rotate-45')}>
          <Plus size={24}/>
        </div>
      </button>
    </div>
  )
}
