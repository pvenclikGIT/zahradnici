import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { Wrench, Sunrise, ArrowRight as ArrowRightIcon } from 'lucide-react'
import { formatCurrency, formatDate, getInitials, monthlyRevenue } from '../data'
import { StatCard, Card, CardHeader, CardTitle, CardContent, Button, StatusBadge, EmptyState, toast } from '../components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton, SkeletonCard } from '../components/ui'
import { Plus, CalendarDays, CheckSquare, Receipt, Users, Send, BadgeDollarSign, ArrowRight, TrendingUp, MapPin, RotateCcw, Info, Map, AlertCircle, Clock } from 'lucide-react'
import { ClientMap } from '../components/ClientMap'
import { usePageLoad } from '../hooks/usePageLoad'
import { cn } from '../lib/utils'

const quickActions = [
  { to:'/orders?new=1',   icon:Plus,           label:'Nova zakázka'  },
  { to:'/clients?new=1',  icon:Users,          label:'Pridat klienta'},
  { to:'/checklist',      icon:CheckSquare,    label:'Checklist'     },
  { to:'/invoices?new=1', icon:Receipt,        label:'Nova faktura'  },
  { to:'/notifications',  icon:Send,           label:'SMS klientovi' },
  { to:'/pricelist',      icon:BadgeDollarSign,label:'Cenik'         },
]

