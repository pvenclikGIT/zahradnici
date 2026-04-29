import { useParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, business } from '../data'
import { cn } from '../lib/utils'
import { MapPin, Phone, Mail, Leaf, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function Portal() {
  const { id } = useParams()
  const { clients, orders, invoices } = useApp()
  const client = clients.find(c => c.id === parseInt(id))

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Leaf size={22} className="text-muted-foreground"/>
          </div>
          <h1 className="text-xl font-bold mb-2">Portál nenalezen</h1>
          <p className="text-sm text-muted-foreground">Odkaz není platný nebo vypršel.</p>
        </div>
      </div>
    )
  }

  const clientOrders   = orders.filter(o => o.clientId === client.id).sort((a,b) => new Date(b.date)-new Date(a.date))
  const clientInvoices = invoices.filter(i => i.clientId === client.id).sort((a,b) => new Date(b.date)-new Date(a.date))
  const totalPaid      = clientInvoices.filter(i=>i.paid).reduce((s,i)=>s+i.amount,0)
  const pending        = clientInvoices.filter(i=>!i.paid)
  const upcoming       = clientOrders.filter(o=>o.status==='scheduled').slice(0,3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
              <Leaf size={15} className="text-green-400"/>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">ZahradaPro</p>
              <p className="text-[10px] text-muted-foreground">Klientský portál</p>
            </div>
          </div>
          <a href={`tel:${business.phone}`} className="text-xs font-medium text-primary hover:underline">{business.phone}</a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Welcome */}
        <div className="bg-white rounded-2xl border border-border p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-lg font-bold text-green-700 flex-shrink-0">
              {client.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold tracking-tight">Dobrý den, {client.name.split(' ')[0]}.</h1>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                <MapPin size={11}/>{client.address}
              </p>
              <div className="flex gap-3 mt-3">
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Phone size={12}/>{client.phone}
                </a>
                {client.email && (
                  <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    <Mail size={12}/>{client.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            ['Zakázek celkem', clientOrders.length],
            ['Zaplaceno', formatCurrency(totalPaid)],
            ['Čeká na platbu', pending.length > 0 ? formatCurrency(pending.reduce((s,i)=>s+i.amount,0)) : '—'],
          ].map(([l,v]) => (
            <div key={l} className="bg-white rounded-2xl border border-border p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-xl font-bold tracking-tight">{v}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{l}</p>
            </div>
          ))}
        </div>

        {/* Upcoming orders */}
        {upcoming.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-200 bg-green-50/30 p-4 sm:p-5">
            <h2 className="text-sm font-bold tracking-tight mb-3">Nadcházející zakázky</h2>
            <div className="space-y-3">
              {upcoming.map(o => (
                <div key={o.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-primary"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{formatDate(o.date)}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.services.join(' · ')}</p>
                  </div>
                  <p className="text-sm font-bold text-primary flex-shrink-0">{formatCurrency(o.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        {clientInvoices.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-bold tracking-tight">Vaše faktury</h2>
            </div>
            <div className="divide-y divide-border">
              {clientInvoices.map(inv => {
                const isOverdue = !inv.paid && new Date(inv.dueDate) < new Date()
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-5 py-4">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      inv.paid ? 'bg-green-50' : isOverdue ? 'bg-red-50' : 'bg-amber-50'
                    )}>
                      {inv.paid
                        ? <CheckCircle size={14} className="text-green-600"/>
                        : isOverdue
                          ? <AlertCircle size={14} className="text-destructive"/>
                          : <Clock size={14} className="text-amber-600"/>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">Faktura #{inv.id}</p>
                      <p className={cn('text-xs', inv.paid ? 'text-green-600' : isOverdue ? 'text-destructive' : 'text-amber-600')}>
                        {inv.paid ? `Zaplaceno ${formatDate(inv.paidDate)}` : isOverdue ? `Po splatnosti od ${formatDate(inv.dueDate)}` : `Splatnost ${formatDate(inv.dueDate)}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold">{formatCurrency(inv.amount)}</p>
                      {!inv.paid && (
                        <a href={`https://www.qrplatba.cz/cgi-bin/qr?ACC=${business.bank}&AM=${inv.amount}&VS=${inv.id}`}
                          target="_blank" rel="noreferrer"
                          className="text-[10px] font-bold text-primary hover:underline mt-0.5 block">
                          Zaplatit online
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Order history */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold tracking-tight">Historie zakázek</h2>
          </div>
          {clientOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Zatím žádné zakázky</p>
          ) : (
            <div className="divide-y divide-border">
              {clientOrders.slice(0,10).map(o => (
                <div key={o.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    o.status==='completed' ? 'bg-green-500' : o.status==='scheduled' ? 'bg-blue-400' : 'bg-gray-300'
                  )}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{o.services.join(', ')}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                  </div>
                  <p className="text-sm font-bold flex-shrink-0">{formatCurrency(o.totalPrice)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">{business.name} · {business.phone}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{business.email}</p>
        </div>
      </div>
    </div>
  )
}
