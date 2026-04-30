import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, business } from '../data'
import { Card, CardContent, CardHeader, CardTitle, StatCard, Button, Input, Select, PillTabs, EmptyState, Dialog, FormField, Textarea, ConfirmDialog, toast } from '../components/ui'
import { Plus, Receipt, CheckCircle, Clock, AlertCircle, Printer, Mail, X, Download, Eye, FileText } from 'lucide-react'
import { generateInvoicePdf } from '../lib/generatePdf'
import { cn } from '../lib/utils'

export function Invoices() {
  const { clients, invoices, orders, addInvoice, markInvoicePaid, deleteInvoice, nextInvoiceNum } = useApp()
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [previewId, setPreviewId] = useState(null)
  const [newOpen, setNewOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [smsOffer, setSmsOffer] = useState(null) // { clientId, amount }
  const [form, setForm] = useState({ clientId:'', date:new Date().toISOString().split('T')[0], dueDate:'', amount:'', notes:'' })
  const printRef = useRef()
  const today = new Date()

  useEffect(() => {
    const due = new Date(Date.now()+14*24*3600*1000).toISOString().split('T')[0]
    setForm(f => ({...f, dueDate:due}))
    if (searchParams.get('new')==='1') setNewOpen(true)
  }, [])

  const getClient = id => clients.find(c => c.id===id)

  const totalPaid    = invoices.filter(i=>i.paid).reduce((s,i)=>s+i.amount,0)
  const totalPending = invoices.filter(i=>!i.paid).reduce((s,i)=>s+i.amount,0)
  const totalOverdue = invoices.filter(i=>!i.paid&&new Date(i.dueDate)<today).reduce((s,i)=>s+i.amount,0)

  const tabs = [
    { label:'Všechny', value:'all', count:invoices.length },
    { label:'Nezaplacené', value:'unpaid', count:invoices.filter(i=>!i.paid).length },
    { label:'Zaplacené', value:'paid', count:invoices.filter(i=>i.paid).length },
    { label:'Po splatnosti', value:'overdue', count:invoices.filter(i=>!i.paid&&new Date(i.dueDate)<today).length },
  ]

  const filtered = invoices.filter(i => {
    if (filter==='paid')    return i.paid
    if (filter==='unpaid')  return !i.paid
    if (filter==='overdue') return !i.paid && new Date(i.dueDate)<today
    return true
  }).sort((a,b)=>new Date(b.date)-new Date(a.date))

  const previewInv = invoices.find(i=>i.id===previewId)

  function handleSave() {
    if (!form.clientId||!form.amount) { toast('Vyplňte klienta a částku','error'); return }
    const inv = { id:nextInvoiceNum(), clientId:parseInt(form.clientId), date:form.date, dueDate:form.dueDate, amount:parseInt(form.amount), paid:false, paidDate:null, orderId:null }
    addInvoice(inv); setNewOpen(false)
    toast(`Faktura #${inv.id} vystavena`)
    setTimeout(() => setPreviewId(inv.id), 400)
  }

  function handlePdf() {
    if (!previewInv) return
    const c = getClient(previewInv.clientId)
    generateInvoicePdf(previewInv, c, business)
    toast('PDF faktura stažena')
  }
  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Zaplaceno" value={formatCurrency(totalPaid)} subVariant="up" sub={`${invoices.filter(i=>i.paid).length} faktur`} icon={CheckCircle}/>
        <StatCard label="Čeká" value={formatCurrency(totalPending)} sub={`${invoices.filter(i=>!i.paid).length} faktur`} icon={Clock}/>
        <StatCard label="Po splatnosti" value={formatCurrency(totalOverdue)} subVariant={totalOverdue>0?'down':undefined} color={totalOverdue>0?'text-destructive':undefined} icon={AlertCircle}/>
        <StatCard label="Celkem" value={formatCurrency(invoices.reduce((s,i)=>s+i.amount,0))} sub={`${invoices.length} faktur`}/>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
        <PillTabs tabs={tabs} active={filter} onChange={setFilter} className="flex-1 overflow-x-auto"/>
        <Button variant="primary" size="sm" onClick={() => setNewOpen(true)} className="flex-shrink-0"><Plus size={14}/><span className="hidden sm:inline">Nová faktura</span><span className="sm:hidden">Nová</span></Button>
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden sm:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr>
                {['Číslo','Klient','Vystaveno','Splatnost','Částka','Stav',''].map(h => (
                  <th key={h} className="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={7}><EmptyState icon={Receipt} title="Žádné faktury" description="V tomto filtru nejsou žádné faktury."/></td></tr>
                ) : filtered.map(inv => {
                  const c = getClient(inv.clientId)
                  const isOverdue = !inv.paid && new Date(inv.dueDate)<today
                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setPreviewId(inv.id)}>
                      <td className="px-5 py-4 border-b border-border font-bold text-primary">#{inv.id}</td>
                      <td className="px-5 py-4 border-b border-border">
                        <p className="font-semibold">{c?.name||'—'}</p>
                        <p className="text-xs text-muted-foreground">{c?.address}</p>
                      </td>
                      <td className="px-5 py-4 border-b border-border text-muted-foreground whitespace-nowrap">{formatDate(inv.date)}</td>
                      <td className={cn('px-5 py-4 border-b border-border whitespace-nowrap', isOverdue?'text-destructive font-semibold':'text-muted-foreground')}>{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-4 border-b border-border font-bold whitespace-nowrap">{formatCurrency(inv.amount)}</td>
                      <td className="px-5 py-4 border-b border-border" onClick={e=>e.stopPropagation()}>
                        {inv.paid ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"/>Zaplaceno</span>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border', isOverdue?'bg-red-50 text-red-700 border-red-200':'bg-amber-50 text-amber-700 border-amber-200')}>
                              <span className={cn('w-1.5 h-1.5 rounded-full',isOverdue?'bg-destructive':'bg-amber-500')}/>{isOverdue?'Po splatnosti':'Čeká'}
                            </span>
                            <Button variant="primary" size="sm" onClick={()=>{markInvoicePaid(inv.id);const cl=getClient(inv.clientId);setSmsOffer({clientId:inv.clientId,name:cl?.name,phone:cl?.phone,amount:inv.amount});toast('Faktura zaplacena')}}>Zaplaceno</Button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 border-b border-border" onClick={e=>e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="icon-sm" onClick={()=>setPreviewId(inv.id)} title="Náhled"><Eye size={12}/></Button>
                          <Button variant="danger" size="icon-sm" onClick={()=>setDeleteId(inv.id)} title="Smazat"><X size={12}/></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cards — mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.length===0 ? (
          <EmptyState icon={Receipt} title="Žádné faktury" description="V tomto filtru nejsou žádné faktury."/>
        ) : filtered.map(inv => {
          const c = getClient(inv.clientId)
          const isOverdue = !inv.paid && new Date(inv.dueDate)<today
          return (
            <Card key={inv.id} onClick={()=>setPreviewId(inv.id)}>
              <CardContent className="p-4">
                {/* Top row — number + amount */}
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-primary text-sm">#{inv.id}</p>
                  <p className="font-bold text-base">{formatCurrency(inv.amount)}</p>
                </div>
                {/* Client name */}
                <p className="font-semibold text-base">{c?.name||'—'}</p>
                {/* Dates + status */}
                <div className="flex items-center justify-between mt-1 mb-3 gap-2">
                  <p className="text-xs text-muted-foreground">{formatDate(inv.date)} → {formatDate(inv.dueDate)}</p>
                  {inv.paid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>Zaplaceno
                    </span>
                  ) : (
                    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0', isOverdue?'bg-red-50 text-red-700 border-red-200':'bg-amber-50 text-amber-700 border-amber-200')}>
                      <span className={cn('w-1.5 h-1.5 rounded-full',isOverdue?'bg-destructive':'bg-amber-500')}/>
                      {isOverdue?'Po splatnosti':'Čeká na platbu'}
                    </span>
                  )}
                </div>
                {/* Action button */}
                {!inv.paid && (
                  <Button variant="primary" size="md" className="w-full gap-2" onClick={e=>{e.stopPropagation();const cl=getClient(inv.clientId);markInvoicePaid(inv.id);setSmsOffer({clientId:inv.clientId,name:cl?.name,phone:cl?.phone,amount:inv.amount});toast('Faktura zaplacena')}}>
                    <CheckCircle size={16}/> Označit jako zaplaceno
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Invoice Preview Modal */}
      {previewInv && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={()=>setPreviewId(null)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-2xl sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)', minHeight:'200px'}} ref={printRef}>
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
            {/* Header */}
            <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-white flex-shrink-0">
              <h2 className="font-bold tracking-tight">Faktura #{previewInv.id}</h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={()=>{toast('Faktura odeslána emailem');setPreviewId(null)}} className="hidden sm:flex gap-1"><Mail size={12}/>Odeslat</Button>
                <Button size="sm" onClick={handlePdf} className="gap-1"><Download size={12}/>PDF</Button>
                <Button size="sm" onClick={handlePrint} className="hidden sm:flex gap-1"><Printer size={12}/>Tisknout</Button>
                <button onClick={()=>setPreviewId(null)} className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent flex-shrink-0"><X size={14}/></button>
              </div>
            </div>

            {/* Invoice content */}
            <div className="overflow-y-auto overscroll-contain p-4 sm:p-6 flex-1" id="invoice-print" style={{WebkitOverflowScrolling:'touch'}}>
              {/* Dark header */}
              <div className="bg-gray-900 rounded-xl p-5 sm:p-6 text-white mb-5 sm:mb-6">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <p className="text-green-400 font-bold text-lg tracking-tight">{business.name}</p>
                    <p className="text-white/50 text-xs mt-1">{business.address}</p>
                    <p className="text-white/50 text-xs">{business.phone} · {business.email}</p>
                    <p className="text-white/40 text-xs mt-1">IČO: {business.ico} · DIČ: {business.dic}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 uppercase tracking-wider">Faktura</p>
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight">#{previewInv.id}</p>
                    <p className="text-xs text-white/50 mt-1">Vystaveno: {formatDate(previewInv.date)}</p>
                    <p className="text-xs text-white/50">Splatnost: {formatDate(previewInv.dueDate)}</p>
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Dodavatel</p>
                  <p className="font-bold text-sm">{business.name}</p>
                  <p className="text-sm text-muted-foreground">{business.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">IČO: {business.ico}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Odběratel</p>
                  <p className="font-bold text-sm">{getClient(previewInv.clientId)?.name}</p>
                  <p className="text-sm text-muted-foreground">{getClient(previewInv.clientId)?.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getClient(previewInv.clientId)?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div className="border border-border rounded-xl overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Popis</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Množství</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Jedn. cena</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Celkem</th>
                  </tr></thead>
                  <tbody>
                    {previewInv.serviceDetails ? (
                      previewInv.serviceDetails.map((item,i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden sm:table-cell">{item.qty} {item.unit}</td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden sm:table-cell">{item.pricePerUnit} Kč/{item.unit}</td>
                          <td className="px-4 py-3 text-right font-semibold text-sm">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-4 text-sm">Zahradnické práce — zakázka #{previewInv.orderId||'—'}</td>
                        <td className="px-4 py-4 text-right hidden sm:table-cell text-muted-foreground">1 paušál</td>
                        <td className="px-4 py-4 text-right hidden sm:table-cell text-muted-foreground">{formatCurrency(previewInv.amount)}</td>
                        <td className="px-4 py-4 text-right font-bold">{formatCurrency(previewInv.amount)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Základ daně (21 %)</span><span>{formatCurrency(Math.round(previewInv.amount/1.21))}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>DPH 21 %</span><span>{formatCurrency(previewInv.amount - Math.round(previewInv.amount/1.21))}</span></div>
              </div>
              <div className="flex justify-between items-center bg-gray-900 text-white rounded-xl px-4 sm:px-5 py-3 sm:py-4">
                <span className="font-bold text-sm sm:text-base">K úhradě</span>
                <span className="text-xl sm:text-2xl font-bold text-green-400 tracking-tight">{formatCurrency(previewInv.amount)}</span>
              </div>

              {/* QR & Bank */}
              <div className="mt-4 p-3 sm:p-4 bg-muted/50 rounded-xl">
                <p className="font-semibold text-xs mb-1.5">Platební údaje</p>
                <p className="text-xs text-muted-foreground">Číslo účtu: {business.bank}</p>
                <p className="text-xs text-muted-foreground">Variabilní symbol: {previewInv.id}</p>
                <p className={cn('text-xs font-semibold mt-1', previewInv.paid?'text-green-600':'text-amber-600')}>{previewInv.paid?'✓ ZAPLACENO':'⏳ ČEKÁ NA PLATBU'}</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* SMS offer after payment */}
      {smsOffer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setSmsOffer(null)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-sm sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5 sm:p-6" style={{paddingBottom:'max(20px, env(safe-area-inset-bottom))'}}>
            <div className="sm:hidden flex justify-center -mt-2 mb-3"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
            <h3 className="font-bold text-base mb-1">Odeslat poděkování?</h3>
            <p className="text-sm text-muted-foreground mb-4">{smsOffer.name} zaplatil. Chcete odeslat SMS s poděkováním?</p>
            <div className="bg-muted/50 rounded-xl p-3 mb-5 text-sm text-muted-foreground italic">
              "Dobrý den, děkujeme za platbu {new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(smsOffer?.amount||0)}. Těšíme se na příští spolupráci! — ZahradaPro"
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setSmsOffer(null)}>Přeskočit</Button>
              <Button variant="primary" className="flex-1" onClick={() => { toast('SMS poděkování odesláno'); setSmsOffer(null) }}>Odeslat SMS</Button>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice */}
      <Dialog open={newOpen} onClose={()=>setNewOpen(false)} title="Nová faktura"
        footer={<><Button onClick={()=>setNewOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Vystavit fakturu</Button></>}>
        <FormField label="Klient *">
          <Select value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))}>
            <option value="">— Vyberte klienta —</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Datum vystavení"><Input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></FormField>
          <FormField label="Datum splatnosti"><Input type="date" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}/></FormField>
        </div>
        <FormField label="Celková částka (Kč) *"><Input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="3450"/></FormField>
      </Dialog>

      {/* Confirm delete */}
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{deleteInvoice(deleteId);toast('Faktura smazána','warning')}}
        title="Smazat fakturu?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
