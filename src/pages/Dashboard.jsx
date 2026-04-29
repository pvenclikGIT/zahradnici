import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, formatDateShort, getInitials } from '../data'
import { StatCard, Card, CardHeader, CardTitle, CardContent, Button, StatusBadge, EmptyState, SectionHeader } from '../components/ui'
import {
  Plus, CalendarDays, CheckSquare, Receipt, Users,
  Send, BadgeDollarSign, ArrowRight, TrendingUp, MapPin
} from 'lucide-react'
import { cn } from '../lib/utils'

const quickActions = [
  { to: '/orders?new=1',       icon: Plus,           label: 'Nová zakázka' },
  { to: '/clients?new=1',      icon: Users,          label: 'Přidat klienta' },
  { to: '/checklist',          icon: CheckSquare,    label: 'Checklist' },
  { to: '/invoices?new=1',     icon: Receipt,        label: 'Nová faktura' },
  { to: '/notifications',      icon: Send,           label: 'SMS klientovi' },
  { to: '/pricelist',          icon: BadgeDollarSign,label: 'Ceník' },
]

const notifDot = { reminder: 'bg-gray-400', invoice: 'bg-destructive', weather: 'bg-amber-500', review: 'bg-green-500' }

export default function Dashboard() {
  const { clients, orders, invoices } = useApp()
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  const scheduledOrders = orders.filter(o => o.status === 'scheduled')
  const monthRevenue    = orders.filter(o => o.paid).reduce((s, o) => s + o.totalPrice, 0)
  const pendingInvoices = invoices.filter(i => !i.paid)
  const pendingAmount   = pendingInvoices.reduce((s, i) => s + i.amount, 0)
  const overdueCount    = pendingInvoices.filter(i => new Date(i.dueDate) < today).length
  const activeClients   = clients.filter(c => c.status === 'active').length

  const dayName = today.toLocaleDateString('cs-CZ', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })

  const getClient = id => clients.find(c => c.id === id)

  const notifications = [
    { id: 1, type: 'reminder', message: 'Zítra návštěva u Horáčkové (09:00)', time: '2 hod', read: false },
    { id: 2, type: 'invoice',  message: 'Faktura #2024003 po splatnosti — Kratochvílová', time: '1 den', read: false },
    { id: 3, type: 'weather',  message: 'Déšť ve čtvrtek — 3 zakázky mohou být ovlivněny', time: '3 hod', read: false },
    { id: 4, type: 'review',   message: 'Dvořák zanechal hodnocení 5/5', time: '1 den', read: true },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative bg-white rounded-2xl border border-border p-6 sm:p-8 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-green-50 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-serif-italic text-2xl sm:text-3xl text-foreground mb-1">
              Dobrý den, Jane.
            </h2>
            <p className="text-sm text-muted-foreground">
              {dayName.charAt(0).toUpperCase() + dayName.slice(1)}, {dateStr}
              &nbsp;·&nbsp;
              {scheduledOrders.length} {scheduledOrders.length === 1 ? 'naplánovaná zakázka' : 'naplánované zakázky'}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <Link to="/orders?new=1">
                <Button variant="primary" size="sm"><Plus size={14} /> Nová zakázka</Button>
              </Link>
              <Link to="/checklist">
                <Button size="sm"><CheckSquare size={14} /> Checklist</Button>
              </Link>
              <Link to="/calendar">
                <Button size="sm"><CalendarDays size={14} /> Kalendář</Button>
              </Link>
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
        <StatCard label="Příjmy (červen)" value={formatCurrency(monthRevenue)} sub="↑ +12 % minulý měsíc" subVariant="up" icon={TrendingUp} />
        <StatCard label="Zakázky" value={orders.length} sub={`${scheduledOrders.length} naplánovaných`} />
        <StatCard label="Aktivní klienti" value={activeClients} sub="+1 tento měsíc" subVariant="up" icon={Users} />
        <StatCard
          label="Nezaplaceno"
          value={formatCurrency(pendingAmount)}
          sub={`${pendingInvoices.length} faktur${overdueCount ? `, ${overdueCount} po splatnosti` : ''}`}
          subVariant={overdueCount ? 'down' : undefined}
          icon={Receipt}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Left */}
        <div className="space-y-6">
          {/* Today */}
          <Card>
            <CardHeader>
              <CardTitle>Dnešní plán</CardTitle>
              <Link to="/calendar"><Button variant="ghost" size="sm">Kalendář <ArrowRight size={12} /></Button></Link>
            </CardHeader>
            <CardContent className="p-0">
              {scheduledOrders.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Dnes bez zakázek"
                  description="Máte volno nebo chcete přidat novou zakázku?"
                  action={<Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14} /> Přidat zakázku</Button></Link>}
                />
              ) : (
                <div className="divide-y divide-border">
                  {scheduledOrders.map((order, i) => {
                    const client = getClient(order.clientId)
                    const hour = 8 + i * 2
                    return (
                      <Link
                        key={order.id}
                        to={`/checklist?order=${order.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="text-sm font-bold text-primary w-11 text-center flex-shrink-0">
                          {String(hour).padStart(2, '0')}:00
                        </div>
                        <div className="w-px h-8 bg-border flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{client?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.services.join(' · ')}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-bold hidden sm:block">{formatCurrency(order.totalPrice)}</span>
                          <StatusBadge status={order.status} />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold tracking-tight mb-4">Rychlé akce</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickActions.map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-green-200 hover:bg-green-50 transition-all group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                      <Icon size={15} />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground text-center leading-tight">{label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivita</CardTitle>
              <Link to="/notifications"><Button variant="ghost" size="sm">Vše</Button></Link>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3 border-b border-border last:border-0">
                  <span className={cn('w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0', notifDot[n.type])} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm leading-snug', !n.read && 'font-medium')}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time} zpět</p>
                  </div>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-[7px]" />}
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
                <p className="text-sm text-muted-foreground text-center py-6">Vše zaplaceno</p>
              ) : (
                pendingInvoices.map(inv => {
                  const client = getClient(inv.clientId)
                  const isOverdue = new Date(inv.dueDate) < today
                  return (
                    <div key={inv.id} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0">
                      <div className="w-7 h-7 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-[10px] font-bold text-green-700 flex-shrink-0">
                        {getInitials(client?.name || '?')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{client?.name}</p>
                        <p className={cn('text-xs', isOverdue ? 'text-destructive' : 'text-muted-foreground')}>
                          {isOverdue ? 'Po splatnosti — ' : ''}{formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <p className={cn('text-sm font-bold flex-shrink-0', isOverdue ? 'text-destructive' : '')}>
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
