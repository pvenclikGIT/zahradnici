import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { complaintStatuses, formatCurrency, formatDate } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard, EmptyState,
  Dialog, FormField, Textarea, ConfirmDialog, toast, PillTabs
} from '../components/ui'
import {
  Plus, Search, AlertTriangle, Edit2, Trash2, X, Check, Clock,
  AlertCircle, MessageCircle, Calendar as CalIcon
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyComplaint = {
  clientId:'', orderId:'', status:'open', priority:'medium',
  title:'', date: new Date().toISOString().split('T')[0],
  description:'', resolution:'', cost:0, refunded:0
}

const priorities = [
  { id:'high',   label:'Vysoká',   color:'bg-red-100 text-red-800 border-red-300'    },
  { id:'medium', label:'Střední',  color:'bg-amber-100 text-amber-800 border-amber-300' },
  { id:'low',    label:'Nízká',    color:'bg-blue-100 text-blue-800 border-blue-300'  },
]

export function Complaints() {
  const { complaints, clients, orders, addComplaint, updateComplaint, deleteComplaint } = useApp()

  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyComplaint)
  const [detailId, setDetailId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Stats
  const open = complaints.filter(c => c.status === 'open' || c.status === 'in_progress')
  const resolved = complaints.filter(c => c.status === 'resolved')
  const avgResolution = resolved.length
    ? Math.round(resolved.reduce((s,c) => s + (c.resolvedAt ? Math.ceil((new Date(c.resolvedAt) - new Date(c.date)) / 86400000) : 0), 0) / resolved.length)
    : 0
  const totalCost = complaints.reduce((s,c) => s + (c.cost || 0), 0)

  const filtered = useMemo(() => {
    let list = complaints.filter(co => {
      const c = clients.find(x => x.id === co.clientId)
      const mq = !q || co.title?.toLowerCase().includes(q.toLowerCase())
        || c?.name?.toLowerCase().includes(q.toLowerCase())
      const mf = filter === 'all' || co.status === filter
      return mq && mf
    })
    list.sort((a,b) => {
      const order = { open:1, in_progress:2, resolved:3, rejected:4 }
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
      return new Date(b.date) - new Date(a.date)
    })
    return list
  }, [complaints, q, filter, clients])

  const tabs = [
    { value:'all',         label:'Všechny',  count:complaints.length },
    { value:'open',        label:'Otevřené', count:complaints.filter(c=>c.status==='open').length },
    { value:'in_progress', label:'Řeší se',  count:complaints.filter(c=>c.status==='in_progress').length },
    { value:'resolved',    label:'Vyřešené', count:resolved.length },
  ]

  function openNew(presetClientId = '') {
    setEditingId(null)
    setForm({ ...emptyComplaint, clientId: presetClientId })
    setModalOpen(true)
  }
  function openEdit(co) {
    setEditingId(co.id)
    setForm({ ...co, cost:String(co.cost||0), refunded:String(co.refunded||0) })
    setDetailId(null)
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.clientId) { toast('Vyberte klienta', 'error'); return }
    if (!form.title?.trim()) { toast('Vyplňte název', 'error'); return }
    const data = {
      ...form,
      clientId: parseInt(form.clientId),
      orderId: form.orderId ? parseInt(form.orderId) : null,
      cost: parseInt(form.cost) || 0,
      refunded: parseInt(form.refunded) || 0,
    }
    if (editingId) {
      updateComplaint({ ...data, id: editingId })
      toast('Reklamace upravena')
    } else {
      addComplaint(data)
      toast('Reklamace vytvořena')
    }
    setModalOpen(false)
  }
  function changeStatus(co, newStatus) {
    const update = { ...co, status: newStatus }
    if (newStatus === 'resolved') {
      update.resolvedAt = new Date().toISOString().split('T')[0]
    }
    updateComplaint(update)
    toast(newStatus === 'resolved' ? 'Reklamace vyřešena ✓' : 'Stav změněn')
  }

  const detailComplaint = complaints.find(c => c.id === detailId)
  const ordersForClient = form.clientId ? orders.filter(o => o.clientId === parseInt(form.clientId)) : []

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Otevřené" value={open.length} sub="vyžadují řešení" icon={AlertCircle} color={open.length>0?'text-red-600':undefined}/>
        <StatCard label="Vyřešené" value={resolved.length} sub="celkem" icon={Check} color="text-green-600"/>
        <StatCard label="Průměrný čas řešení" value={`${avgResolution} dnů`} sub="historicky"/>
        <StatCard label="Náklady reklamací" value={formatCurrency(totalCost)} sub="celkem"/>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat reklamaci…" className="pl-8"/>
        </div>
        <PillTabs tabs={tabs} active={filter} onChange={setFilter} className="overflow-x-auto"/>
        <Button variant="primary" size="sm" onClick={() => openNew()} className="gap-1 flex-shrink-0">
          <Plus size={14}/><span className="hidden sm:inline">Nová reklamace</span><span className="sm:hidden">Nová</span>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Žádné reklamace" description="Skvělé! Žádné nevyřešené problémy."/>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(co => {
            const c = clients.find(x => x.id === co.clientId)
            const status = complaintStatuses.find(s => s.id === co.status)
            const prio = priorities.find(p => p.id === co.priority)
            const days = co.resolvedAt
              ? Math.ceil((new Date(co.resolvedAt) - new Date(co.date)) / 86400000)
              : Math.ceil((new Date() - new Date(co.date)) / 86400000)
            return (
              <Card key={co.id} onClick={() => setDetailId(co.id)}
                className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-1 self-stretch rounded-full',
                      co.status==='open'?'bg-red-500':
                      co.status==='in_progress'?'bg-amber-500':
                      co.status==='resolved'?'bg-green-500':'bg-gray-300'
                    )}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-sm">{co.title}</p>
                        <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0', status?.color)}>
                          {status?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-2">{c?.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{co.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><CalIcon size={10}/>{formatDate(co.date)}</span>
                        <span>·</span>
                        <span>{co.status === 'resolved' ? `Vyřešeno za ${days} dnů` : `Otevřeno ${days} dnů`}</span>
                        {prio && (
                          <>
                            <span>·</span>
                            <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border', prio.color)}>{prio.label} priorita</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail */}
      {detailComplaint && (() => {
        const c = clients.find(x => x.id === detailComplaint.clientId)
        const status = complaintStatuses.find(s => s.id === detailComplaint.status)
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setDetailId(null)}>
            <div className="absolute inset-0 bg-black/60"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-lg sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)'}}>
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                <p className="font-bold">Detail reklamace</p>
                <button onClick={() => setDetailId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent"><X size={14}/></button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1">
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', status?.color)}>{status?.label}</span>
                    {(() => {
                      const p = priorities.find(x => x.id === detailComplaint.priority)
                      return p && <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', p.color)}>{p.label} priorita</span>
                    })()}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{detailComplaint.title}</h2>
                  <p className="text-sm text-muted-foreground">{c?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Vytvořeno {formatDate(detailComplaint.date)}</p>
                </div>

                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Popis problému</p>
                  <p className="text-sm leading-relaxed bg-red-50/50 border border-red-100 rounded-xl p-3">{detailComplaint.description}</p>
                </div>

                {detailComplaint.resolution && (
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Vyřešení</p>
                    <p className="text-sm leading-relaxed bg-green-50/50 border border-green-100 rounded-xl p-3">{detailComplaint.resolution}</p>
                    {detailComplaint.resolvedAt && <p className="text-xs text-muted-foreground mt-2">Vyřešeno {formatDate(detailComplaint.resolvedAt)}</p>}
                  </div>
                )}

                {(detailComplaint.cost > 0 || detailComplaint.refunded > 0) && (
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Finanční dopady</p>
                    <div className="grid grid-cols-2 gap-3">
                      {detailComplaint.cost > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <p className="text-[10px] text-amber-700 uppercase tracking-wider">Náklady</p>
                          <p className="font-bold text-sm">{formatCurrency(detailComplaint.cost)}</p>
                        </div>
                      )}
                      {detailComplaint.refunded > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-[10px] text-red-700 uppercase tracking-wider">Vráceno</p>
                          <p className="font-bold text-sm">{formatCurrency(detailComplaint.refunded)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
                {detailComplaint.status === 'open' && (
                  <Button variant="primary" size="sm" onClick={() => { changeStatus(detailComplaint, 'in_progress'); setDetailId(null) }} className="gap-1"><Clock size={12}/>Začít řešit</Button>
                )}
                {detailComplaint.status === 'in_progress' && (
                  <Button variant="primary" size="sm" onClick={() => { changeStatus(detailComplaint, 'resolved'); setDetailId(null) }} className="gap-1"><Check size={12}/>Vyřešeno</Button>
                )}
                <Button size="sm" onClick={() => openEdit(detailComplaint)} className="gap-1"><Edit2 size={12}/>Upravit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(detailComplaint.id)}><Trash2 size={12}/></Button>
              </div>
            </div>
          </div>
        )
      })()}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit reklamaci' : 'Nová reklamace'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Klient *">
            <Select value={form.clientId} onChange={e => setForm(f => ({...f, clientId:e.target.value, orderId:''}))}>
              <option value="">— Vyberte —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="K zakázce" hint="Volitelné">
            <Select value={form.orderId} onChange={e => setForm(f => ({...f, orderId:e.target.value}))} disabled={!form.clientId}>
              <option value="">— Žádná —</option>
              {ordersForClient.map(o => <option key={o.id} value={o.id}>#{o.id} — {formatDate(o.date)}</option>)}
            </Select>
          </FormField>
          <FormField label="Datum">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))}/>
          </FormField>
          <FormField label="Priorita">
            <Select value={form.priority} onChange={e => setForm(f => ({...f, priority:e.target.value}))}>
              {priorities.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Stav">
            <Select value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))}>
              {complaintStatuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Náklady na řešení (Kč)">
            <Input type="number" inputMode="numeric" value={form.cost} onChange={e => setForm(f => ({...f, cost:e.target.value}))} placeholder="0"/>
          </FormField>
          <FormField label="Název reklamace *" className="sm:col-span-2">
            <Input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Uschlé tuje po výsadbě"/>
          </FormField>
          <FormField label="Popis problému *" className="sm:col-span-2">
            <Textarea value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="Popište reklamovaný problém..."/>
          </FormField>
          <FormField label="Vyřešení / postup" className="sm:col-span-2" hint="Vyplňte jakmile se začnete s řešením">
            <Textarea value={form.resolution} onChange={e => setForm(f => ({...f, resolution:e.target.value}))} placeholder="Jak byla reklamace vyřešena..."/>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteComplaint(deleteId); setDetailId(null); toast('Reklamace smazána', 'warning') }}
        title="Smazat reklamaci?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
