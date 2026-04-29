import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { Card, CardContent, Button, Input, Select, StatCard, StatusBadge, EmptyState, Dialog, FormField, Textarea, toast } from '../components/ui'
import { Plus, Search, ClipboardList, CheckSquare, Receipt, Edit2, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'

const emptyForm = { clientId:'', date:'', services:[], totalPrice:'', duration:'', notes:'' }

export function Orders() {
  const { clients, orders, services, addOrder, updateOrder, deleteOrder } = useApp()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm, date: new Date().toISOString().split('T')[0] })
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { if (searchParams.get('new')==='1') openNew() }, [])

  const filtered = orders.filter(o => {
    const c = clients.find(x => x.id===o.clientId)
    const mq = !q || (c?.name||'').toLowerCase().includes(q.toLowerCase()) || o.services.join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!filterStatus || o.status===filterStatus)
  }).sort((a,b) => new Date(b.date)-new Date(a.date))

  const getClient = id => clients.find(c => c.id===id)

  function openNew() {
    setEditingId(null)
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }
  function openEdit(o) {
    setEditingId(o.id)
    setForm({ clientId: String(o.clientId), date: o.date, services: o.services, totalPrice: String(o.totalPrice), duration: String(o.duration||''), notes: o.notes||'' })
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.clientId || !form.date || !form.services.length) { toast('Vyplňte klienta, datum a práce', 'error'); return }
    const data = { ...form, clientId: parseInt(form.clientId), totalPrice: parseInt(form.totalPrice)||0, duration: parseInt(form.duration)||0 }
    if (editingId) {
      updateOrder({ ...orders.find(o=>o.id===editingId), ...data })
      toast('Zakázka upravena')
    } else {
      addOrder({ ...data, status:'scheduled', paid:false, worker:'Jan Novák' })
      toast('Zakázka vytvořena')
    }
    setModalOpen(false)
  }
  function handleDelete(id) {
    if (!confirm('Opravdu odstranit zakázku?')) return
    deleteOrder(id); toast('Zakázka odstraněna', 'warning')
  }

  const borderColors = { completed:'border-l-green-500', scheduled:'border-l-blue-500', inprogress:'border-l-amber-500', cancelled:'border-l-gray-300' }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Hledat klienta nebo práci…" className="pl-8"/>
        </div>
        <Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-40">
          <option value="">Všechny stavy</option>
          <option value="scheduled">Naplánované</option>
          <option value="completed">Dokončené</option>
          <option value="cancelled">Zrušené</option>
        </Select>
        <Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nová zakázka</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Celkem zakázek" value={orders.length}/>
        <StatCard label="Naplánované" value={orders.filter(o=>o.status==='scheduled').length}/>
        <StatCard label="Dokončené" value={orders.filter(o=>o.status==='completed').length}/>
        <StatCard label="Příjem (zaplaceno)" value={formatCurrency(orders.filter(o=>o.paid).reduce((s,o)=>s+o.totalPrice,0))}/>
      </div>

      {/* List */}
      {filtered.length===0 ? (
        <EmptyState icon={ClipboardList} title="Žádné zakázky" description="Přidejte první zakázku."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nová zakázka</Button>}/>
      ) : (
        <div className="space-y-2">
          {filtered.map(o => {
            const c = getClient(o.clientId)
            const isExpanded = expandedId === o.id
            return (
              <Card key={o.id} className={cn('border-l-4', borderColors[o.status]||'border-l-gray-300')}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                      {c?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => setExpandedId(isExpanded?null:o.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold tracking-tight">{c?.name||'—'}</p>
                        <StatusBadge status={o.status}/>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(o.date)} · {c?.address}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-bold text-base tracking-tight hidden sm:block">{formatCurrency(o.totalPrice)}</p>
                      <button onClick={() => setExpandedId(isExpanded?null:o.id)} className="p-1 rounded-md hover:bg-accent text-muted-foreground">
                        <ChevronDown size={16} className={cn('transition-transform', isExpanded&&'rotate-180')}/>
                      </button>
                    </div>
                  </div>

                  {/* Services chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {o.services.map(s => (
                      <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>
                    ))}
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {o.notes && <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">{o.notes}</p>}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex gap-2">
                          <span className="text-xs text-muted-foreground">Délka: {o.duration ? `${o.duration} min` : '—'}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className={cn('text-xs font-medium', o.paid?'text-green-600':'text-amber-600')}>{o.paid?'Zaplaceno':'Čeká na platbu'}</span>
                        </div>
                        <div className="flex gap-2">
                          {o.status==='scheduled' && (
                            <Link to={`/checklist?order=${o.id}`}><Button variant="primary" size="sm" className="gap-1"><CheckSquare size={12}/>Zahájit</Button></Link>
                          )}
                          <Link to="/invoices"><Button size="sm" className="gap-1"><Receipt size={12}/>Faktura</Button></Link>
                          <Button size="sm" onClick={() => openEdit(o)} className="gap-1"><Edit2 size={12}/>Upravit</Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(o.id)} className="gap-1"><Trash2 size={12}/>Smazat</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId?'Upravit zakázku':'Nová zakázka'}
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>{editingId?'Uložit změny':'Vytvořit zakázku'}</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Klient *">
            <Select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))}>
              <option value="">— Vyberte klienta —</option>
              {clients.filter(c=>c.status==='active').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Datum *">
            <Input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          </FormField>
        </div>
        <FormField label="Práce (vyberte)">
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-input rounded-lg p-3">
            {services.map(s => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.services.includes(s.name)}
                  onChange={e=>setForm(f=>({...f,services:e.target.checked?[...f.services,s.name]:f.services.filter(x=>x!==s.name)}))}/>
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Cena (Kč)"><Input type="number" value={form.totalPrice} onChange={e=>setForm(f=>({...f,totalPrice:e.target.value}))} placeholder="2500"/></FormField>
          <FormField label="Délka (min)"><Input type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="90"/></FormField>
        </div>
        <FormField label="Poznámka"><Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Speciální požadavky…"/></FormField>
      </Dialog>
    </div>
  )
}
