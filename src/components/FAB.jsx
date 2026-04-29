import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Plus, ClipboardList, Users, Receipt, X } from 'lucide-react'

const fabActions = [
  { icon:ClipboardList, label:'Nová zakázka', to:'/orders?new=1', color:'bg-blue-500' },
  { icon:Users,         label:'Nový klient',  to:'/clients?new=1',color:'bg-purple-500' },
  { icon:Receipt,       label:'Nová faktura', to:'/invoices?new=1',color:'bg-amber-500' },
]

export function FAB() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function go(to) { setOpen(false); navigate(to) }

  return (
    <div className="lg:hidden fixed bottom-20 right-4 z-30 flex flex-col items-end gap-3">
      {/* Sub actions */}
      {open && (
        <>
          <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)}/>
          {fabActions.map((a, i) => (
            <div key={i} className="flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-150" style={{animationDelay:`${i*50}ms`}}>
              <span className="bg-white border border-border rounded-xl px-3 py-1.5 text-xs font-semibold shadow-md whitespace-nowrap">{a.label}</span>
              <button onClick={() => go(a.to)}
                className={cn('w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 touch-manipulation', a.color)}>
                <a.icon size={18}/>
              </button>
            </div>
          ))}
        </>
      )}
      {/* Main FAB */}
      <button onClick={() => setOpen(!open)}
        className={cn('w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-green-200 active:scale-95 touch-manipulation transition-all',
          open && 'bg-gray-700 shadow-gray-300'
        )}>
        <div className={cn('transition-transform duration-200', open && 'rotate-45')}>
          <Plus size={24}/>
        </div>
      </button>
    </div>
  )
}
