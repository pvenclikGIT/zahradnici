// ── Orders ────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, StatCard, StatusBadge, EmptyState, Dialog, FormField, Textarea, toast } from '../components/ui'
import { Plus, Search, ClipboardList, CheckSquare, Receipt, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'

const emptyOrder = { clientId: '', date: '', services: [], totalPrice: '', duration: '', notes: '' }

export function Orders() {
  const { clients, orders, services, addOrder } = useApp()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...emptyOrder, date: new Date().toISOString().split('T')[0] })

  useEffect(() => { if (searchParams.get('new') === '1') setModalOpen(true) }, [])

  const filtered = orders.filter(o => {
    const c = clients.find(x => x.id === o.clientId)
    const mq = !q || (c?.name || '').toLowerCase().includes(q.toLowerCase()) || o.services.join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!filterStatus || o.status === filterStatus)
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  function handleSave() {
    if (!form.clientId || !form.date || !form.services.length) { toast('Vyplňte klienta, datum a práce', 'error'); return }
    addOrder({ ...form, clientId: parseInt(form.clientId), totalPrice: parseInt(form.totalPrice) || 0, duration: parseInt(form.duration) || 0, status: 'scheduled', paid: false, worker: 'Jan Novák' })
    setModalOpen(false); toast('Zakázka vytvořena')
    setForm({ ...emptyOrder, date: new Date().toISOString().split('T')[0] })
  }

  const getClient = id => clients.find(c => c.id === id)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat zakázky…" className="pl-8" />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-40">
          <option value="">Všechny stavy</option>
          <option value="scheduled">Naplánované</option>
          <option value="completed">Dokončené</option>
          <option value="cancelled">Zrušené</option>
        </Select>
        <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={14} />Nová zakázka</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Celkem" value={orders.length} />
        <StatCard label="Naplánované" value={orders.filter(o => o.status === 'scheduled').length} />
        <StatCard label="Dokončené" value={orders.filter(o => o.status === 'completed').length} />
        <StatCard label="Příjem" value={formatCurrency(orders.filter(o => o.paid).reduce((s, o) => s + o.totalPrice, 0))} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Žádné zakázky" description="Přidejte první zakázku."
          action={<Button variant="primary" size="sm" onClick={() => setModalOpen(true)}><Plus size={14} />Nová zakázka</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(o => {
            const c = getClient(o.clientId)
            const borderColors = { completed: 'border-l-green-500', scheduled: 'border-l-blue-500', cancelled: 'border-l-gray-300' }
            return (
              <Card key={o.id} className={cn('border-l-4', borderColors[o.status] || 'border-l-gray-300')}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                      {c?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold tracking-tight">{c?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.date)} · {c?.address}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {o.services.map(s => (
                      <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <p className="font-bold text-lg tracking-tight">{formatCurrency(o.totalPrice)}</p>
                    <div className="flex gap-2">
                      {o.status === 'scheduled' && (
                        <Link to={`/checklist?order=${o.id}`}><Button variant="primary" size="sm" className="gap-1"><CheckSquare size={12} />Zahájit</Button></Link>
                      )}
                      <Link to="/invoices"><Button size="sm" className="gap-1"><Receipt size={12} />Faktura</Button></Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title="Nová zakázka"
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit zakázku</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Klient *">
            <Select value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}>
              <option value="">— Vyberte klienta —</option>
              {clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Datum *">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Práce (vyberte)">
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-input rounded-lg p-3">
            {services.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.services.includes(s.name)}
                  onChange={e => setForm(f => ({ ...f, services: e.target.checked ? [...f.services, s.name] : f.services.filter(x => x !== s.name) }))} />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Odhadovaná cena (Kč)"><Input type="number" value={form.totalPrice} onChange={e => setForm(f => ({ ...f, totalPrice: e.target.value }))} placeholder="2500" /></FormField>
          <FormField label="Délka (min)"><Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="90" /></FormField>
        </div>
        <FormField label="Poznámka"><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Speciální požadavky…" /></FormField>
      </Dialog>
    </div>
  )
}
