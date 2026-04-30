import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { cn } from '../lib/utils'
import { Search, X, Users, ClipboardList, Receipt, ArrowRight } from 'lucide-react'

export function GlobalSearch({ onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef()
  const navigate = useNavigate()
  const { clients, orders, invoices } = useApp()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    const lq = q.toLowerCase()
    const res = []

    clients.filter(c =>
      c.name.toLowerCase().includes(lq) ||
      c.address.toLowerCase().includes(lq) ||
      c.phone.includes(lq)
    ).slice(0,3).forEach(c => res.push({
      type:'client', icon:Users, label:c.name,
      sub: c.address, to:`/clients`, id:c.id,
      badge: c.tags[0]
    }))

    orders.filter(o => {
      const c = clients.find(x=>x.id===o.clientId)
      return c?.name.toLowerCase().includes(lq) ||
             o.services.join(' ').toLowerCase().includes(lq)
    }).slice(0,3).forEach(o => {
      const c = clients.find(x=>x.id===o.clientId)
      res.push({
        type:'order', icon:ClipboardList, label:c?.name||'—',
        sub:`${o.services.slice(0,2).join(', ')} · ${formatDate(o.date)}`,
        to:`/orders`, badge: o.status==='scheduled'?'Naplánováno':'Dokončeno',
        badgeColor: o.status==='scheduled'?'blue':'green'
      })
    })

    invoices.filter(i => {
      const c = clients.find(x=>x.id===i.clientId)
      return c?.name.toLowerCase().includes(lq) || i.id.includes(lq)
    }).slice(0,2).forEach(i => {
      const c = clients.find(x=>x.id===i.clientId)
      res.push({
        type:'invoice', icon:Receipt, label:`Faktura #${i.id}`,
        sub:`${c?.name} · ${formatCurrency(i.amount)}`,
        to:`/invoices`, badge: i.paid?'Zaplaceno':'Čeká',
        badgeColor: i.paid?'green':'amber'
      })
    })

    setResults(res)
  }, [q, clients, orders, invoices])

  function go(to) { navigate(to); onClose() }

  const badgeClass = {
    blue:  'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center sm:pt-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <div onClick={e => e.stopPropagation()} className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg sm:m-4 border border-border flex flex-col overflow-hidden" style={{maxHeight:'calc(100dvh - 16px)'}}>
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 sm:py-3.5 border-b border-border flex-shrink-0">
          <Search size={16} className="text-muted-foreground flex-shrink-0"/>
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Hledat klienta, zakázku, fakturu…"
            className="flex-1 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
            onKeyDown={e => e.key === 'Escape' && onClose()}
          />
          {q && (
            <button onClick={() => setQ('')} className="p-1 rounded-lg hover:bg-accent touch-manipulation">
              <X size={14} className="text-muted-foreground"/>
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-muted text-[10px] font-medium text-muted-foreground border border-border">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {results.map((r, i) => (
              <button key={i} onClick={() => go(r.to)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left touch-manipulation">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <r.icon size={15} className="text-muted-foreground"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                </div>
                {r.badge && (
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0', badgeClass[r.badgeColor||'green'])}>
                    {r.badge}
                  </span>
                )}
                <ArrowRight size={13} className="text-muted-foreground flex-shrink-0"/>
              </button>
            ))}
          </div>
        )}

        {q && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">Žádné výsledky pro <span className="font-medium text-foreground">"{q}"</span></p>
          </div>
        )}

        {!q && (
          <div className="px-4 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rychlé akce</p>
            <div className="space-y-1">
              {[
                ['/orders?new=1', ClipboardList, 'Nová zakázka'],
                ['/clients?new=1', Users, 'Nový klient'],
                ['/invoices?new=1', Receipt, 'Nová faktura'],
              ].map(([to, Icon, label]) => (
                <button key={to} onClick={() => go(to)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-left touch-manipulation">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-green-600"/>
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function KeyboardShortcutsHelp({ onClose }) {
  const shortcuts = [
    ['N', 'Nová zakázka'],
    ['C', 'Klienti'],
    ['K', 'Checklist'],
    ['F', 'Faktury'],
    ['D', 'Dashboard'],
    ['⌘ K', 'Vyhledávání'],
    ['?', 'Tato nápověda'],
  ]
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <div onClick={e => e.stopPropagation()} className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5 sm:p-6 w-full sm:max-w-sm sm:m-4" style={{paddingBottom:'max(20px, env(safe-area-inset-bottom))'}}>
        <div className="sm:hidden flex justify-center -mt-2 mb-3"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold tracking-tight">Klávesové zkratky</h2>
          <button onClick={onClose} className="w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center hover:bg-accent"><X size={14}/></button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <kbd className="px-2 py-1 bg-muted border border-border rounded-lg text-xs font-bold font-mono">{key}</kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">Zkratky nefungují při psaní do formuláře.</p>
      </div>
    </div>
  )
}
