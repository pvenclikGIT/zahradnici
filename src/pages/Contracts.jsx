import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { contractTypes, formatCurrency, formatDate } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard, EmptyState,
  Dialog, FormField, Textarea, ConfirmDialog, toast, PillTabs
} from '../components/ui'
import {
  Plus, Search, FileText, Edit2, Trash2, X, Check, RefreshCw,
  Calendar as CalIcon, AlertCircle, TrendingUp, ArrowRight
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyContract = {
  clientId:'', type:'seasonal', status:'pending', title:'',
  startDate:'', endDate:'',
  monthlyPrice:0, services:[''], paymentTerms:'měsíčně',
  autoRenew:true, notes:''
}

const statusBadges = {
  active:   { label:'Aktivní',  color:'bg-green-50 text-green-700 border-green-200' },
  pending:  { label:'K podpisu',color:'bg-amber-50 text-amber-700 border-amber-200' },
  expired:  { label:'Ukončená', color:'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled:{ label:'Zrušená',  color:'bg-red-50 text-red-700 border-red-200' },
}

export function Contracts() {
  const { contracts, clients, addContract, updateContract, deleteContract } = useApp()

  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyContract)
  const [detailId, setDetailId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // ── Stats ──
  const activeContracts = contracts.filter(c => c.status === 'active')
  const monthlyMRR = activeContracts.reduce((s,c) => s + (c.monthlyPrice || 0), 0)
  const annualValue = activeContracts.reduce((s,c) => s + (c.totalValue || 0), 0)
  const expiringSoon = activeContracts.filter(c => {
    const days = Math.ceil((new Date(c.endDate) - new Date()) / 86400000)
    return days <= 60 && days >= 0
  })

  const filtered = useMemo(() => {
    let list = contracts.filter(ct => {
      const c = clients.find(x => x.id === ct.clientId)
      const mq = !q || ct.title?.toLowerCase().includes(q.toLowerCase())
        || ct.number?.toLowerCase().includes(q.toLowerCase())
        || c?.name?.toLowerCase().includes(q.toLowerCase())
      const mf = filter === 'all' || ct.status === filter
      return mq && mf
    })
    list.sort((a,b) => {
      const order = { active:1, pending:2, expired:3, cancelled:4 }
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
      return new Date(b.startDate) - new Date(a.startDate)
    })
    return list
  }, [contracts, q, filter, clients])

  const tabs = [
    { value:'all',     label:'Všechny',  count:contracts.length },
    { value:'active',  label:'Aktivní',  count:activeContracts.length },
    { value:'pending', label:'K podpisu',count:contracts.filter(c=>c.status==='pending').length },
    { value:'expired', label:'Ukončené', count:contracts.filter(c=>c.status==='expired').length },
  ]

  function openNew() {
    const nextNum = `SM-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3,'0')}`
    setEditingId(null)
    setForm({ ...emptyContract, number: nextNum, startDate: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }
  function openEdit(ct) {
    setEditingId(ct.id)
    setForm({ ...ct, services: ct.services?.length ? [...ct.services] : [''] })
    setDetailId(null)
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.clientId) { toast('Vyberte klienta', 'error'); return }
    if (!form.title?.trim()) { toast('Vyplňte název', 'error'); return }
    if (!form.startDate || !form.endDate) { toast('Vyplňte data', 'error'); return }

    const months = Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / (30 * 86400000)))
    const data = {
      ...form,
      clientId: parseInt(form.clientId),
      monthlyPrice: parseInt(form.monthlyPrice) || 0,
      totalValue: (parseInt(form.monthlyPrice) || 0) * months,
      services: form.services.filter(s => s.trim()),
    }
    if (editingId) {
      updateContract({ ...data, id: editingId })
      toast('Smlouva upravena')
    } else {
      addContract(data)
      toast('Smlouva vytvořena')
    }
    setModalOpen(false)
  }
  function activateContract(ct) {
    updateContract({ ...ct, status:'active', signedAt: new Date().toISOString().split('T')[0] })
    toast('Smlouva aktivována ✓')
  }
  function expireContract(ct) {
    updateContract({ ...ct, status:'expired' })
    toast('Smlouva ukončena', 'warning')
  }

  const detailContract = contracts.find(c => c.id === detailId)

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Aktivní smlouvy" value={activeContracts.length} sub={`z ${contracts.length} celkem`} icon={Check} color="text-green-600"/>
        <StatCard label="Měsíční obrat (MRR)" value={formatCurrency(monthlyMRR)} sub="z paušálů" icon={TrendingUp}/>
        <StatCard label="Roční hodnota" value={formatCurrency(annualValue)} sub="aktivní smlouvy"/>
        <StatCard label="Brzy vyprší" value={expiringSoon.length} sub="do 60 dnů" icon={AlertCircle} color={expiringSoon.length>0?'text-amber-600':undefined}/>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat smlouvu, klienta…" className="pl-8"/>
        </div>
        <PillTabs tabs={tabs} active={filter} onChange={setFilter} className="overflow-x-auto"/>
        <Button variant="primary" size="sm" onClick={openNew} className="gap-1 flex-shrink-0">
          <Plus size={14}/><span className="hidden sm:inline">Nová smlouva</span><span className="sm:hidden">Nová</span>
        </Button>
      </div>

      {expiringSoon.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Smlouvy vyprší do 60 dní</p>
              <p className="text-xs text-muted-foreground">{expiringSoon.length} smluv potřebuje obnovu</p>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Žádné smlouvy" description="Vytvořte první smlouvu s klientem."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nová smlouva</Button>}/>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(ct => {
            const c = clients.find(x => x.id === ct.clientId)
            const type = contractTypes.find(t => t.id === ct.type)
            const status = statusBadges[ct.status]
            const days = ct.endDate ? Math.ceil((new Date(ct.endDate) - new Date()) / 86400000) : 0
            return (
              <Card key={ct.id} onClick={() => setDetailId(ct.id)}
                className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-mono font-bold text-primary">{ct.number}</span>
                        <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border', status?.color)}>
                          {status?.label}
                        </span>
                      </div>
                      <p className="font-bold text-sm truncate">{ct.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{c?.name}</p>
                    </div>
                    {type && (
                      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border flex-shrink-0', type.color)}>
                        {type.icon} {type.label}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-border my-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Měsíčně</p>
                      <p className="font-bold">{formatCurrency(ct.monthlyPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Celková hodnota</p>
                      <p className="font-bold">{formatCurrency(ct.totalValue)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><CalIcon size={10}/>{formatDate(ct.startDate)} — {formatDate(ct.endDate)}</span>
                    {ct.status === 'active' && days > 0 && days <= 60 && (
                      <span className="text-amber-600 font-bold">⚠ Vyprší za {days} dnů</span>
                    )}
                    {ct.autoRenew && ct.status === 'active' && (
                      <span className="text-green-600 font-medium flex items-center gap-1"><RefreshCw size={9}/>Auto</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail */}
      {detailContract && (() => {
        const c = clients.find(x => x.id === detailContract.clientId)
        const type = contractTypes.find(t => t.id === detailContract.type)
        const status = statusBadges[detailContract.status]
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setDetailId(null)}>
            <div className="absolute inset-0 bg-black/60"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-lg sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)'}}>
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                <div>
                  <p className="font-bold">{detailContract.number}</p>
                  <p className="text-xs text-muted-foreground">Detail smlouvy</p>
                </div>
                <button onClick={() => setDetailId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent"><X size={14}/></button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1">
                <div className="px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', status?.color)}>{status?.label}</span>
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border', type?.color)}>{type?.icon} {type?.label}</span>
                    {detailContract.autoRenew && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><RefreshCw size={11}/>Auto-obnova</span>}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{detailContract.title}</h2>
                  <p className="text-sm text-muted-foreground">{c?.name}</p>
                </div>

                <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Od</p>
                    <p className="font-bold text-sm">{formatDate(detailContract.startDate)}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Do</p>
                    <p className="font-bold text-sm">{formatDate(detailContract.endDate)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-[10px] text-green-700 uppercase tracking-wider">Měsíčně</p>
                    <p className="font-bold text-sm text-green-700">{formatCurrency(detailContract.monthlyPrice)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-[10px] text-green-700 uppercase tracking-wider">Celkem</p>
                    <p className="font-bold text-sm text-green-700">{formatCurrency(detailContract.totalValue)}</p>
                  </div>
                </div>

                {detailContract.services?.length > 0 && (
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Služby v paušálu</p>
                    <ul className="space-y-1.5">
                      {detailContract.services.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check size={14} className="text-green-600 flex-shrink-0"/>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="px-5 py-4 border-b border-border space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Splatnost</span><span className="font-medium">{detailContract.paymentTerms}</span></div>
                  {detailContract.signedAt && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Podepsáno</span><span className="font-medium">{formatDate(detailContract.signedAt)}</span></div>}
                </div>

                {detailContract.notes && (
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Poznámka</p>
                    <p className="text-sm leading-relaxed bg-amber-50 border border-amber-200 rounded-xl p-3">{detailContract.notes}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
                {detailContract.status === 'pending' && (
                  <Button variant="primary" size="sm" onClick={() => { activateContract(detailContract); setDetailId(null) }} className="gap-1"><Check size={12}/>Aktivovat</Button>
                )}
                {detailContract.status === 'active' && (
                  <Button variant="danger" size="sm" onClick={() => { expireContract(detailContract); setDetailId(null) }} className="gap-1">Ukončit</Button>
                )}
                <Button size="sm" onClick={() => openEdit(detailContract)} className="gap-1"><Edit2 size={12}/>Upravit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(detailContract.id)}><Trash2 size={12}/></Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit smlouvu' : 'Nová smlouva'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit smlouvu</Button></>}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Klient *">
            <Select value={form.clientId} onChange={e => setForm(f => ({...f, clientId:e.target.value}))}>
              <option value="">— Vyberte klienta —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Číslo smlouvy">
            <Input value={form.number || ''} onChange={e => setForm(f => ({...f, number:e.target.value}))}/>
          </FormField>
          <FormField label="Typ smlouvy">
            <Select value={form.type} onChange={e => setForm(f => ({...f, type:e.target.value}))}>
              {contractTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Stav">
            <Select value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))}>
              <option value="pending">K podpisu</option>
              <option value="active">Aktivní</option>
              <option value="expired">Ukončená</option>
              <option value="cancelled">Zrušená</option>
            </Select>
          </FormField>
          <FormField label="Název *" className="sm:col-span-2">
            <Input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Celoroční údržba — Šimánek"/>
          </FormField>
          <FormField label="Od *">
            <Input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate:e.target.value}))}/>
          </FormField>
          <FormField label="Do *">
            <Input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate:e.target.value}))}/>
          </FormField>
          <FormField label="Měsíční cena (Kč) *">
            <Input type="number" inputMode="numeric" value={form.monthlyPrice} onChange={e => setForm(f => ({...f, monthlyPrice:e.target.value}))} placeholder="8500"/>
          </FormField>
          <FormField label="Splatnost">
            <Input value={form.paymentTerms} onChange={e => setForm(f => ({...f, paymentTerms:e.target.value}))} placeholder="měsíčně"/>
          </FormField>

          <FormField label="Služby v paušálu" className="sm:col-span-2">
            <div className="space-y-2">
              {form.services.map((s, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={s} onChange={e => { const arr=[...form.services]; arr[idx]=e.target.value; setForm(f => ({...f, services:arr})) }} placeholder="Sekání trávníku 1×týdně"/>
                  <button type="button" onClick={() => setForm(f => ({...f, services: f.services.length>1 ? f.services.filter((_,i)=>i!==idx) : f.services }))} className="p-2 rounded hover:bg-red-50 text-red-600"><X size={14}/></button>
                </div>
              ))}
              <button type="button" onClick={() => setForm(f => ({...f, services:[...f.services,'']}))} className="text-xs text-primary font-semibold hover:underline">+ Přidat službu</button>
            </div>
          </FormField>

          <FormField label="" className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-primary" checked={form.autoRenew}
                onChange={e => setForm(f => ({...f, autoRenew:e.target.checked}))}/>
              <span className="text-sm font-medium">Automatická obnova před vypršením</span>
            </label>
          </FormField>

          <FormField label="Poznámka" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Speciální podmínky..."/>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteContract(deleteId); setDetailId(null); toast('Smlouva smazána', 'warning') }}
        title="Smazat smlouvu?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
