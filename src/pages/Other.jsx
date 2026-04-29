import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, StatCard, EmptyState, Dialog, FormField, Input, Select, Textarea, ConfirmDialog, toast, PillTabs } from '../components/ui'
import { ChevronLeft, ChevronRight, Plus, ArrowRight, Edit2, Trash2, MapPin, Bell, Send, RotateCcw, TrendingUp, Users, Calendar as CalIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'

// ── Calendar ──────────────────────────────────
export function Calendar() {
  const { clients, orders } = useApp()
  const [current, setCurrent] = useState(new Date())
  const [view, setView] = useState('month')
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]
  const months = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
  const days = ['Po','Út','St','Čt','Pá','So','Ne']
  const getClient = id => clients.find(c=>c.id===id)

  function navigate(dir) {
    const d = new Date(current)
    if (view==='month') d.setMonth(d.getMonth()+dir)
    else d.setDate(d.getDate()+dir*7)
    setCurrent(d)
  }

  const y=current.getFullYear(), m=current.getMonth()
  const startDay = (new Date(y,m,1).getDay()+6)%7
  const lastDate = new Date(y,m+1,0).getDate()
  const upcoming = orders.filter(o=>o.status==='scheduled'&&o.date>=todayISO).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,5)
  const getOrdersForDate = ds => orders.filter(o=>o.date===ds)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">{months[m]} {y}</h2>
          <p className="text-sm text-muted-foreground">{upcoming.length} nadcházejících zakázek</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted rounded-xl p-1 gap-0.5">
            {['month','week'].map(v=>(
              <button key={v} onClick={()=>setView(v)} className={cn('px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation', v===view?'bg-white shadow-sm font-semibold':'text-muted-foreground')}>
                {v==='month'?'Měsíc':'Týden'}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="icon" onClick={()=>navigate(-1)}><ChevronLeft size={16}/></Button>
            <Button size="sm" onClick={()=>setCurrent(new Date())}>Dnes</Button>
            <Button size="icon" onClick={()=>navigate(1)}><ChevronRight size={16}/></Button>
          </div>
          <Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Nová</Button></Link>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map(d=><div key={d} className="py-2 sm:py-3 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({length:startDay}).map((_,i)=><div key={'e'+i} className="min-h-[52px] sm:min-h-[80px] border-r border-b border-border bg-muted/20"/>)}
          {Array.from({length:lastDate}).map((_,i)=>{
            const d=i+1
            const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
            const dos=getOrdersForDate(ds)
            const isToday=ds===todayISO
            return (
              <div key={d} className={cn('min-h-[52px] sm:min-h-[80px] border-r border-b border-border p-1 sm:p-2 cursor-pointer hover:bg-green-25 transition-colors', isToday&&'bg-green-50')}>
                <div className={cn('w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1', isToday?'bg-primary text-white':'')}>{d}</div>
                <div className="hidden sm:block space-y-0.5">
                  {dos.slice(0,2).map(o=>{
                    const c=getClient(o.clientId)
                    return <div key={o.id} className="text-[10px] font-semibold bg-green-100 text-green-800 px-1 py-0.5 rounded truncate">{c?.name?.split(' ')[0]}</div>
                  })}
                  {dos.length>2&&<div className="text-[10px] text-muted-foreground">+{dos.length-2}</div>}
                </div>
                {dos.length>0&&<div className="sm:hidden w-1.5 h-1.5 rounded-full bg-primary mt-1 mx-auto"/>}
              </div>
            )
          })}
        </div>
      </Card>

      <div>
        <h3 className="text-sm font-semibold tracking-tight mb-4">Nadcházející zakázky</h3>
        {upcoming.length===0 ? (
          <EmptyState icon={CalIcon} title="Žádné naplánované zakázky" action={<Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Přidat zakázku</Button></Link>}/>
        ) : (
          <div className="space-y-3">
            {upcoming.map((o,i)=>{
              const c=getClient(o.clientId)
              const d=new Date(o.date)
              const hours=[8,9,10,11,12,14]
              return (
                <Card key={o.id}>
                  <CardContent className="p-4 flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                    <div className="text-center w-12 sm:w-14 bg-green-50 border border-green-100 rounded-xl py-2 flex-shrink-0">
                      <p className="text-lg sm:text-xl font-bold text-primary leading-none">{d.getDate()}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{['led','úno','bře','dub','kvě','čer','čvc','srp','zář','říj','lis','pro'][d.getMonth()]}</p>
                      <p className="text-[10px] text-primary font-semibold mt-1">{hours[i%6]}:00</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{c?.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10}/>{c?.address}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {o.services.map(s=><span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-base sm:text-lg tracking-tight">{formatCurrency(o.totalPrice)}</p>
                      <Link to={`/checklist?order=${o.id}`} className="mt-2 inline-block">
                        <Button variant="primary" size="sm">Zahájit <ArrowRight size={12}/></Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Pricelist ─────────────────────────────────
export function Pricelist() {
  const { services, updateService, addService, deleteService } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ name:'', pricePerUnit:'', unit:'' })

  function openEdit(s) { setEditingId(s.id); setForm({name:s.name,pricePerUnit:s.pricePerUnit,unit:s.unit}); setModalOpen(true) }
  function openNew()   { setEditingId(null); setForm({name:'',pricePerUnit:'',unit:''}); setModalOpen(true) }
  function handleSave() {
    if (!form.name||!form.pricePerUnit||!form.unit) { toast('Vyplňte všechna pole','error'); return }
    if (editingId) { updateService({...services.find(s=>s.id===editingId),...form,pricePerUnit:parseInt(form.pricePerUnit)}); toast('Cena upravena') }
    else { addService({...form,pricePerUnit:parseInt(form.pricePerUnit),unitLabel:`za ${form.unit}`}); toast('Služba přidána') }
    setModalOpen(false)
  }

  const totalRevenue = services.length

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Ceník služeb</h2>
          <p className="text-sm text-muted-foreground">{services.length} služeb · automatické kalkulace v checklistu</p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Přidat</Button>
      </div>

      <div className="space-y-2">
        {services.map(s=>(
          <Card key={s.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">za {s.unit}</p>
              </div>
              <p className="font-bold text-lg sm:text-xl tracking-tight text-primary flex-shrink-0">{s.pricePerUnit} Kč<span className="text-xs text-muted-foreground font-normal">/{s.unit}</span></p>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button size="icon-sm" onClick={()=>openEdit(s)} className="touch-manipulation"><Edit2 size={12}/></Button>
                <Button variant="danger" size="icon-sm" onClick={()=>setDeleteId(s.id)} className="touch-manipulation"><Trash2 size={12}/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onClose={()=>setModalOpen(false)} title={editingId?'Upravit cenu':'Nová služba'}
        footer={<><Button onClick={()=>setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit</Button></>}>
        <FormField label="Název služby *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Sekání trávy"/></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cena (Kč) *"><Input type="number" value={form.pricePerUnit} onChange={e=>setForm(f=>({...f,pricePerUnit:e.target.value}))} placeholder="8"/></FormField>
          <FormField label="Jednotka *"><Input value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="m², ks, hod"/></FormField>
        </div>
      </Dialog>
      <ConfirmDialog open={!!deleteId} onClose={()=>setDeleteId(null)} onConfirm={()=>{deleteService(deleteId);toast('Odstraněno','warning')}} title="Smazat službu?" confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}

// ── Notifications ─────────────────────────────
export function Notifications() {
  const { clients, orders } = useApp()
  const [read, setRead] = useState([])
  const notifs = [
    { id:1, type:'reminder', message:'Zítra návštěva u Horáčkové (09:00)',              time:'2 hod',  badge:'reminder' },
    { id:2, type:'invoice',  message:'Faktura #2024018 po splatnosti — Kratochvílová',  time:'1 den',  badge:'danger' },
    { id:3, type:'weather',  message:'Déšť ve čtvrtek — 3 zakázky mohou být ovlivněny', time:'3 hod',  badge:'warning' },
    { id:4, type:'review',   message:'Dvořák zanechal hodnocení 5/5',                   time:'2 dny',  badge:'success' },
    { id:5, type:'reminder', message:'Hotel Galaxie — týdenní návštěva zítra',          time:'5 hod',  badge:'reminder' },
  ]
  const dotColor = { reminder:'bg-gray-400', invoice:'bg-destructive', weather:'bg-amber-500', review:'bg-green-500' }
  const seasons = [
    { label:'Jarní start',     desc:'Hnojení, vertikutace, první sečení', style:'bg-green-50 border-green-200' },
    { label:'Letní sečení',    desc:'Pravidelné sečení, závlaha',          style:'bg-yellow-50 border-yellow-200' },
    { label:'Podzimní úpravy', desc:'Listí, mulčování, příprava na zimu',  style:'bg-orange-50 border-orange-200' },
    { label:'Zimní péče',      desc:'Ochrana rostlin, plánování jara',     style:'bg-sky-50 border-sky-200' },
  ]

  const needsContact = clients.filter(c=>{
    if (c.status!=='active') return false
    const last = orders.filter(o=>o.clientId===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
    const days = last ? Math.floor((Date.now()-new Date(last.date))/86400000) : 999
    return days > 21
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Notifikace</h2>
            <Button size="sm" variant="ghost" onClick={()=>setRead(notifs.map(n=>n.id))}>Označit vše přečteno</Button>
          </div>
          <Card>
            {notifs.map(n=>(
              <div key={n.id} onClick={()=>setRead(r=>[...r,n.id])} className={cn('flex items-start gap-3 px-4 sm:px-5 py-4 border-b border-border last:border-0 cursor-pointer hover:bg-accent/30 transition-colors touch-manipulation', !read.includes(n.id)&&'bg-green-50/40')}>
                <span className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', dotColor[n.type])}/>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !read.includes(n.id)&&'font-medium')}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time} zpět</p>
                </div>
                {!read.includes(n.id)&&<span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"/>}
              </div>
            ))}
          </Card>

          {needsContact.length>0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Klienti bez kontaktu (21+ dní) — {needsContact.length}</h3>
              <div className="space-y-2">
                {needsContact.slice(0,5).map(c=>{
                  const last = orders.filter(o=>o.clientId===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
                  const days = last ? Math.floor((Date.now()-new Date(last.date))/86400000) : 999
                  return (
                    <Card key={c.id} className="border-amber-200">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">{c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-xs text-amber-600 font-medium">Naposledy: před {days} dny</p>
                        </div>
                        <Button variant="primary" size="sm" onClick={()=>toast(`📱 SMS odesláno na ${c.phone}`)} className="flex-shrink-0 gap-1"><Send size={12}/>SMS</Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Šablony zpráv</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {[['Připomenutí návštěvy','Den předem automaticky'],['Zakázka dokončena','Potvrzení + poděkování'],['Faktura k úhradě','Platební upomínka'],['Vlastní zpráva','Napsat vlastní text']].map(([t,d])=>(
                <button key={t} onClick={()=>toast(`Šablona "${t}" zkopírována`,'info')} className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-green-50 transition-all text-left touch-manipulation">
                  <div className="min-w-0"><p className="text-sm font-semibold truncate">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                  <ArrowRight size={14} className="text-muted-foreground flex-shrink-0"/>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sezónní kampaně</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-2">
              {seasons.map(s=>(
                <div key={s.label} className={cn('flex items-center gap-3 p-3 rounded-xl border', s.style)}>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                  <Button size="sm" onClick={()=>toast(`Kampaň "${s.label}" odeslána ${clients.filter(c=>c.status==='active').length} klientům`,'success')} className="flex-shrink-0">Rozeslat</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── Settings ──────────────────────────────────
export function Settings() {
  const { clients, orders, invoices, services, resetDemo } = useApp()
  const [tab, setTab] = useState('firma')
  const [showReset, setShowReset] = useState(false)
  const [biz, setBiz] = useState({ name:'ZahradaPro s.r.o.',owner:'Jan Novák',phone:'+420 602 123 456',email:'jan@zahradapro.cz',address:'Zahradní 12, Brno 602 00',ico:'12345678',dic:'CZ12345678',bank:'CZ65 0800 0000 1920 0014 5399' })
  const tabs = [{label:'Firma',value:'firma'},{label:'Notifikace',value:'notif'},{label:'Data & Statistiky',value:'data'}]
  const toggles = [
    ['Připomenutí den před zakázkou','SMS klientovi automaticky',true],
    ['Potvrzení dokončené zakázky','SMS po dokončení',true],
    ['Upomínka nezaplacené faktury','Email po 7 dnech po splatnosti',true],
    ['Sezónní kampaně','Automatické nabídky na začátku sezóny',false],
    ['Hodnocení po zakázce','Žádost o recenzi 24 hod po dokončení',false],
  ]

  function exportData() {
    const blob = new Blob([JSON.stringify({clients,orders,invoices,services,date:new Date().toISOString()},null,2)],{type:'application/json'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`zahradapro-backup-${new Date().toISOString().split('T')[0]}.json`; a.click()
    toast('Data exportována')
  }
  function exportCSV() {
    const rows = [['Číslo','Klient','Datum','Splatnost','Částka','Zaplaceno']]
    invoices.forEach(inv => { const c=clients.find(x=>x.id===inv.clientId); rows.push([inv.id,c?.name||'—',inv.date,inv.dueDate,inv.amount,inv.paid?'Ano':'Ne']) })
    const csv = rows.map(r=>r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`faktury-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    toast('CSV exportováno')
  }

  const totalRevenue = invoices.filter(i=>i.paid).reduce((s,i)=>s+i.amount,0)
  const avgOrderValue = orders.length ? Math.round(orders.reduce((s,o)=>s+o.totalPrice,0)/orders.length) : 0

  return (
    <div className="space-y-5 max-w-2xl">
      <div><h2 className="text-lg font-bold tracking-tight">Nastavení</h2><p className="text-sm text-muted-foreground">Firemní údaje, notifikace a správa dat</p></div>
      <PillTabs tabs={tabs} active={tab} onChange={setTab} className="w-full sm:w-auto"/>

      {tab==='firma' && (
        <Card>
          <CardHeader><CardTitle>Firemní informace</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Název firmy"><Input value={biz.name} onChange={e=>setBiz(b=>({...b,name:e.target.value}))}/></FormField>
              <FormField label="Jméno majitele"><Input value={biz.owner} onChange={e=>setBiz(b=>({...b,owner:e.target.value}))}/></FormField>
              <FormField label="Telefon"><Input value={biz.phone} onChange={e=>setBiz(b=>({...b,phone:e.target.value}))}/></FormField>
              <FormField label="Email"><Input type="email" value={biz.email} onChange={e=>setBiz(b=>({...b,email:e.target.value}))}/></FormField>
            </div>
            <FormField label="Adresa"><Input value={biz.address} onChange={e=>setBiz(b=>({...b,address:e.target.value}))}/></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="IČO"><Input value={biz.ico} onChange={e=>setBiz(b=>({...b,ico:e.target.value}))}/></FormField>
              <FormField label="DIČ"><Input value={biz.dic} onChange={e=>setBiz(b=>({...b,dic:e.target.value}))}/></FormField>
            </div>
            <FormField label="Číslo účtu (IBAN)"><Input value={biz.bank} onChange={e=>setBiz(b=>({...b,bank:e.target.value}))}/></FormField>
            <div className="flex justify-end"><Button variant="primary" onClick={()=>toast('Firemní údaje uloženy')}>Uložit změny</Button></div>
          </CardContent>
        </Card>
      )}

      {tab==='notif' && (
        <Card>
          <CardHeader><CardTitle>SMS & Email notifikace</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {toggles.map(([t,d,def])=>(
              <div key={t} className="flex items-center justify-between py-4 gap-4">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                <label className="relative w-10 h-[22px] flex-shrink-0 cursor-pointer touch-manipulation">
                  <input type="checkbox" defaultChecked={def} className="sr-only peer" onChange={()=>toast('Nastavení uloženo')}/>
                  <div className="absolute inset-0 rounded-full bg-gray-200 peer-checked:bg-primary transition-colors"/>
                  <div className="absolute w-4 h-4 bg-white rounded-full top-[3px] left-[3px] shadow-sm transition-transform peer-checked:translate-x-[18px]"/>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab==='data' && (
        <div className="space-y-4">
          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Klientů',clients.length],['Zakázek',orders.length],['Faktur',invoices.length],['Tržby',formatCurrency(totalRevenue)]].map(([l,v])=>(
              <Card key={l}><CardContent className="p-4 text-center"><p className="text-xl sm:text-2xl font-bold tracking-tight">{v}</p><p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{l}</p></CardContent></Card>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold tracking-tight">{formatCurrency(avgOrderValue)}</p><p className="text-xs text-muted-foreground mt-1">Průměrná zakázka</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold tracking-tight">{clients.filter(c=>c.status==='active').length}</p><p className="text-xs text-muted-foreground mt-1">Aktivních klientů</p></CardContent></Card>
          </div>

          {/* Export */}
          <Card>
            <CardHeader><CardTitle>Export & záloha</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[['Export dat (JSON)','Záloha všech dat',exportData],['Export faktur (CSV)','Pro POHODA, Money S3, účetní',exportCSV]].map(([t,d,fn])=>(
                <div key={t} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl gap-3">
                  <div className="min-w-0"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                  <Button size="sm" onClick={fn} className="flex-shrink-0">Export</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Demo & Danger */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader><CardTitle>Demo data</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-amber-200 gap-3">
                <div className="min-w-0"><p className="text-sm font-semibold">Obnovit demo data</p><p className="text-xs text-muted-foreground">Vrátit vše do původního stavu</p></div>
                <Button size="sm" onClick={()=>setShowReset(true)} className="flex-shrink-0 gap-1"><RotateCcw size={12}/>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-red-50/30">
            <CardHeader><CardTitle className="text-destructive">Nebezpečná zóna</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-red-200 gap-3">
                <div className="min-w-0"><p className="text-sm font-semibold text-destructive">Smazat všechna data</p><p className="text-xs text-muted-foreground">Nelze vrátit zpět</p></div>
                <Button variant="danger" size="sm" onClick={()=>{if(confirm('Opravdu smazat vše?')){['zp3_clients','zp3_orders','zp3_invoices','zp3_services'].forEach(k=>localStorage.removeItem(k));toast('Data smazána','warning');setTimeout(()=>window.location.reload(),1000)}}} className="flex-shrink-0">Smazat</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog open={showReset} onClose={()=>setShowReset(false)} onConfirm={()=>{resetDemo();toast('Demo data obnovena')}} title="Obnovit demo data?" description="Všechny vaše změny budou ztraceny." confirmLabel="Obnovit" variant="primary"/>
    </div>
  )
}
