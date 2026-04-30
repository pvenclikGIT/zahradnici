import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, business } from '../data'
import { cn } from '../lib/utils'
import { MapPin, Phone, Mail, Leaf, CheckCircle, Clock, AlertCircle, TrendingUp, Delete, CalendarDays, Receipt, ClipboardList, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// ── PIN Login ────────────────────────────────
function PortalLogin({ client, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  function pressKey(key) {
    if (pin.length >= 4) return
    const next = pin + key
    setPin(next)
    setError('')
    if (next.length === 4) {
      setTimeout(() => {
        if (next === (client.clientPin || '4455')) {
          onSuccess()
        } else {
          setError('Špatný PIN. Zkuste znovu.')
          setPin('')
          setShake(true)
          setTimeout(() => setShake(false), 500)
        }
      }, 150)
    }
  }

  function backspace() { setPin(p => p.slice(0,-1)); setError('') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
          <Leaf size={20} className="text-green-400" strokeWidth={2}/>
        </div>
        <div>
          <p className="text-lg font-bold text-white tracking-tight">{business.name}</p>
          <p className="text-xs text-white/40">Klientský portál</p>
        </div>
      </div>

      <div className={cn('w-full max-w-xs', shake && 'animate-bounce')}>
        {/* Client info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-xl font-bold text-white mb-3">
            {client.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <h1 className="text-xl font-bold text-white">{client.name.split(' ')[0]}</h1>
          <p className="text-sm text-white/40 mt-0.5">Zadejte PIN pro přístup</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0,1,2,3].map(i => (
            <div key={i} className={cn('w-4 h-4 rounded-full border-2 transition-all duration-150',
              pin.length > i ? 'bg-green-400 border-green-400 scale-110' : 'border-white/30'
            )}/>
          ))}
        </div>

        {error && <p className="text-center text-sm text-red-400 font-medium mb-5">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((key, idx) => {
            if (key === '') return <div key={idx}/>
            if (key === 'del') return (
              <button key={idx} onClick={backspace}
                className="h-16 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/15 active:scale-95 transition-all touch-manipulation">
                <Delete size={20}/>
              </button>
            )
            return (
              <button key={idx} onClick={() => pressKey(String(key))}
                className="h-16 rounded-2xl bg-white/10 border border-white/10 text-white text-xl font-semibold hover:bg-white/20 active:scale-95 transition-all touch-manipulation select-none">
                {key}
              </button>
            )
          })}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">Demo PIN: 4455</p>
      </div>
    </div>
  )
}

// ── Client Dashboard ─────────────────────────
function ClientDashboard({ client }) {
  const { orders, invoices } = useApp()
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  const myOrders   = orders.filter(o => o.clientId === client.id).sort((a,b) => new Date(b.date)-new Date(a.date))
  const myInvoices = invoices.filter(i => i.clientId === client.id).sort((a,b) => new Date(b.date)-new Date(a.date))
  const upcoming   = myOrders.filter(o => o.status==='scheduled' && o.date >= todayISO)
  const completed  = myOrders.filter(o => o.status==='completed')
  const pending    = myInvoices.filter(i => !i.paid)
  const totalPaid  = myInvoices.filter(i=>i.paid).reduce((s,i)=>s+i.amount,0)
  const overdueInv = pending.filter(i => new Date(i.dueDate) < today)

  // Monthly spend for chart — last 6 months
  const monthlySpend = Array.from({length:6}, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth()-5+i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const label = d.toLocaleDateString('cs-CZ',{month:'short'})
    const amount = myInvoices.filter(inv => inv.paid && inv.date?.startsWith(key)).reduce((s,inv)=>s+inv.amount,0)
    return { label, amount }
  })

  const nextVisit = upcoming[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
              <Leaf size={15} className="text-green-400"/>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">{business.name}</p>
              <p className="text-[10px] text-gray-500">Váš zákaznický portál</p>
            </div>
          </div>
          <a href={`tel:${business.phone}`} className="text-xs font-semibold text-green-600 hover:underline hidden sm:block">{business.phone}</a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Welcome hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-6 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-green-900/20 to-transparent"/>
          <div className="relative">
            <p className="text-xs text-white/50 mb-1">Dobrý den,</p>
            <h1 className="text-2xl font-bold tracking-tight">{client.name.split(' ')[0]} {client.name.split(' ')[1] || ''}</h1>
            <p className="text-sm text-white/60 mt-1 flex items-center gap-1.5"><MapPin size={12}/>{client.address}</p>
            {nextVisit && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-xl px-3 py-2">
                <CalendarDays size={14} className="text-green-400"/>
                <span className="text-sm font-medium">Příští návštěva: <span className="font-bold text-green-300">{formatDate(nextVisit.date)}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Zakázek celkem', value: myOrders.length,          icon:ClipboardList, color:'text-blue-600'  },
            { label:'Zaplaceno',      value: formatCurrency(totalPaid), icon:CheckCircle,   color:'text-green-600' },
            { label:'Čeká na platbu', value: pending.length > 0 ? formatCurrency(pending.reduce((s,i)=>s+i.amount,0)) : '—', icon:Clock, color: pending.length ? 'text-amber-600' : 'text-gray-400' },
            { label:'Hodnocení',      value: '5 / 5',                   icon:Star,          color:'text-yellow-500'},
          ].map(({ label, value, icon:Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
              <Icon size={16} className={cn('mb-2', color)}/>
              <p className={cn('text-lg font-bold tracking-tight', color)}>{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {overdueInv.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5"/>
            <div className="flex-1">
              <p className="font-semibold text-red-700 text-sm">Faktura po splatnosti</p>
              <p className="text-xs text-red-600 mt-0.5">{overdueInv.length} faktura čeká na úhradu — {formatCurrency(overdueInv.reduce((s,i)=>s+i.amount,0))}</p>
            </div>
            <a href={`tel:${business.phone}`}>
              <button className="text-xs font-bold text-red-600 hover:text-red-700 whitespace-nowrap">Kontaktovat</button>
            </a>
          </div>
        )}

        {/* Upcoming orders */}
        {upcoming.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-2"><CalendarDays size={15} className="text-primary"/>Nadcházející návštěvy</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {upcoming.map(o => {
                const dt = new Date(o.date)
                const isToday = o.date===todayISO
                const isTomorrow = o.date===new Date(Date.now()+86400000).toISOString().split('T')[0]
                return (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-4">
                    <div className={cn('text-center w-12 rounded-xl py-2 border flex-shrink-0', isToday?'bg-primary border-primary':'bg-green-50 border-green-100')}>
                      <p className={cn('text-lg font-bold leading-none', isToday?'text-white':'text-primary')}>{dt.getDate()}</p>
                      <p className={cn('text-[10px] uppercase mt-0.5', isToday?'text-white/70':'text-gray-400')}>
                        {['led','úno','bře','dub','kvě','čer','čvc','srp','zář','říj','lis','pro'][dt.getMonth()]}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{o.services.slice(0,2).join(', ')}</p>
                        {isToday && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">Dnes</span>}
                        {isTomorrow && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Zítra</span>}
                      </div>
                      {o.services.length > 2 && <p className="text-xs text-gray-400 mt-0.5">+{o.services.length-2} další práce</p>}
                    </div>
                    <p className="font-bold text-sm text-primary flex-shrink-0">{formatCurrency(o.totalPrice)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Spending chart */}
        {totalPaid > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-sm tracking-tight mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-primary"/>Vaše výdaje — posledních 6 měsíců</h2>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlySpend} margin={{top:4,right:4,left:-24,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f3" vertical={false}/>
                <XAxis dataKey="label" tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={v=>v>0?`${v/1000}k`:''}/>
                <Tooltip formatter={v=>[formatCurrency(v),'Výdaje']} contentStyle={{fontSize:12,borderRadius:10,border:'1px solid #e5e7eb'}}/>
                <Bar dataKey="amount" fill="#348529" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Invoices */}
        {myInvoices.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-sm tracking-tight flex items-center gap-2"><Receipt size={15} className="text-primary"/>Vaše faktury</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {myInvoices.map(inv => {
                const isOverdue = !inv.paid && new Date(inv.dueDate) < today
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-5 py-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                      inv.paid?'bg-green-50':'isOverdue'?'bg-red-50':'bg-amber-50'
                    )}>
                      {inv.paid
                        ? <CheckCircle size={16} className="text-green-500"/>
                        : isOverdue
                          ? <AlertCircle size={16} className="text-red-500"/>
                          : <Clock size={16} className="text-amber-500"/>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Faktura #{inv.id}</p>
                      <p className={cn('text-xs mt-0.5',
                        inv.paid?'text-green-600':isOverdue?'text-red-500':'text-amber-600'
                      )}>
                        {inv.paid ? `Zaplaceno ${formatDate(inv.paidDate)}` : isOverdue ? `Po splatnosti od ${formatDate(inv.dueDate)}` : `Splatnost ${formatDate(inv.dueDate)}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn('text-sm font-bold', inv.paid?'text-gray-700':isOverdue?'text-red-600':'text-amber-600')}>
                        {formatCurrency(inv.amount)}
                      </p>
                      {!inv.paid && (
                        <a href={`tel:${business.phone}`} className="text-[10px] font-bold text-primary hover:underline mt-0.5 block">
                          Zaplatit
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-sm tracking-tight flex items-center gap-2"><ClipboardList size={15} className="text-primary"/>Historie zakázek</h2>
          </div>
          {completed.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Zatím žádné dokončené zakázky</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {completed.slice(0,8).map(o => (
                <div key={o.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.services.join(', ')}</p>
                    <p className="text-xs text-gray-400">{formatDate(o.date)}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-700 flex-shrink-0">{formatCurrency(o.totalPrice)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact footer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center space-y-2">
          <p className="text-sm font-semibold">{business.name}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium">
              <Phone size={14}/>{business.phone}
            </a>
            <a href={`mailto:${business.email}`} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
              <Mail size={14}/>{business.email}
            </a>
          </div>
          <p className="text-xs text-gray-300">{business.address}</p>
        </div>

        <p className="text-center text-[10px] text-gray-300 pb-4">ZahradaPro Klientský portál · Zabezpečeno PIN kódem</p>
      </div>
    </div>
  )
}

// ── Main Portal component ─────────────────────
export function Portal() {
  const { id } = useParams()
  const { clients } = useApp()
  const [authenticated, setAuthenticated] = useState(false)

  const client = clients.find(c => c.id === parseInt(id))

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Leaf size={22} className="text-green-400"/>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Portál nenalezen</h1>
          <p className="text-sm text-white/40">Odkaz není platný nebo vypršel.</p>
          <p className="text-xs text-white/20 mt-2">{business.phone}</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <PortalLogin client={client} onSuccess={() => setAuthenticated(true)}/>
  }

  return <ClientDashboard client={client}/>
}
