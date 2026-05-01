import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { receiptCategories, paymentMethods, formatCurrency, formatDate } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard,
  EmptyState, Dialog, FormField, Textarea, ConfirmDialog, toast
} from '../components/ui'
import {
  Plus, Search, Receipt as ReceiptIcon, Edit2, Trash2, X,
  Camera, Filter, TrendingDown, TrendingUp, FileText, Tag,
  Building2, User, ClipboardList, RefreshCw, Check, Eye, ImageIcon, Calendar as CalIcon
} from 'lucide-react'
import { FakeReceiptImage } from '../components/FakeReceiptImage'
import { cn } from '../lib/utils'

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  supplier:'', supplierId:null, category:'substraty',
  amount:'', paymentMethod:'card',
  description:'', items:[{name:'',qty:'1',pricePerUnit:'',total:0}],
  clientId:null, orderId:null,
  rebill:false, rebilled:false, margin:'15',
  notes:'', photo:false
}

export function Receipts() {
  const { receipts, suppliers, clients, orders, addReceipt, updateReceipt, deleteReceipt } = useApp()

  const [q, setQ]                   = useState('')
  const [cat, setCat]               = useState('')
  const [rebillFilter, setRebillFilter] = useState('all') // all, rebill_pending, rebilled, no_rebill
  const [periodFilter, setPeriodFilter] = useState('all')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingId, setEditingId]   = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [deleteId, setDeleteId]     = useState(null)
  const [detailId, setDetailId]     = useState(null)
  const [scanModalOpen, setScanModalOpen] = useState(false)
  const [scanStep, setScanStep]     = useState(0) // 0: tap to scan, 1: scanning, 2: detected
  const [photoModalUrl, setPhotoModalUrl] = useState(null)

  // Filtered + sorted receipts
  const filtered = useMemo(() => {
    let list = receipts.filter(r => {
      const mq = !q
        || r.description?.toLowerCase().includes(q.toLowerCase())
        || r.supplier?.toLowerCase().includes(q.toLowerCase())
        || r.notes?.toLowerCase().includes(q.toLowerCase())
      const mc = !cat || r.category === cat

      let mr = true
      if (rebillFilter === 'rebill_pending') mr = r.rebill && !r.rebilled
      if (rebillFilter === 'rebilled')       mr = r.rebill && r.rebilled
      if (rebillFilter === 'no_rebill')      mr = !r.rebill

      let mp = true
      const now = new Date()
      const rd = new Date(r.date)
      if (periodFilter === 'this_month')   mp = rd.getMonth() === now.getMonth() && rd.getFullYear() === now.getFullYear()
      if (periodFilter === 'last_month') {
        const last = new Date(now); last.setMonth(now.getMonth() - 1)
        mp = rd.getMonth() === last.getMonth() && rd.getFullYear() === last.getFullYear()
      }
      if (periodFilter === 'this_year')    mp = rd.getFullYear() === now.getFullYear()

      return mq && mc && mr && mp
    })
    list.sort((a, b) => new Date(b.date) - new Date(a.date))
    return list
  }, [receipts, q, cat, rebillFilter, periodFilter])

  // Stats — for THIS MONTH by default
  const now = new Date()
  const thisMonthReceipts = receipts.filter(r => {
    const rd = new Date(r.date)
    return rd.getMonth() === now.getMonth() && rd.getFullYear() === now.getFullYear()
  })
  const totalThisMonth   = thisMonthReceipts.reduce((s,r) => s + r.amount, 0)
  const rebillPending    = receipts.filter(r => r.rebill && !r.rebilled)
  const rebillPendingSum = rebillPending.reduce((s,r) => s + r.amount, 0)
  const totalAll         = receipts.reduce((s,r) => s + r.amount, 0)

  // Top categories
  const categorySpend = useMemo(() => {
    const map = {}
    thisMonthReceipts.forEach(r => {
      map[r.category] = (map[r.category] || 0) + r.amount
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [thisMonthReceipts])

  // ── Helpers ──
  const detailReceipt = receipts.find(r => r.id === detailId)
  const getClient   = id => clients.find(c => c.id === id)
  const getOrder    = id => orders.find(o => o.id === id)
  const getSupplier = id => suppliers.find(s => s.id === id)
  const getCategory = id => receiptCategories.find(c => c.id === id)

  // ── Form handlers ──
  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  function openEdit(r) {
    setEditingId(r.id)
    setForm({
      ...r,
      amount: String(r.amount),
      margin: String(r.margin || 0),
      items: r.items?.length ? r.items.map(i => ({...i, qty:String(i.qty), pricePerUnit:String(i.pricePerUnit)})) : [{name:'',qty:'1',pricePerUnit:'',total:0}],
    })
    setDetailId(null)
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.supplier?.trim()) { toast('Vyplňte dodavatele', 'error'); return }
    if (!form.amount || isNaN(form.amount)) { toast('Vyplňte částku', 'error'); return }

    const itemsClean = form.items
      .filter(i => i.name?.trim() && parseFloat(i.qty) > 0)
      .map(i => ({
        name: i.name.trim(),
        qty: parseFloat(i.qty) || 0,
        pricePerUnit: parseFloat(i.pricePerUnit) || 0,
        total: (parseFloat(i.qty) || 0) * (parseFloat(i.pricePerUnit) || 0),
      }))

    const data = {
      ...form,
      amount: parseInt(form.amount) || 0,
      margin: parseInt(form.margin) || 0,
      items: itemsClean,
      clientId: form.clientId ? parseInt(form.clientId) : null,
      orderId: form.orderId ? parseInt(form.orderId) : null,
      supplierId: form.supplierId ? parseInt(form.supplierId) : null,
    }

    if (editingId) {
      updateReceipt({ ...data, id: editingId })
      toast('Účtenka upravena')
    } else {
      addReceipt({ ...data, photo: data.photo || false })
      toast('Účtenka přidána')
    }
    setModalOpen(false)
  }

  // ── Scan flow ──
  function startScan() {
    setScanStep(0)
    setScanModalOpen(true)
  }
  function tapToScan() {
    setScanStep(1)
    setTimeout(() => setScanStep(2), 1400)
  }
  function useScannedData() {
    // Simulated OCR result — pre-fills the form
    setScanModalOpen(false)
    setEditingId(null)
    setForm({
      ...emptyForm,
      supplier: 'AGRO CS a.s.',
      supplierId: 1,
      category: 'substraty',
      amount: '1620',
      paymentMethod: 'card',
      description: 'Mulčovací kůra borová 9 ks',
      items: [{name:'Mulčovací kůra borová', qty:'9', pricePerUnit:'180', total:1620}],
      photo: true,
    })
    setModalOpen(true)
    toast('Účtenka naskenována — zkontrolujte a uložte')
  }

  // ── Add/remove items rows ──
  function addItemRow() {
    setForm(f => ({ ...f, items: [...f.items, {name:'',qty:'1',pricePerUnit:'',total:0}] }))
  }
  function updateItem(idx, field, val) {
    setForm(f => {
      const items = [...f.items]
      items[idx] = { ...items[idx], [field]: val }
      const qty = parseFloat(items[idx].qty) || 0
      const ppu = parseFloat(items[idx].pricePerUnit) || 0
      items[idx].total = qty * ppu
      // Auto-update total amount
      const sum = items.reduce((s,i) => s + ((parseFloat(i.qty)||0) * (parseFloat(i.pricePerUnit)||0)), 0)
      return { ...f, items, amount: String(Math.round(sum)) }
    })
  }
  function removeItemRow(idx) {
    setForm(f => ({ ...f, items: f.items.length > 1 ? f.items.filter((_,i) => i !== idx) : f.items }))
  }

  // Filter orders by selected client
  const ordersForClient = form.clientId
    ? orders.filter(o => o.clientId === parseInt(form.clientId))
    : []

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Tento měsíc" value={formatCurrency(totalThisMonth)} sub={`${thisMonthReceipts.length} účtenek`} icon={TrendingDown} color="text-amber-600"/>
        <StatCard label="Refakturovat"  value={formatCurrency(rebillPendingSum)} sub={`${rebillPending.length} čeká`} icon={RefreshCw} color={rebillPending.length>0?'text-blue-600':undefined}/>
        <StatCard label="Celkem"        value={formatCurrency(totalAll)} sub={`${receipts.length} účtenek`} icon={ReceiptIcon}/>
        <StatCard label="Top kategorie" value={categorySpend[0] ? getCategory(categorySpend[0][0])?.label?.slice(0,12) : '—'} sub={categorySpend[0] ? formatCurrency(categorySpend[0][1]) : 'tento měsíc'} icon={Tag}/>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat účtenku, dodavatele…" className="pl-8"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 sm:flex-initial sm:w-44">
            <option value="">Všechny kategorie</option>
            {receiptCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
          <Select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} className="flex-1 sm:flex-initial sm:w-36">
            <option value="all">Vše</option>
            <option value="this_month">Tento měsíc</option>
            <option value="last_month">Minulý měsíc</option>
            <option value="this_year">Tento rok</option>
          </Select>
          <Select value={rebillFilter} onChange={e => setRebillFilter(e.target.value)} className="flex-1 sm:flex-initial sm:w-44">
            <option value="all">Vše</option>
            <option value="rebill_pending">K refakturaci</option>
            <option value="rebilled">Refakturováno</option>
            <option value="no_rebill">Bez refakturace</option>
          </Select>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary" size="sm" onClick={startScan} className="gap-1.5">
          <Camera size={14}/>Naskenovat účtenku
        </Button>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus size={14}/>Přidat ručně
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'účtenka' : filtered.length < 5 ? 'účtenky' : 'účtenek'}</p>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={ReceiptIcon} title="Žádné účtenky nenalezeny" description="Naskenujte první účtenku tlačítkem výše."
          action={<Button variant="primary" size="sm" onClick={startScan}><Camera size={14}/>Naskenovat účtenku</Button>}/>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(r => {
            const category = getCategory(r.category)
            const client = getClient(r.clientId)
            const order = getOrder(r.orderId)
            return (
              <Card key={r.id} onClick={() => setDetailId(r.id)} className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-gray-50 flex items-center justify-center">
                      {r.photo ? (
                        <FakeReceiptImage receipt={r}/>
                      ) : (
                        <ReceiptIcon size={20} className="text-muted-foreground/40"/>
                      )}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="font-bold tracking-tight text-sm truncate">{r.description}</p>
                        <p className="font-bold text-sm whitespace-nowrap">{formatCurrency(r.amount)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{r.supplier}</p>

                      {/* Tags row */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {category && (
                          <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border', category.color)}>
                            <span>{category.icon}</span>{category.label}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{formatDate(r.date)}</span>
                        {client && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                            <User size={9}/>{client.name?.split(' ').slice(-1)[0]}
                          </span>
                        )}
                        {r.rebill && (
                          r.rebilled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                              <Check size={9}/>Refakturováno
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-300 px-1.5 py-0.5 rounded-full">
                              <RefreshCw size={9}/>K refakturaci
                            </span>
                          )
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

      {/* Detail panel */}
      {detailReceipt && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-stretch sm:justify-end" onClick={() => setDetailId(null)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={e => e.stopPropagation()} className="relative w-full sm:max-w-[480px] bg-white shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none sm:border-l border-border" style={{maxHeight:'calc(100vh - 16px)', height:'100%'}}>
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>

            <div className="bg-white flex items-center justify-between px-5 py-3 sm:py-4 border-b border-border flex-shrink-0">
              <p className="text-sm font-semibold">Detail účtenky</p>
              <button onClick={() => setDetailId(null)} className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent touch-manipulation"><X size={14}/></button>
            </div>

            <div className="overflow-y-auto overscroll-contain flex-1" style={{WebkitOverflowScrolling:'touch'}}>
              {/* Hero — receipt image */}
              {detailReceipt.photo && (
                <div className="px-5 py-5 bg-gray-50 border-b border-border flex justify-center" onClick={() => setPhotoModalUrl(detailReceipt)}>
                  <div className="w-44 cursor-pointer hover:opacity-80 transition-opacity">
                    <FakeReceiptImage receipt={detailReceipt}/>
                  </div>
                </div>
              )}

              {/* Title + amount */}
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg leading-tight">{detailReceipt.description}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{detailReceipt.supplier}</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{formatCurrency(detailReceipt.amount)}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1"><CalIcon size={12}/>{formatDate(detailReceipt.date)}</span>
                  <span>·</span>
                  <span>{paymentMethods.find(p=>p.id===detailReceipt.paymentMethod)?.label}</span>
                </div>
              </div>

              {/* Status badges */}
              <div className="px-5 py-3 border-b border-border flex flex-wrap gap-2">
                {(() => {
                  const cat = getCategory(detailReceipt.category)
                  return cat && (
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', cat.color)}>
                      <span>{cat.icon}</span>{cat.label}
                    </span>
                  )
                })()}
                {detailReceipt.rebill && !detailReceipt.rebilled && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-300">
                    <RefreshCw size={11}/>K refakturaci ({detailReceipt.margin || 0}% marže)
                  </span>
                )}
                {detailReceipt.rebilled && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-green-700 bg-green-50 border border-green-200">
                    <Check size={11}/>Refakturováno
                  </span>
                )}
              </div>

              {/* Items */}
              {detailReceipt.items?.length > 0 && (
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Položky ({detailReceipt.items.length})</p>
                  <div className="space-y-2">
                    {detailReceipt.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.qty} × {formatCurrency(item.pricePerUnit)}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                    <p className="font-semibold">Celkem</p>
                    <p className="font-bold text-lg">{formatCurrency(detailReceipt.amount)}</p>
                  </div>
                </div>
              )}

              {/* Linkage */}
              {(detailReceipt.clientId || detailReceipt.orderId) && (
                <div className="px-5 py-4 border-b border-border space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Přiřazeno k</p>
                  {detailReceipt.clientId && getClient(detailReceipt.clientId) && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getClient(detailReceipt.clientId)?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-700">Klient</p>
                        <p className="font-semibold text-sm truncate">{getClient(detailReceipt.clientId)?.name}</p>
                      </div>
                    </div>
                  )}
                  {detailReceipt.orderId && getOrder(detailReceipt.orderId) && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <ClipboardList size={15} className="text-white"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-purple-700">Zakázka</p>
                        <p className="font-semibold text-sm">#{detailReceipt.orderId} — {formatDate(getOrder(detailReceipt.orderId)?.date)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {detailReceipt.notes && (
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Poznámka</p>
                  <p className="text-sm leading-relaxed">{detailReceipt.notes}</p>
                </div>
              )}

              {/* Refacturation calc */}
              {detailReceipt.rebill && !detailReceipt.rebilled && detailReceipt.margin > 0 && (
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Návrh refakturace</p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Náklad</span>
                      <span className="font-medium">{formatCurrency(detailReceipt.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Marže {detailReceipt.margin}%</span>
                      <span className="font-medium">+{formatCurrency(Math.round(detailReceipt.amount * detailReceipt.margin / 100))}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-green-200">
                      <span className="font-semibold">K refakturaci</span>
                      <span className="font-bold text-green-700">{formatCurrency(Math.round(detailReceipt.amount * (1 + detailReceipt.margin / 100)))}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 sm:py-4 border-t border-border flex gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
              <Button size="sm" onClick={() => openEdit(detailReceipt)} className="gap-1 flex-1"><Edit2 size={12}/>Upravit</Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(detailReceipt.id)} className="gap-1"><Trash2 size={12}/></Button>
            </div>
          </div>
        </div>
      )}

      {/* Photo zoom modal */}
      {photoModalUrl && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setPhotoModalUrl(null)}>
          <div className="absolute inset-0 bg-black/80"/>
          <div className="relative max-w-md w-full">
            <FakeReceiptImage receipt={photoModalUrl} large/>
            <button onClick={() => setPhotoModalUrl(null)} className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center"><X size={18}/></button>
          </div>
        </div>
      )}

      {/* SCAN modal */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setScanModalOpen(false)}>
          <div className="absolute inset-0 bg-black/70"/>
          <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-sm sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5 sm:p-6" style={{paddingBottom:'max(20px, env(safe-area-inset-bottom))'}}>
            <div className="sm:hidden flex justify-center -mt-2 mb-3"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>

            {scanStep === 0 && (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                    <Camera size={28} className="text-white"/>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Naskenovat účtenku</h3>
                  <p className="text-sm text-muted-foreground mb-6">Vyfoťte účtenku a aplikace automaticky rozpozná částku, dodavatele a položky.</p>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => setScanModalOpen(false)}>Zrušit</Button>
                  <Button variant="primary" className="flex-1 gap-1" onClick={tapToScan}><Camera size={14}/>Vyfotit</Button>
                </div>
              </>
            )}

            {scanStep === 1 && (
              <>
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent mx-auto mb-5" style={{animation:'spin 0.9s linear infinite'}}/>
                  <h3 className="font-bold text-lg mb-2">Rozpoznávám…</h3>
                  <p className="text-sm text-muted-foreground">Detekuji částku a dodavatele</p>
                </div>
              </>
            )}

            {scanStep === 2 && (
              <>
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Check size={26} className="text-green-600"/>
                  </div>
                  <h3 className="font-bold text-lg">Účtenka rozpoznána</h3>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dodavatel</span>
                    <span className="font-semibold">AGRO CS a.s.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Datum</span>
                    <span className="font-semibold">{formatDate(new Date().toISOString().split('T')[0])}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Položek</span>
                    <span className="font-semibold">1 (Mulčovací kůra borová)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-semibold">Celkem</span>
                    <span className="font-bold text-lg">1 620 Kč</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => { setScanModalOpen(false); setScanStep(0) }}>Zrušit</Button>
                  <Button variant="primary" className="flex-1 gap-1" onClick={useScannedData}><Check size={14}/>Pokračovat</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit účtenku' : 'Nová účtenka'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit účtenku</Button></>}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FormField label="Datum *">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))}/>
          </FormField>
          <FormField label="Způsob platby">
            <Select value={form.paymentMethod} onChange={e => setForm(f => ({...f, paymentMethod:e.target.value}))}>
              {paymentMethods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </Select>
          </FormField>

          <FormField label="Dodavatel *" className="sm:col-span-2">
            <Select value={form.supplierId || ''} onChange={e => {
              const sid = e.target.value
              const sup = suppliers.find(s => s.id === parseInt(sid))
              setForm(f => ({...f, supplierId: sid || null, supplier: sup?.name || f.supplier}))
            }}>
              <option value="">— Vyberte dodavatele nebo zadejte vlastní —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </FormField>

          {!form.supplierId && (
            <FormField label="Dodavatel — vlastní název" className="sm:col-span-2">
              <Input value={form.supplier} onChange={e => setForm(f => ({...f, supplier:e.target.value}))} placeholder="OMV, Hornbach…"/>
            </FormField>
          )}

          <FormField label="Kategorie *">
            <Select value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
              {receiptCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Celková částka (Kč) *">
            <Input type="number" inputMode="numeric" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} placeholder="1620"/>
          </FormField>

          <FormField label="Popis *" className="sm:col-span-2">
            <Input value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="Mulčovací kůra borová 9 ks"/>
          </FormField>

          {/* Items rows */}
          <FormField label="Položky účtenky" className="sm:col-span-2" hint="Volitelné — pro detailní rozpis">
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                  <Input className="col-span-5 text-xs" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} placeholder="Název"/>
                  <Input className="col-span-2 text-xs" type="number" inputMode="decimal" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} placeholder="ks"/>
                  <Input className="col-span-3 text-xs" type="number" inputMode="numeric" value={item.pricePerUnit} onChange={e => updateItem(idx, 'pricePerUnit', e.target.value)} placeholder="Kč/ks"/>
                  <div className="col-span-2 text-xs text-right font-semibold">
                    {item.total > 0 ? formatCurrency(item.total) : '—'}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItemRow} className="text-xs text-primary font-semibold hover:underline">+ Přidat položku</button>
            </div>
          </FormField>

          {/* Client + order linkage */}
          <FormField label="Pro kterého klienta" hint="Volitelné — režijní výdaj nechte prázdné">
            <Select value={form.clientId || ''} onChange={e => setForm(f => ({...f, clientId: e.target.value || null, orderId: null}))}>
              <option value="">— Žádný (režie firmy) —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="K zakázce" hint={!form.clientId ? 'Nejdřív vyberte klienta' : ''}>
            <Select value={form.orderId || ''} onChange={e => setForm(f => ({...f, orderId: e.target.value || null}))} disabled={!form.clientId}>
              <option value="">— Bez konkrétní zakázky —</option>
              {ordersForClient.map(o => <option key={o.id} value={o.id}>#{o.id} — {formatDate(o.date)}</option>)}
            </Select>
          </FormField>

          {/* Refacturation toggle */}
          {form.clientId && (
            <FormField label="Refakturace klientovi" className="sm:col-span-2">
              <div className="flex items-center gap-3 p-3 border border-input rounded-xl bg-muted/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.rebill}
                    onChange={e => setForm(f => ({...f, rebill:e.target.checked}))}/>
                  <span className="text-sm font-medium">Přefakturovat klientovi</span>
                </label>
                {form.rebill && (
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Marže:</span>
                    <Input type="number" inputMode="numeric" value={form.margin} onChange={e => setForm(f => ({...f, margin:e.target.value}))} className="w-16 text-xs h-8" placeholder="15"/>
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            </FormField>
          )}

          <FormField label="Poznámka" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Pro velkou zahradu Šimánek — Velké Popovice"/>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteReceipt(deleteId); setDetailId(null); toast('Účtenka odstraněna', 'warning') }}
        title="Smazat účtenku?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
