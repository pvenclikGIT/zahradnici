import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, getInitials, monthlyRevenue } from '../data'
import { StatCard, Card, CardHeader, CardTitle, CardContent, Button, StatusBadge, EmptyState, toast } from '../components/ui'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Plus, CalendarDays, CheckSquare, Receipt, Users, Send, BadgeDollarSign, ArrowRight, TrendingUp, TrendingDown, RotateCcw, Info } from 'lucide-react'
import { cn } from '../lib/utils'

const quickActions = [
  { to:'/orders?new=1',      icon:Plus,           label:'Nová zakázka'   },
  { to:'/clients?new=1',     icon:Users,          label:'Přidat klienta' },
  { to:'/checklist',         icon:CheckSquare,    label:'Checklist'      },
  { to:'/invoices?new=1',    icon:Receipt,        label:'Nová faktura'   },
  { to:'/notifications',     icon:Send,           label:'SMS klientovi'  },
  { to:'/pricelist',         icon:BadgeDollarSign,label:'Ceník'          },
]

const notifDot = { reminder:'bg-gray-400', invoice:'bg-destructive', weather:'bg-amber-500', review:'bg-green-500' }

export default function Dashboard() {
  const { clients, orders, invoices, resetDemo } = useApp()
  const [showReset, setShowReset] = useState(false)
  const today = new Date()

  const scheduledOrders  = orders.filter(o => o.status === 'scheduled')
  const completedOrders  = orders.filter(o => o.status === 'completed')
  const monthRevenue     = invoices.filter(i => i.paid).reduce((s,i) => s+i.amount, 0)
  const pendingInvoices  = invoices.filter(i => !i.paid)
  const pendingAmount    = pendingInvoices.reduce((s,i) => s+i.amount, 0)
  const overdueInvoices  = pendingInvoices.filter(i => new Date(i.dueDate) < today)
  const activeClients    = clients.filter(c => c.status === 'active').length

  const dayName = today.toLocaleDateString('cs-CZ', { weekday:'long' })
  const dateStr = today.toLocaleDateString('cs-CZ', { day:'numeric', month:'long', year:'numeric' })

  const getClient = id => clients.find(c => c.id === id)

  const notifications = [
    { id:1, type:'reminder', message:'Zítra návštěva u Horáčkové (09:00)',              time:'2 hod',  read:false },
    { id:2, type:'invoice',  message:'Faktura #2024018 po splatnosti — Kratochvílová',  time:'1 den',  read:false },
    { id:3, type:'weather',  message:'Déšť ve čtvrtek — 3 zakázky mohou být ovlivněny', time:'3 hod',  read:false },
    { id:4, type:'review',   message:'Dvořák zanechal hodnocení 5/5',                   time:'2 dny',  read:true  },
    { id:5, type:'reminder', message:'Hotel Galaxie — týdenní návštěva zítra',          time:'5 hod',  read:false },
  ]

  function handleReset() {
    resetDemo()
    setShowReset(false)
    toast('Demo data obnovena', 'success')
  }

  // Top 5 klientů dle tržeb
  const topClients = clients.map(c => ({
    ...c,
    revenue: orders.filter(o => o.clientId===c.id && o.paid).reduce((s,o) => s+o.totalPrice, 0),
    count:   orders.filter(o => o.clientId===c.id).length,
  })).sort((a,b) => b.revenue - a.revenue).slice(0,5)

  return (
    <div className="space-y-6">

      {/* Demo Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <Info size={16} className="text-amber-600 flex-shrink-0" />
        <p className="text-amber-800 flex-1">
          <span className="font-semibold">Demo verze</span> — data jsou ukázková. Vyzkoušejte si všechny funkce, nic se neztratí.
        </p>
        <button onClick={() => setShowReset(true)} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap">
          <RotateCcw size={12} /> Resetovat data
        </button>
      </div>

      {/* Reset confirm */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowReset(false)} />
          <div className="relative bg-white rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Resetovat demo data?</h3>
            <p className="text-sm text-muted-foreground mb-5">Všechny vaše změny budou ztraceny a data se vrátí do původního stavu.</p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setShowReset(false)}>Zrušit</Button>
              <Button variant="primary" className="flex-1" onClick={handleReset}>Resetovat</Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative bg-white rounded-2xl border border-border p-6 sm:p-8 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-green-50 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-serif-italic text-2xl sm:text-3xl text-foreground mb-1">Dobrý den, Jane.</h2>
            <p className="text-sm text-muted-foreground">
              {dayName.charAt(0).toUpperCase()+dayName.slice(1)}, {dateStr}
              &nbsp;·&nbsp;{scheduledOrders.length} {scheduledOrders.length===1?'naplánovaná zakázka':'naplánované zakázky'}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Nová zakázka</Button></Link>
              <Link to="/checklist"><Button size="sm"><CheckSquare size={14}/>Checklist</Button></Link>
              <Link to="/calendar"><Button size="sm"><CalendarDays size={14}/>Kalendář</Button></Link>
            </div>
          </div>
          <div className="sm:text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Brno · dnes</p>
            <p className="text-3xl font-bold tracking-tight">22°C</p>
            <p className="text-xs text-muted-foreground mt-1">Jasno, ideální podmínky</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Zítra: 18°C, déšť 60 %</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Příjmy celkem" value={formatCurrency(monthRevenue)} sub="↑ +18 % vs. loňský rok" subVariant="up" icon={TrendingUp} />
        <StatCard label="Zakázky" value={orders.length} sub={`${scheduledOrders.length} naplánovaných`} />
        <StatCard label="Aktivní klienti" value={activeClients} sub={`z ${clients.length} celkem`} icon={Users} />
        <StatCard
          label="Nezaplaceno"
          value={formatCurrency(pendingAmount)}
          sub={`${pendingInvoices.length} faktur${overdueInvoices.length ? `, ${overdueInvoices.length} po splatnosti` : ''}`}
          subVariant={overdueInvoices.length ? 'down' : undefined}
          icon={Receipt}
        />
      </div>

      {/* Revenue chart + Today */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle>Příjmy 2024</CardTitle>
            <span className="text-xs text-muted-foreground font-medium">{formatCurrency(monthRevenue)} celkem</span>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'#787870' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#787870' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${v/1000}k` : ''} />
                <Tooltip
                  formatter={v => [formatCurrency(v), 'Příjmy']}
                  contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #e8e8e4', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="revenue" fill="#348529" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Today's schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Dnešní plán</CardTitle>
            <Link to="/calendar"><Button variant="ghost" size="sm">Vše <ArrowRight size={12}/></Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            {scheduledOrders.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Dnes bez zakázek"
                action={<Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Přidat</Button></Link>} />
            ) : (
              <div className="divide-y divide-border">
                {scheduledOrders.slice(0,4).map((o,i) => {
                  const c = getClient(o.clientId)
                  return (
                    <Link key={o.id} to={`/checklist?order=${o.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/50 transition-colors">
                      <div className="text-sm font-bold text-primary w-10 text-center flex-shrink-0">{String(8+i*2).padStart(2,'0')}:00</div>
                      <div className="w-px h-7 bg-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{c?.name||'—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{o.services.join(' · ')}</p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0">{formatCurrency(o.totalPrice)}</p>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* Quick actions */}
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold tracking-tight mb-4">Rychlé akce</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickActions.map(({ to, icon:Icon, label }) => (
                <Link key={to} to={to} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-green-200 hover:bg-green-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                    <Icon size={15}/>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivita</CardTitle>
            <Link to="/notifications"><Button variant="ghost" size="sm">Vše</Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.slice(0,4).map(n => (
              <div key={n.id} className={cn('flex items-start gap-3 px-5 py-3 border-b border-border last:border-0', !n.read&&'bg-green-50/40')}>
                <span className={cn('w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0', notifDot[n.type])}/>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-snug', !n.read&&'font-medium')}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time} zpět</p>
                </div>
                {!n.read&&<span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-[7px]"/>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* Top clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top klienti dle tržeb</CardTitle>
            <Link to="/clients"><Button variant="ghost" size="sm">Všichni <ArrowRight size={12}/></Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            {topClients.map((c,i) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0">{i+1}</span>
                <div className="w-8 h-8 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count} zakázek</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(c.revenue)}</p>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width:`${Math.min(100,(c.revenue/topClients[0].revenue)*100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Unpaid invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Nezaplacené faktury</CardTitle>
            <Link to="/invoices"><Button variant="ghost" size="sm">Faktury</Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            {pendingInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Vše zaplaceno ✓</p>
            ) : pendingInvoices.map(inv => {
              const c = getClient(inv.clientId)
              const isOverdue = new Date(inv.dueDate) < today
              return (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0">
                  <div className="w-7 h-7 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-[10px] font-bold text-green-700 flex-shrink-0">
                    {getInitials(c?.name||'?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c?.name}</p>
                    <p className={cn('text-xs', isOverdue?'text-destructive font-medium':'text-muted-foreground')}>
                      {isOverdue?'⚠ Po splatnosti — ':''}{formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <p className={cn('text-sm font-bold flex-shrink-0', isOverdue&&'text-destructive')}>
                    {formatCurrency(inv.amount)}
                  </p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
