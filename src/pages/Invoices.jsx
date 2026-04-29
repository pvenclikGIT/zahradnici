import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { Card, CardContent, CardHeader, CardTitle, StatCard, Button, Input, Select, PillTabs, StatusBadge, EmptyState, Dialog, FormField, Textarea, toast } from '../components/ui'
import { Plus, Receipt, CheckCircle, Clock, AlertCircle, Printer, Mail, X } from 'lucide-react'
import { cn } from '../lib/utils'

export function Invoices() {
  const { clients, invoices, orders, addInvoice, markInvoicePaid, nextInvoiceNum } = useApp()
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [previewId, setPreviewId] = useState(null)
  const [newOpen, setNewOpen] = useState(false)
  const [form, setForm] = useState({ clientId: '', date: new Date().toISOString().split('T')[0], dueDate: '', amount: '', notes: '' })
  const today = new Date()

  useEffect(() => {
    if (searchParams.get('new') === '1') setNewOpen(true)
    const due = new Date(Date.now() + 14*24*3600*1000).toISOString().split('T')[0]
    setForm(f => ({ ...f, dueDate: due }))
  }, [])

  const getClient = id => clients.find(c => c.id === id)
  const totalRevenue  = invoices.filter(i => i.paid).reduce((s, i) => s + i.amount, 0)
  const totalPending  = invoices.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)
  const totalOverdue  = invoices.filter(i => !i.paid && new Date(i.dueDate) < today).reduce((s, i) => s + i.amount, 0)

  const filtered = invoices.filter(i => {
    if (filter === 'paid')    return i.paid
    if (filter === 'unpaid')  return !i.paid
    if (filter === 'overdue') return !i.paid && new Date(i.dueDate) < today
    return true
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const previewInv = invoices.find(i => i.id === previewId)
  const biz = { name: 'ZahradaPro s.r.o.', address: 'Zahradní 12, Brno 602 00', phone: '+420 602 123 456', email: 'jan@zahradapro.cz', ico: '12345678', dic: 'CZ12345678', bank: 'CZ65 0800 0000 1920 0014 5399' }

  function handleSave() {
    if (!form.clientId || !form.amount) { toast('Vyplňte klienta a částku', 'error'); return }
    const inv = { id: nextInvoiceNum(), clientId: parseInt(form.clientId), date: form.date, dueDate: form.dueDate, amount: parseInt(form.amount), paid: false, paidDate: null, orderId: null }
    addInvoice(inv); setNewOpen(false); toast(`Faktura #${inv.id} vystavena`)
    setTimeout(() => setPreviewId(inv.id), 500)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Zaplaceno" value={formatCurrency(totalRevenue)} subVariant="up" sub={`${invoices.filter(i => i.paid).length} faktur`} icon={CheckCircle} />
        <StatCard label="Čeká na platbu" value={formatCurrency(totalPending)} sub={`${invoices.filter(i => !i.paid).length} faktur`} icon={Clock} />
        <StatCard label="Po splatnosti" value={formatCurrency(totalOverdue)} subVariant={totalOverdue > 0 ? 'down' : undefined} icon={AlertCircle} />
        <StatCard label="Celkem vystaveno" value={formatCurrency(invoices.reduce((s, i) => s + i.amount, 0))} sub={`${invoices.length} faktur`} />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <PillTabs
          tabs={[{label:'Všechny',value:'all'},{label:'Nezaplacené',value:'unpaid'},{label:'Zaplacené',value:'paid'},{label:'Po splatnosti',value:'overdue'}]}
          active={filter} onChange={setFilter}
        />
        <div className="flex-1" />
        <Button variant="primary" size="sm" onClick={() => setNewOpen(true)}><Plus size={14} />Nová faktura</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">Číslo</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">Klient</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border hidden sm:table-cell">Vystaveno</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border hidden md:table-cell">Splatnost</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">Částka</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">Stav</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Receipt} title="Žádné faktury" description="V tomto filtru nejsou žádné faktury." /></td></tr>
              ) : filtered.map(inv => {
                const c = getClient(inv.clientId)
                const isOverdue = !inv.paid && new Date(inv.dueDate) < today
                return (
                  <tr key={inv.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setPreviewId(inv.id)}>
                    <td className="px-5 py-4 border-b border-border font-bold text-primary">#{inv.id}</td>
                    <td className="px-5 py-4 border-b border-border">
                      <p className="font-semibold">{c?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{c?.address}</p>
                    </td>
                    <td className="px-5 py-4 border-b border-border text-muted-foreground hidden sm:table-cell">{formatDate(inv.date)}</td>
                    <td className={cn('px-5 py-4 border-b border-border hidden md:table-cell', isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground')}>{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-4 border-b border-border font-bold">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-4 border-b border-border" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 flex-wrap">
                        {inv.paid ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Zaplaceno</span>
                        ) : (
                          <>
                            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border', isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                              <span className={cn('w-1.5 h-1.5 rounded-full', isOverdue ? 'bg-destructive' : 'bg-amber-500')} />{isOverdue ? 'Po splatnosti' : 'Čeká'}
                            </span>
                            <Button variant="primary" size="sm" onClick={() => { markInvoicePaid(inv.id); toast('Faktura zaplacena') }}>Zaplaceno</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invoice Preview */}
      {previewInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={() => setPreviewId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="font-bold tracking-tight">Faktura #{previewInv.id}</h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { toast('Faktura odeslána emailem'); setPreviewId(null) }} className="gap-1"><Mail size={12} />Odeslat</Button>
                <Button size="sm" onClick={() => window.print()} className="gap-1"><Printer size={12} />Tisknout</Button>
                <button onClick={() => setPreviewId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent"><X size={14} /></button>
              </div>
            </div>
            <div className="p-6">
              {/* Invoice header */}
              <div className="bg-gray-900 rounded-xl p-6 text-white mb-6 flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <p className="text-green-400 font-bold text-lg tracking-tight">{biz.name}</p>
                  <p className="text-white/50 text-xs mt-1">{biz.address}</p>
                  <p className="text-white/50 text-xs">{biz.phone} · {biz.email}</p>
                  <p className="text-white/40 text-xs mt-1">IČO: {biz.ico} · DIČ: {biz.dic}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Faktura</p>
                  <p className="text-3xl font-bold tracking-tight text-white">#{previewInv.id}</p>
                  <p className="text-xs text-white/50 mt-1">Vystaveno: {formatDate(previewInv.date)}</p>
                  <p className="text-xs text-white/50">Splatnost: {formatDate(previewInv.dueDate)}</p>
                </div>
              </div>
              {/* Parties */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Dodavatel</p><p className="font-bold">{biz.name}</p><p className="text-sm text-muted-foreground">{biz.address}</p></div>
                <div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Odběratel</p><p className="font-bold">{getClient(previewInv.clientId)?.name}</p><p className="text-sm text-muted-foreground">{getClient(previewInv.clientId)?.address}</p></div>
              </div>
              {/* Items */}
              <div className="border border-border rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50 border-b border-border"><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Popis</th><th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Celkem</th></tr></thead>
                  <tbody><tr><td className="px-4 py-4 text-sm">Zahradnické práce — zakázka #{previewInv.orderId || '—'}</td><td className="px-4 py-4 text-right font-bold">{formatCurrency(previewInv.amount)}</td></tr></tbody>
                </table>
              </div>
              {/* Totals */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Základ daně (21 %)</span><span>{formatCurrency(Math.round(previewInv.amount/1.21))}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>DPH 21 %</span><span>{formatCurrency(previewInv.amount - Math.round(previewInv.amount/1.21))}</span></div>
              </div>
              <div className="flex justify-between items-center bg-gray-900 text-white rounded-xl px-5 py-4">
                <span className="font-bold">K úhradě</span>
                <span className="text-2xl font-bold text-green-400 tracking-tight">{formatCurrency(previewInv.amount)}</span>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Platební údaje</p>
                <p>Číslo účtu: {biz.bank}</p>
                <p>VS: {previewInv.id} · {previewInv.paid ? 'ZAPLACENO' : 'ČEKÁ NA PLATBU'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} title="Nová faktura"
        footer={<><Button onClick={() => setNewOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Vystavit fakturu</Button></>}>
        <FormField label="Klient *">
          <Select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
            <option value="">— Vyberte klienta —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Datum vystavení"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></FormField>
          <FormField label="Datum splatnosti"><Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></FormField>
        </div>
        <FormField label="Celková částka (Kč) *"><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="3450" /></FormField>
      </Dialog>
    </div>
  )
}
