import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { quoteStatuses, formatCurrency, formatDate } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard, EmptyState,
  Dialog, FormField, Textarea, ConfirmDialog, toast, PillTabs
} from '../components/ui'
import {
  Plus, Search, FileText, Edit2, Trash2, X, Send, Check, Copy,
  Download, Eye, Calendar as CalIcon, ArrowRight, Receipt, AlertCircle
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyQuote = {
  clientId:'', title:'', issueDate:new Date().toISOString().split('T')[0],
  validUntil:'', items:[{id:1,name:'',qty:1,unit:'ks',price:0,total:0}],
  discount:0, vat:21, notes:'', status:'draft'
}

export function Quotes() {
  const { quotes, clients, services, addQuote, updateQuote, deleteQuote, addInvoice, nextInvoiceNum } = useApp()

  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyQuote)
  const [previewId, setPreviewId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // ── Stats ──
  const totalSent = quotes.filter(q => q.status === 'sent').length
  const totalAccepted = quotes.filter(q => q.status === 'accepted')
  const totalAcceptedSum = totalAccepted.reduce((s,q) => s + calcTotal(q), 0)
  const conversionRate = quotes.length
    ? Math.round((totalAccepted.length / quotes.filter(q => q.status !== 'draft').length) * 100) || 0
    : 0
  const totalDraft = quotes.filter(q => q.status === 'draft').length

  function calcSubtotal(items) {
    return items.reduce((s,i) => s + (i.qty * i.price), 0)
  }
  function calcTotal(q) {
    const sub = calcSubtotal(q.items || [])
    const discounted = sub * (1 - (q.discount || 0) / 100)
    const withVat = discounted * (1 + (q.vat || 0) / 100)
    return Math.round(withVat)
  }

  // ── Filter ──
  const filtered = useMemo(() => {
    let list = quotes.filter(qt => {
      const c = clients.find(x => x.id === qt.clientId)
      const mq = !q || qt.title?.toLowerCase().includes(q.toLowerCase())
        || qt.number?.toLowerCase().includes(q.toLowerCase())
        || c?.name?.toLowerCase().includes(q.toLowerCase())
      const mf = filter === 'all' || qt.status === filter
      return mq && mf
    })
    list.sort((a,b) => new Date(b.issueDate) - new Date(a.issueDate))
    return list
  }, [quotes, q, filter, clients])

  const tabs = [
    { value:'all',      label:'Všechny',     count: quotes.length },
    { value:'draft',    label:'Rozpracované',count: totalDraft },
    { value:'sent',     label:'Odeslané',    count: totalSent },
    { value:'accepted', label:'Přijaté',     count: totalAccepted.length },
  ]

  // ── Form handlers ──
  function openNew() {
    const nextNum = `NAB-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3,'0')}`
    const validUntil = new Date(); validUntil.setDate(validUntil.getDate() + 30)
    setEditingId(null)
    setForm({ ...emptyQuote, number: nextNum, validUntil: validUntil.toISOString().split('T')[0] })
    setModalOpen(true)
  }
  function openEdit(qt) {
    setEditingId(qt.id)
    setForm({
      ...qt,
      items: qt.items.map(i => ({...i})),
    })
    setPreviewId(null)
    setModalOpen(true)
  }
  function duplicateQuote(qt) {
    const nextNum = `NAB-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3,'0')}`
    setEditingId(null)
    setForm({
      ...qt, number: nextNum, status:'draft',
      issueDate: new Date().toISOString().split('T')[0],
      sentAt: null, acceptedAt: null,
      items: qt.items.map(i => ({...i, id: Date.now() + Math.random()})),
    })
    setPreviewId(null)
    setModalOpen(true)
    toast('Nabídka duplikována')
  }

  function handleSave() {
    if (!form.clientId)   { toast('Vyberte klienta', 'error'); return }
    if (!form.title?.trim()) { toast('Vyplňte název', 'error'); return }
    if (!form.items.some(i => i.name?.trim() && i.qty > 0)) { toast('Přidejte alespoň jednu položku', 'error'); return }

    const cleanItems = form.items
      .filter(i => i.name?.trim())
      .map(i => ({...i, qty: parseFloat(i.qty)||0, price: parseFloat(i.price)||0, total: (parseFloat(i.qty)||0) * (parseFloat(i.price)||0)}))

    const data = {
      ...form,
      clientId: parseInt(form.clientId),
      items: cleanItems,
      discount: parseFloat(form.discount) || 0,
      vat: parseFloat(form.vat) || 0,
    }

    if (editingId) {
      updateQuote({ ...data, id: editingId })
      toast('Nabídka upravena')
    } else {
      addQuote(data)
      toast('Nabídka vytvořena')
    }
    setModalOpen(false)
  }

  function markSent(qt) {
    updateQuote({ ...qt, status:'sent', sentAt: new Date().toISOString().split('T')[0] })
    toast('Nabídka označena jako odeslaná')
  }
  function markAccepted(qt) {
    updateQuote({ ...qt, status:'accepted', acceptedAt: new Date().toISOString().split('T')[0] })
    toast('Nabídka přijata 🎉')
  }
  function convertToInvoice(qt) {
    const c = clients.find(x => x.id === qt.clientId)
    addInvoice({
      id: nextInvoiceNum(),
      clientId: qt.clientId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      amount: calcTotal(qt),
      paid: false,
      items: qt.items.map(i => ({ description: i.name, qty: i.qty, price: i.price })),
      orderId: null,
    })
    toast(`Faktura vytvořena pro ${c?.name}`)
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, {id:Date.now(),name:'',qty:1,unit:'ks',price:0,total:0}]}))
  }
  function updateItem(idx, field, val) {
    setForm(f => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: val }
      const qty = parseFloat(items[idx].qty) || 0
      const price = parseFloat(items[idx].price) || 0
      items[idx].total = qty * price
      return { ...f, items }
    })
  }
  function removeItem(idx) {
    setForm(f => ({ ...f, items: f.items.length > 1 ? f.items.filter((_,i) => i !== idx) : f.items }))
  }
  function addServiceFromPricelist(svcId) {
    const svc = services.find(s => s.id === parseInt(svcId))
    if (!svc) return
    setForm(f => ({ ...f, items: [...f.items, { id: Date.now(), name: svc.name, qty:1, unit:svc.unit||'ks', price:svc.price, total:svc.price}]}))
  }

  const previewQuote = quotes.find(q => q.id === previewId)
  const subtotal = calcSubtotal(form.items)
  const total = calcTotal({ items:form.items, discount:form.discount, vat:form.vat })

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Vytvořeno" value={quotes.length} sub="celkem nabídek" icon={FileText}/>
        <StatCard label="Odesláno" value={totalSent} sub="čeká na odpověď" icon={Send} color={totalSent>0?'text-blue-600':undefined}/>
        <StatCard label="Přijaté" value={formatCurrency(totalAcceptedSum)} sub={`${totalAccepted.length} nabídek`} icon={Check} color="text-green-600"/>
        <StatCard label="Konverze" value={`${conversionRate} %`} sub="přijaté / odeslané"/>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat nabídku, klienta…" className="pl-8"/>
        </div>
        <PillTabs tabs={tabs} active={filter} onChange={setFilter} className="overflow-x-auto"/>
        <Button variant="primary" size="sm" onClick={openNew} className="gap-1 flex-shrink-0">
          <Plus size={14}/><span className="hidden sm:inline">Nová nabídka</span><span className="sm:hidden">Nová</span>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Žádné nabídky" description="Vytvořte první cenovou nabídku."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nová nabídka</Button>}/>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(qt => {
            const c = clients.find(x => x.id === qt.clientId)
            const status = quoteStatuses.find(s => s.id === qt.status)
            const totalAmount = calcTotal(qt)
            const expired = qt.validUntil && new Date(qt.validUntil) < new Date() && !['accepted','rejected'].includes(qt.status)
            return (
              <Card key={qt.id} onClick={() => setPreviewId(qt.id)}
                className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-mono font-bold text-primary">{qt.number}</span>
                        <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border', status?.color)}>
                          {status?.label}
                        </span>
                        {expired && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Propadlá
                          </span>
                        )}
                      </div>
                      <p className="font-bold tracking-tight text-sm truncate">{qt.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{c?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold">{formatCurrency(totalAmount)}</p>
                      <p className="text-[10px] text-muted-foreground">{qt.items?.length} položek</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <CalIcon size={10}/>
                    <span>Vystaveno {formatDate(qt.issueDate)}</span>
                    {qt.validUntil && (
                      <>
                        <span>·</span>
                        <span>Platí do {formatDate(qt.validUntil)}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewQuote && (() => {
        const c = clients.find(x => x.id === previewQuote.clientId)
        const status = quoteStatuses.find(s => s.id === previewQuote.status)
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setPreviewId(null)}>
            <div className="absolute inset-0 bg-black/60"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-2xl sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)'}}>
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                <div className="min-w-0">
                  <p className="font-bold text-base truncate">{previewQuote.number}</p>
                  <p className="text-xs text-muted-foreground">Detail nabídky</p>
                </div>
                <button onClick={() => setPreviewId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent"><X size={14}/></button>
              </div>

              <div className="overflow-y-auto overscroll-contain flex-1">
                <div className="px-5 py-5 border-b border-border">
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', status?.color)}>
                      {status?.label}
                    </span>
                    <p className="text-xs text-muted-foreground">Platí do {formatDate(previewQuote.validUntil)}</p>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight mb-1">{previewQuote.title}</h2>
                  <p className="text-sm text-muted-foreground">{c?.name} · {c?.address}</p>
                </div>

                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Položky ({previewQuote.items.length})</p>
                  <div className="space-y-1">
                    {previewQuote.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground">{item.qty} {item.unit} × {formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">{formatCurrency(item.qty * item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4 border-b border-border space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mezisoučet</span>
                    <span className="font-medium">{formatCurrency(calcSubtotal(previewQuote.items))}</span>
                  </div>
                  {previewQuote.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sleva {previewQuote.discount} %</span>
                      <span className="font-medium text-green-600">−{formatCurrency(calcSubtotal(previewQuote.items) * previewQuote.discount / 100)}</span>
                    </div>
                  )}
                  {previewQuote.vat > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">DPH {previewQuote.vat} %</span>
                      <span className="font-medium">+{formatCurrency(calcSubtotal(previewQuote.items) * (1 - previewQuote.discount/100) * previewQuote.vat / 100)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold">Celkem</span>
                    <span className="font-bold text-xl">{formatCurrency(calcTotal(previewQuote))}</span>
                  </div>
                </div>

                {previewQuote.notes && (
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Poznámka</p>
                    <p className="text-sm leading-relaxed">{previewQuote.notes}</p>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
                {previewQuote.status === 'draft' && (
                  <Button variant="primary" size="sm" onClick={() => { markSent(previewQuote); setPreviewId(null) }} className="gap-1"><Send size={12}/>Odeslat</Button>
                )}
                {previewQuote.status === 'sent' && (
                  <Button variant="primary" size="sm" onClick={() => { markAccepted(previewQuote); setPreviewId(null) }} className="gap-1"><Check size={12}/>Přijato</Button>
                )}
                {previewQuote.status === 'accepted' && (
                  <Button variant="primary" size="sm" onClick={() => { convertToInvoice(previewQuote); setPreviewId(null) }} className="gap-1"><Receipt size={12}/>Vytvořit fakturu</Button>
                )}
                <Button size="sm" onClick={() => duplicateQuote(previewQuote)} className="gap-1"><Copy size={12}/>Duplikovat</Button>
                <Button size="sm" onClick={() => openEdit(previewQuote)} className="gap-1"><Edit2 size={12}/>Upravit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(previewQuote.id)}><Trash2 size={12}/></Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Edit/New Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit nabídku' : 'Nová nabídka'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit nabídku</Button></>}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Klient *">
            <Select value={form.clientId} onChange={e => setForm(f => ({...f, clientId:e.target.value}))}>
              <option value="">— Vyberte klienta —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Číslo nabídky">
            <Input value={form.number || ''} onChange={e => setForm(f => ({...f, number:e.target.value}))}/>
          </FormField>

          <FormField label="Název *" className="sm:col-span-2">
            <Input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="Komplexní úprava zahrady"/>
          </FormField>

          <FormField label="Vystaveno">
            <Input type="date" value={form.issueDate} onChange={e => setForm(f => ({...f, issueDate:e.target.value}))}/>
          </FormField>
          <FormField label="Platí do">
            <Input type="date" value={form.validUntil} onChange={e => setForm(f => ({...f, validUntil:e.target.value}))}/>
          </FormField>

          <FormField label="Položky *" className="sm:col-span-2">
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                  <Input className="col-span-5 text-xs" value={item.name} onChange={e => updateItem(idx,'name',e.target.value)} placeholder="Název služby/produktu"/>
                  <Input className="col-span-2 text-xs" type="number" inputMode="decimal" value={item.qty} onChange={e => updateItem(idx,'qty',e.target.value)} placeholder="ks"/>
                  <Input className="col-span-2 text-xs" value={item.unit} onChange={e => updateItem(idx,'unit',e.target.value)} placeholder="ks"/>
                  <Input className="col-span-2 text-xs" type="number" inputMode="numeric" value={item.price} onChange={e => updateItem(idx,'price',e.target.value)} placeholder="Kč"/>
                  <button type="button" onClick={() => removeItem(idx)} className="col-span-1 p-1.5 rounded hover:bg-red-50 text-red-600"><X size={12}/></button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={addItem} className="text-xs text-primary font-semibold hover:underline">+ Přidat řádek</button>
                <Select onChange={e => { if(e.target.value) { addServiceFromPricelist(e.target.value); e.target.value='' } }} className="text-xs flex-1 max-w-[220px]">
                  <option value="">+ z ceníku služeb</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatCurrency(s.price)})</option>)}
                </Select>
              </div>
            </div>
          </FormField>

          <FormField label="Sleva (%)">
            <Input type="number" inputMode="numeric" value={form.discount} onChange={e => setForm(f => ({...f, discount:e.target.value}))} placeholder="0"/>
          </FormField>
          <FormField label="DPH (%)">
            <Input type="number" inputMode="numeric" value={form.vat} onChange={e => setForm(f => ({...f, vat:e.target.value}))} placeholder="21"/>
          </FormField>

          <div className="sm:col-span-2 bg-muted/50 rounded-xl p-4 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Mezisoučet</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            {form.discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sleva</span><span className="text-green-600">−{formatCurrency(subtotal * form.discount / 100)}</span></div>}
            <div className="flex justify-between pt-1.5 border-t border-border"><span className="font-bold">Celkem</span><span className="font-bold text-lg">{formatCurrency(total)}</span></div>
          </div>

          <FormField label="Poznámka" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Záruka, podmínky, termíny..."/>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteQuote(deleteId); setPreviewId(null); toast('Nabídka smazána', 'warning') }}
        title="Smazat nabídku?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