export default function Dashboard() {
  const { clients, orders, invoices, receipts, workers, absences, resetDemo } = useApp()
  const loaded = usePageLoad(400)
  const [showReset, setShowReset] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  const scheduledOrders = orders.filter(o => o.status === 'scheduled')
  const completedOrders  = orders.filter(o => o.status === 'completed')
  const todayOrders     = scheduledOrders.filter(o => o.date === todayISO)
  const tomorrowOrders  = scheduledOrders.filter(o => o.date === new Date(Date.now()+86400000).toISOString().split('T')[0])
  const weekOrders      = scheduledOrders.filter(o => { const d=new Date(o.date); const w=new Date(today); w.setDate(w.getDate()+7); return d>=today&&d<=w })

  const monthRevenue  = invoices.filter(i=>i.paid).reduce((s,i)=>s+i.amount,0)
  const pendingInvs   = invoices.filter(i=>!i.paid)
  const overdueInvs   = pendingInvs.filter(i=>new Date(i.dueDate)<today)
  const pendingAmount = pendingInvs.reduce((s,i)=>s+i.amount,0)
  const activeClients = clients.filter(c=>c.status==='active').length

  // Forecast
  const forecastRevenue = scheduledOrders.reduce((s,o)=>s+o.totalPrice,0)

  const dayName = today.toLocaleDateString('cs-CZ', { weekday:'long' })
  const dateStr = today.toLocaleDateString('cs-CZ', { day:'numeric', month:'long', year:'numeric' })


  // Churn — clients with no order in last 60 days

  // Costs analysis
  const thisMonth = new Date()
  const monthCosts = receipts.filter(r => {
    const rd = new Date(r.date)
    return rd.getMonth() === thisMonth.getMonth() && rd.getFullYear() === thisMonth.getFullYear()
  }).reduce((s,r) => s+r.amount, 0)
  const monthProfit = monthRevenue - monthCosts
  const profitMargin = monthRevenue > 0 ? Math.round((monthProfit / monthRevenue) * 100) : 0
  const rebillPending = receipts.filter(r => r.rebill && !r.rebilled)

  const churnedClients = clients.filter(c => {
    if (c.status !== 'active') return false
    const last = orders.filter(o=>o.clientId===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
    if (!last) return true
    return (Date.now() - new Date(last.date)) > 60*24*3600*1000
  })
  const avgOrderValue = orders.length ? Math.round(orders.reduce((s,o)=>s+o.totalPrice,0)/orders.length) : 0

  const getClient = id => clients.find(c=>c.id===id)

  // Top clients
  const topClients = clients.map(c=>({
    ...c,
    revenue: orders.filter(o=>o.clientId===c.id&&o.paid).reduce((s,o)=>s+o.totalPrice,0),
    count: orders.filter(o=>o.clientId===c.id).length,
  })).sort((a,b)=>b.revenue-a.revenue).slice(0,5)

  const notifDot = { reminder:'bg-gray-400', invoice:'bg-destructive', weather:'bg-amber-500', payment:'bg-green-500', nocontact:'bg-orange-500', review:'bg-yellow-500' }

  if (!loaded) return (
    <div className="space-y-5 animate-pulse">
      <Skeleton className="h-10 w-full rounded-xl"/>
      <Skeleton className="h-32 w-full rounded-2xl"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl"/>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Skeleton className="h-64 rounded-xl"/>
        <Skeleton className="h-64 rounded-xl"/>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Map modal */}
      {showMap && <ClientMap onClose={() => setShowMap(false)}/>}

      {/* Demo banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info size={15} className="text-amber-600 flex-shrink-0"/>
        <p className="text-sm text-amber-800 flex-1 min-w-0">
          <span className="font-semibold">Demo verze</span> — Praha Východ. Vyzkoušejte všechny funkce.
        </p>
        <button onClick={() => setShowReset(true)} className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap touch-manipulation">
          <RotateCcw size={11}/>Reset
        </button>
      </div>

      {/* Reset confirm */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setShowReset(false)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-sm sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5 sm:p-6" style={{paddingBottom:'max(20px, env(safe-area-inset-bottom))'}}>
            <div className="sm:hidden flex justify-center -mt-2 mb-3"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={20} className="text-amber-600"/>
            </div>
            <h3 className="font-bold text-base text-center mb-2">Resetovat demo data?</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">Všechna vaše data budou nahrazena výchozími demo daty. Tato akce je nevratná.</p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setShowReset(false)}>Zrušit</Button>
              <Button variant="danger" className="flex-1" onClick={() => { resetDemo(); setShowReset(false); toast('Demo data resetována') }}>Resetovat</Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative bg-white rounded-2xl border border-border p-5 sm:p-7 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-green-50 to-transparent pointer-events-none"/>
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-serif-italic text-xl sm:text-3xl text-foreground mb-1 leading-tight">Dobrý den, Jane.</h2>
            <p className="text-sm text-muted-foreground">
              {dayName.charAt(0).toUpperCase()+dayName.slice(1)}, {dateStr}
              {scheduledOrders.length > 0 && <span> · <span className="font-medium text-foreground">{scheduledOrders.length} naplánovaných zakázek</span></span>}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Nová zakázka</Button></Link>
              <Link to="/checklist"><Button size="sm"><CheckSquare size={14}/>Checklist</Button></Link>
              <Button size="sm" onClick={() => setShowMap(true)} className="gap-1.5"><Map size={14}/>Mapa klientů</Button>
            </div>
          </div>
          <div className="sm:text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">Praha Východ · dnes</p>
            <p className="text-3xl font-bold tracking-tight mt-1">22°C</p>
            <p className="text-xs text-muted-foreground mt-1">Jasno, ideální podmínky</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Zítra: 18°C, déšť 60 %</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Příjmy celkem" value={formatCurrency(monthRevenue)} sub="↑ +18 % vs. loni" subVariant="up" icon={TrendingUp}/>
        <StatCard label="Zakázky" value={orders.length} sub={`${scheduledOrders.length} naplánovaných`}/>
        <StatCard label="Aktivní klienti" value={activeClients} sub={`z ${clients.length} celkem · ${churnedClients.length} neaktivních`} icon={Users}/>
        <StatCard
          label="Nezaplaceno"
          value={formatCurrency(pendingAmount)}
          sub={`${pendingInvs.length} faktur${overdueInvs.length ? ` · ${overdueInvs.length} po splatnosti` : ''}`}
          subVariant={overdueInvs.length ? 'down' : undefined}
          color={overdueInvs.length ? 'text-destructive' : undefined}
          icon={Receipt}
        />
      </div>

      {/* Today + Forecast row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Dnešní přehled</p>
            <div className="space-y-2.5">
              {[
                { label:'Dnes', value:todayOrders.length, color:'text-primary', sub:'zakázek' },
                { label:'Zítra', value:tomorrowOrders.length, color:'text-foreground', sub:'zakázek' },
                { label:'Tento týden', value:weekOrders.length, color:'text-foreground', sub:'zakázek' },
              ].map(({ label, value, color, sub }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className={cn('font-bold tabular-nums', color)}>{value} <span className="font-normal text-xs text-muted-foreground">{sub}</span></span>
                </div>
              ))}
              <div className="pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tržby tento měsíc</span>
                  <span className="font-bold text-sm">{formatCurrency(monthRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Výdaje (účtenky)</span>
                  <span className="font-bold text-amber-600 text-sm">−{formatCurrency(monthCosts)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                  <span className="text-sm font-semibold">Čistý zisk</span>
                  <span className={cn('font-bold text-sm', monthProfit >= 0 ? 'text-green-600' : 'text-destructive')}>{formatCurrency(monthProfit)} <span className="text-[10px] font-normal opacity-70">({profitMargin} %)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Forecast</span>
                  <span className="font-bold text-green-600 text-sm">{formatCurrency(forecastRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prům. zakázka</span>
                  <span className="font-bold text-sm">{formatCurrency(avgOrderValue)}</span>
                </div>
                {churnedClients.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Neaktivní klienti</span>
                    <span className="font-bold text-amber-600 text-sm">{churnedClients.length}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue alert */}
        {overdueInvs.length > 0 ? (
          <Card className="sm:col-span-1 border-red-200 bg-red-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle size={15} className="text-destructive mt-0.5 flex-shrink-0"/>
                <p className="text-sm font-semibold text-destructive">Po splatnosti</p>
              </div>
              <div className="space-y-2">
                {overdueInvs.slice(0,3).map(inv => {
                  const c = getClient(inv.clientId)
                  return (
                    <div key={inv.id} className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium truncate">{c?.name}</p>
                      <p className="text-xs font-bold text-destructive flex-shrink-0">{formatCurrency(inv.amount)}</p>
                    </div>
                  )
                })}
              </div>
              <Link to="/invoices?filter=overdue">
                <Button size="sm" className="w-full mt-3 gap-1.5"><Receipt size={12}/>Zobrazit faktury</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="sm:col-span-1 border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full min-h-[120px]">
              <CheckSquare size={20} className="text-green-500 mb-2"/>
              <p className="text-sm font-semibold text-green-700">Vše zaplaceno</p>
              <p className="text-xs text-green-600 mt-0.5">Žádné faktury po splatnosti</p>
            </CardContent>
          </Card>
        )}

        {/* Weather forecast */}
        <Card className="sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Počasí tento týden</p>
            <div className="space-y-2">
              {[
                { day:'Dnes',    temp:'22°C', desc:'Jasno',     ok:true  },
                { day:'Zítra',   temp:'19°C', desc:'Polojasno', ok:true  },
                { day:'St',      temp:'15°C', desc:'Déšť 60 %', ok:false },
                { day:'Čt',      temp:'17°C', desc:'Oblačno',   ok:true  },
                { day:'Pá',      temp:'21°C', desc:'Slunečno',  ok:true  },
              ].map(({ day, temp, desc, ok }) => (
                <div key={day} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground w-10">{day}</span>
                  <span className="font-bold tabular-nums">{temp}</span>
                  <span className={cn('text-right flex-1 ml-2', ok?'text-muted-foreground':'text-amber-600 font-medium')}>{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart + Today schedule */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Příjmy 2025–2026</CardTitle>
            <span className="text-xs text-muted-foreground">{formatCurrency(monthRevenue)} celkem</span>
          </CardHeader>
          <CardContent className="pt-2 px-4 pb-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyRevenue} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:10, fill:'#787870' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'#787870' }} axisLine={false} tickLine={false} tickFormatter={v=>v>0?`${v/1000}k`:''}/>
                <Tooltip formatter={v=>[formatCurrency(v),'Příjmy']} contentStyle={{ fontSize:12, borderRadius:10, border:'1px solid #e8e8e4', boxShadow:'0 4px 12px rgba(0,0,0,0.08)' }}/>
                <Bar dataKey="revenue" fill="#348529" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dnešní plán</CardTitle>
            <Link to="/calendar"><Button variant="ghost" size="sm">Vše <ArrowRight size={12}/></Button></Link>
          </CardHeader>
          <CardContent className="p-0">
            {scheduledOrders.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Dnes bez zakázek"
                action={<Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Přidat</Button></Link>}/>
            ) : (
              <div className="divide-y divide-border">
                {scheduledOrders.slice(0,5).map((o, i) => {
                  const c = getClient(o.clientId)
                  const h = 8 + i * 2
                  const isToday = o.date === todayISO
                  return (
                    <Link key={o.id} to={`/checklist?order=${o.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors">
                      <div className={cn('text-xs font-bold w-10 text-center flex-shrink-0', isToday?'text-primary':'text-muted-foreground')}>
                        {String(h).padStart(2,'0')}:00
                      </div>
                      <div className="w-px h-7 bg-border flex-shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{c?.name||'—'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><MapPin size={9}/>{c?.city||c?.address?.split(',').pop()?.trim()}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold hidden sm:block">{formatCurrency(o.totalPrice)}</span>
                        <StatusBadge status={o.status}/>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* End of day summary — show after 16:00 */}
      {new Date().getHours() >= 16 && (completedOrders.length > 0 || pendingInvs.length > 0) && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2">Souhrn dne</p>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">
                    Dokončeno: <span className="font-bold text-green-700">{completedOrders.filter(o => o.date === todayISO).length} zakázek</span>
                  </p>
                  {pendingInvs.length > 0 && (
                    <p className="text-sm font-medium">
                      Čeká na platbu: <span className="font-bold text-amber-600">{formatCurrency(pendingAmount)}</span>
                    </p>
                  )}
                  {overdueInvs.length > 0 && (
                    <p className="text-sm font-medium text-destructive">
                      Po splatnosti: {overdueInvs.length} faktur
                    </p>
                  )}
                </div>
              </div>
              <Link to="/invoices">
                <Button size="sm" className="flex-shrink-0">Faktury</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Churn rate warning */}
      {churnedClients.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-700 mb-1">Klienti bez aktivity</p>
                <p className="text-2xl font-bold tracking-tight">{churnedClients.length}</p>
                <p className="text-sm text-muted-foreground mt-1">klientů neobjednalo 60+ dní</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {churnedClients.slice(0,3).map(c => (
                    <span key={c.id} className="text-[10px] font-medium bg-white border border-orange-200 px-2 py-0.5 rounded-full text-orange-700">
                      {c.name.split(' ').slice(-1)[0]}
                    </span>
                  ))}
                  {churnedClients.length > 3 && <span className="text-[10px] text-muted-foreground">+{churnedClients.length-3} dalších</span>}
                </div>
              </div>
              <Link to="/notifications">
                <Button size="sm" className="flex-shrink-0 gap-1"><Send size={12}/>Oslovit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Pre-trip reminder for today */}
      {(() => {
        const todayOrders = orders.filter(o => o.date === todayISO && o.status !== 'completed')
        if (todayOrders.length === 0) return null
        return (
          <Link to="/equipment" className="block">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 hover:shadow-lg hover:-translate-y-px transition-all">
              <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200">
                  <Sunrise size={22} className="text-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold tracking-tight text-base">Připravit vybavení na dnešek</p>
                  <p className="text-sm text-muted-foreground">{todayOrders.length} {todayOrders.length === 1 ? 'zakázka' : todayOrders.length < 5 ? 'zakázky' : 'zakázek'} — projděte si pre-trip checklist</p>
                </div>
                <Wrench size={18} className="text-amber-600 flex-shrink-0"/>
              </CardContent>
            </Card>
          </Link>
        )
      })()}

      {/* Team status today */}
      <Card>
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 flex items-center justify-between">
          <CardTitle>Stav týmu dnes</CardTitle>
          <Link to="/team"><Button variant="ghost" size="sm">Detail <ArrowRight size={12}/></Button></Link>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {workers.filter(w => w.active).map(w => {
            const ab = absences.find(a => {
              if (a.workerId !== w.id || a.status !== 'approved') return false
              const d = new Date(todayISO)
              return d >= new Date(a.dateFrom) && d <= new Date(a.dateTo)
            })
            const ord = orders.filter(o => o.workerId === w.id && o.date === todayISO)
            return (
              <Link key={w.id} to="/team" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{backgroundColor: w.color}}>
                  {w.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.role === 'owner' ? 'Majitel' : w.role === 'worker' ? 'Zahradník' : 'Účetní'}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {ab ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                      Volno
                    </span>
                  ) : ord.length > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-300">
                      {ord.length} {ord.length === 1 ? 'zakázka' : 'zakázek'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      Volný den
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </CardContent>
      </Card>

      {/* Quick actions + Top clients */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <p className="text-sm font-semibold tracking-tight mb-4">Rychlé akce</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickActions.map(({ to, icon:Icon, label }) => (
                <Link key={to} to={to}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-green-200 hover:bg-green-50 transition-all group cursor-pointer touch-manipulation active:scale-[0.97]">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                    <Icon size={15}/>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top klienti</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowMap(true)} className="gap-1.5"><Map size={13}/>Mapa</Button>
          </CardHeader>
          <CardContent className="p-0">
            {topClients.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-4 flex-shrink-0 text-center">{i+1}</span>
                <div className="w-7 h-7 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-[10px] font-bold text-green-700 flex-shrink-0">
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count} zakázek</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(c.revenue)}</p>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{width:`${Math.min(100,(c.revenue/(topClients[0]?.revenue||1))*100)}%`}}/>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
