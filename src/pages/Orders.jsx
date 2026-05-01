import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, StatCard, StatusBadge, EmptyState, Dialog, FormField, Textarea, ConfirmDialog, PillTabs, toast } from '../components/ui'
import { Plus, Search, ClipboardList, CheckSquare, Receipt, Edit2, Trash2, ChevronDown, Copy, Phone, MapPin, LayoutGrid, List, RefreshCw } from 'lucide-react'
import { SwipeCard } from '../components/SwipeCard'
import { recurringIntervals } from '../data'
import { cn } from '../lib/utils'

const emptyForm = { clientId:'', date:'', services:[], totalPrice:'', duration:'', notes:'', recurring:'0', workerId:1 }

export function Orders() {
  const { clients, orders, services, workers, absences, addOrder, updateOrder, deleteOrder } = useApp()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [viewMode, setViewMode] = useState('list') // list | kanban
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm, date: new Date().toISOString().split('T')[0] })

  useEffect(() => { if (searchParams.get('new')==='1') openNew() }, [])

  const getClient = id => clients.find(c=>c.id===id)

  const filtered = orders.filter(o => {
    const c = getClient(o.clientId)
    const mq = !q || (c?.name||'').toLowerCase().includes(q.toLowerCase()) || o.services.join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!filterStatus || o.status===filterStatus)
  }).sort((a,b) => new Date(b.date)-new Date(a.date))

  function openNew() {
    setEditingId(null)
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }
  function openEdit(o) {
    setEditingId(o.id)
    setForm({ clientId:String(o.clientId), date:o.date, services:o.services, totalPrice:String(o.totalPrice), duration:String(o.duration||''), notes:o.notes||'' })
    setModalOpen(true)
  }
  function duplicate(o) {
    const c = getClient(o.clientId)
    addOrder({ ...o, id:undefined, date:new Date().toISOString().split('T')[0], status:'scheduled', paid:false, paidDate:null })
    toast(`Zakázka pro ${c?.name} duplikovana`)
  }
  function handleSave() {
    if (!form.clientId||!form.date||!form.services.length) { toast('Vyplnte klienta, datum a prace','error'); return }
    const data = { ...form, clientId:parseInt(form.clientId), totalPrice:parseInt(form.totalPrice)||0, duration:parseInt(form.duration)||0 }
    if (editingId) {
      updateOrder({ ...orders.find(o=>o.id===editingId), ...data })
      toast('Zakazka upravena')
    } else {
      addOrder({ ...data, status:'scheduled', paid:false, worker:'Jan Novak' })
      toast('Zakazka vytvorena')
    }
    setModalOpen(false)
  }

  const borderColors = { completed:'border-l-green-500', scheduled:'border-l-blue-500', inprogress:'border-l-amber-500', cancelled:'border-l-gray-300' }

  // Kanban columns
  const kanbanCols = [
    { key:'scheduled', label:'Naplanovano', color:'blue' },
    { key:'inprogress', label:'Probiha',    color:'amber' },
    { key:'completed',  label:'Dokonceno',  color:'green' },
    { key:'cancelled',  label:'Zruseno',    color:'gray'  },
  ]

  function OrderCard({ o, compact }) {
    const c = getClient(o.clientId)
    const isExpanded = !compact && expandedId === o.id
    const card = (
      <Card className={cn('border-l-4', borderColors[o.status]||'border-l-gray-300', compact && 'shadow-none')}>
        <CardContent className={cn('p-3', !compact && 'sm:p-4')}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
              {c?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'?'}
            </div>
            <div className="flex-1 min-w-0" onClick={() => !compact && setExpandedId(isExpanded?null:o.id)}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold tracking-tight text-sm">{c?.name||'—'}</p>
                <StatusBadge status={o.status}/>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(o.date)}{!compact && ` · ${c?.city||c?.address?.split(',').pop()?.trim()}`}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <p className="font-bold text-sm tracking-tight">{formatCurrency(o.totalPrice)}</p>
              {!compact && (
                <button onClick={() => setExpandedId(isExpanded?null:o.id)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground touch-manipulation">
                  <ChevronDown size={15} className={cn('transition-transform', isExpanded&&'rotate-180')}/>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {o.recurring && o.recurring !== '0' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                <RefreshCw size={9}/>Každých {o.recurring} dní
              </span>
            )}
            {o.services.slice(0,3).map(s=>(
              <span key={s} className="text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>
            ))}
            {o.services.length>3 && <span className="text-[10px] text-muted-foreground">+{o.services.length-3}</span>}
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-border space-y-3">
              {o.notes && <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">{o.notes}</p>}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
                <div className="flex gap-3">
                  {o.duration > 0 && <span>{o.duration} min</span>}
                  <span className={o.paid?'text-green-600':'text-amber-600'}>{o.paid?'Zaplaceno':'Ceka na platbu'}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {o.status==='scheduled' && (
                  <Link to={`/checklist?order=${o.id}`}><Button variant="primary" size="sm" className="gap-1"><CheckSquare size={12}/>Zahajit</Button></Link>
                )}
                <Link to="/invoices"><Button size="sm" className="gap-1"><Receipt size={12}/>Faktura</Button></Link>
                {c?.phone && (
                  <a href={`tel:${c.phone}`}><Button size="sm" className="gap-1"><Phone size={12}/>Volat</Button></a>
                )}
                <Button size="sm" onClick={() => duplicate(o)} className="gap-1"><Copy size={12}/>Duplikovat</Button>
                <Button size="sm" onClick={() => openEdit(o)} className="gap-1"><Edit2 size={12}/>Upravit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(o.id)} className="gap-1"><Trash2 size={12}/>Smazat</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
    if (compact) return card
    return (
      <SwipeCard
        onSwipeLeft={() => setDeleteId(o.id)}
        onSwipeRight={c?.phone ? () => window.location.href=`tel:${c.phone}` : undefined}
        leftLabel="Smazat" leftColor="bg-destructive"
        leftIcon={<Trash2 size={16}/>}
        rightLabel="Volat" rightColor="bg-green-500"
        rightIcon={<Phone size={16}/>}
      >{card}</SwipeCard>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Hledat zakazky…" className="pl-8"/>
        </div>
        <Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="w-38">
          <option value="">Vsechny stavy</option>
          <option value="scheduled">Naplanovane</option>
          <option value="completed">Dokoncene</option>
          <option value="cancelled">Zrusene</option>
        </Select>
        <div className="flex bg-muted rounded-xl p-1 gap-0.5">
          <button onClick={()=>setViewMode('list')} className={cn('p-2 rounded-lg touch-manipulation transition-all', viewMode==='list'?'bg-white shadow-sm':'text-muted-foreground')}>
            <List size={15}/>
          </button>
          <button onClick={()=>setViewMode('kanban')} className={cn('p-2 rounded-lg touch-manipulation transition-all', viewMode==='kanban'?'bg-white shadow-sm':'text-muted-foreground')}>
            <LayoutGrid size={15}/>
          </button>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nova zakázka</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <StatCard label="Celkem" value={orders.length}/>
        <StatCard label="Naplanovane" value={orders.filter(o=>o.status==='scheduled').length}/>
        <StatCard label="Dokoncene" value={orders.filter(o=>o.status==='completed').length}/>
        <StatCard label="Prijmy" value={formatCurrency(orders.filter(o=>o.paid).reduce((s,o)=>s+o.totalPrice,0))}/>
      </div>

      {/* List view */}
      {viewMode === 'list' && (
        filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Zadne zakazky" description="Pridejte prvni zakazku."
            action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nova zakázka</Button>}/>
        ) : (
          <div className="space-y-2">
            {filtered.map(o => <OrderCard key={o.id} o={o}/>)}
          </div>
        )
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kanbanCols.map(col => {
            const colOrders = filtered.filter(o=>o.status===col.key)
            const colColors = { blue:'bg-blue-50 text-blue-700 border-blue-200', amber:'bg-amber-50 text-amber-700 border-amber-200', green:'bg-green-50 text-green-700 border-green-200', gray:'bg-gray-100 text-gray-600 border-gray-200' }
            return (
              <div key={col.key}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold px-2 py-1 rounded-full border', colColors[col.color])}>{col.label}</span>
                    <span className="text-xs text-muted-foreground font-medium">{colOrders.length}</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{formatCurrency(colOrders.reduce((s,o)=>s+o.totalPrice,0))}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {colOrders.map(o => <OrderCard key={o.id} o={o} compact/>)}
                  {colOrders.length === 0 && (
                    <div className="h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Zadne zakazky</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId?'Upravit zakazku':'Nova zakazka'}
        footer={<><Button onClick={()=>setModalOpen(false)}>Zrusit</Button><Button variant="primary" onClick={handleSave}>{editingId?'Ulozit zmeny':'Vytvorit zakazku'}</Button></>}
      >
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
        <FormField label="Prace (vyberte)">
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-input rounded-xl p-3">
            {services.map(s=>(
              <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none touch-manipulation py-1">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.services.includes(s.name)}
                  onChange={e=>setForm(f=>({...f,services:e.target.checked?[...f.services,s.name]:f.services.filter(x=>x!==s.name)}))}/>
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cena (Kc)"><Input type="number" value={form.totalPrice} onChange={e=>setForm(f=>({...f,totalPrice:e.target.value}))} placeholder="2500"/></FormField>
          <FormField label="Delka (min)"><Input type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="90"/></FormField>
        </div>
        <FormField label="Opakovat automaticky">
          <Select value={form.recurring||'0'} onChange={e=>setForm(f=>({...f,recurring:e.target.value}))}>
            <option value="0">Neopakovat</option>
            {recurringIntervals.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </FormField>
        <FormField label="Poznamka"><Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Specialni pozadavky…"/></FormField>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)}
        onConfirm={()=>{deleteOrder(deleteId);toast('Zakazka smazana','warning')}}
        title="Smazat zakazku?" description="Tato akce je nevratna." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
