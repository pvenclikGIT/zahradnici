import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, daysSince } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, EmptyState, Dialog, FormField, Input, Select, ConfirmDialog, toast, PillTabs, DarkModeToggle } from '../components/ui'
import { ChevronLeft, ChevronRight, Plus, ArrowRight, Edit2, Trash2, MapPin, Send, RotateCcw, AlertCircle, CheckCircle, Cloud, Star, PhoneMissed, Calendar as CalIcon, Bell, BellOff, X, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { SwipeCard } from '../components/SwipeCard'
import { cn } from '../lib/utils'

// ── Pricelist ─────────────────────────────────
export function Pricelist() {
  const { services, updateService, addService, deleteService } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({ name:'', pricePerUnit:'', unit:'' })

  function openEdit(s) { setEditingId(s.id); setForm({ name:s.name, pricePerUnit:String(s.pricePerUnit), unit:s.unit }); setModalOpen(true) }
  function openNew()   { setEditingId(null);  setForm({ name:'', pricePerUnit:'', unit:'' }); setModalOpen(true) }
  function handleSave() {
    if (!form.name || !form.pricePerUnit || !form.unit) { toast('Vyplňte všechna pole', 'error'); return }
    if (editingId) {
      updateService({ ...services.find(s => s.id === editingId), ...form, pricePerUnit: parseInt(form.pricePerUnit) })
      toast('Cena upravena')
    } else {
      addService({ ...form, pricePerUnit: parseInt(form.pricePerUnit), unitLabel: `za ${form.unit}` })
      toast('Služba přidána')
    }
    setModalOpen(false)
  }

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
        {services.map(s => (
          <Card key={s.id}>
            <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">za {s.unit}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-base sm:text-lg tracking-tight text-primary">{s.pricePerUnit} Kč</p>
                <p className="text-[10px] text-muted-foreground">/ {s.unit}</p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button size="icon-sm" onClick={() => openEdit(s)} className="touch-manipulation"><Edit2 size={12}/></Button>
                <Button variant="danger" size="icon-sm" onClick={() => setDeleteId(s.id)} className="touch-manipulation"><Trash2 size={12}/></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit cenu' : 'Nová služba'}
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit</Button></>}>
        <FormField label="Název služby *"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sekání trávy"/></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cena (Kč) *"><Input type="number" value={form.pricePerUnit} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} placeholder="8"/></FormField>
          <FormField label="Jednotka *"><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="m², ks, hod"/></FormField>
        </div>
      </Dialog>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteService(deleteId); toast('Odstraněno', 'warning') }}
        title="Smazat službu?" confirmLabel="Smazat" variant="danger"/>

      {/* Packages */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold tracking-tight">Cenové balíčky</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Kombinace služeb za paušální cenu</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name:'Základní péče',  price:1200, desc:'Sekání + doprava', services:['Sekání trávy','Doprava'], color:'bg-green-50 border-green-200' },
            { name:'Kompletní péče', price:2800, desc:'Sekání, keře, odvoz, doprava', services:['Sekání trávy','Stříhání keřů','Odvoz odpadu','Doprava'], color:'bg-blue-50 border-blue-200' },
            { name:'Jarní revival',  price:3500, desc:'Vertikutace, hnojení, sekání', services:['Sekání trávy','Vertikutace','Hnojení trávníku','Doprava'], color:'bg-yellow-50 border-yellow-200' },
            { name:'VIP péče',       price:5500, desc:'Vše včetně: sekání, keře, plot, hnojení, odvoz', services:['Sekání trávy','Stříhání keřů','Stříhání živého plotu','Hnojení trávníku','Odvoz odpadu','Doprava'], color:'bg-purple-50 border-purple-200' },
          ].map(pkg => (
            <div key={pkg.name} className={cn('rounded-xl border p-4', pkg.color)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pkg.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pkg.services.map(s => <span key={s} className="text-[10px] bg-white/80 border border-white px-1.5 py-0.5 rounded-full font-medium">{s}</span>)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg tracking-tight">{formatCurrency(pkg.price)}</p>
                  <p className="text-[10px] text-muted-foreground">paušál</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Notifications ─────────────────────────────
const notifIcons = {
  overdue:   AlertCircle,
  reminder:  Bell,
  weather:   Cloud,
  payment:   CheckCircle,
  nocontact: PhoneMissed,
  review:    Star,
}
const notifColors = {
  overdue:   'text-destructive bg-red-50',
  reminder:  'text-blue-600 bg-blue-50',
  weather:   'text-amber-600 bg-amber-50',
  payment:   'text-green-600 bg-green-50',
  nocontact: 'text-orange-600 bg-orange-50',
  review:    'text-yellow-600 bg-yellow-50',
}
const notifLabels = {
  overdue:'Po splatnosti', reminder:'Připomenutí', weather:'Počasí',
  payment:'Platba', nocontact:'Bez kontaktu', review:'Hodnocení',
}

export function Notifications() {
  const { clients, orders, notifications, markNotifRead, markAllNotifsRead, unreadCount } = useApp()

  const unread = notifications.filter(n => !n.read)
  const read   = notifications.filter(n => n.read)

  const needsContact = clients.filter(c => {
    if (c.status !== 'active') return false
    const last = orders.filter(o => o.clientId === c.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    return daysSince(last?.date) > 21
  })

  const seasons = [
    { label:'Jarní start',     desc:'Hnojení, vertikutace, první sečení', style:'bg-green-50 border-green-200'  },
    { label:'Letní sečení',    desc:'Pravidelné sečení, závlaha',          style:'bg-yellow-50 border-yellow-200'},
    { label:'Podzimní úpravy', desc:'Listí, mulčování, příprava na zimu',  style:'bg-orange-50 border-orange-200'},
    { label:'Zimní péče',      desc:'Ochrana rostlin, plánování jara',     style:'bg-sky-50 border-sky-200'      },
  ]

  function NotifItem({ n }) {
    const Icon = notifIcons[n.type] || Bell
    const color = notifColors[n.type] || 'text-gray-500 bg-gray-50'
    const time = new Date(n.time)
    const timeStr = time.toLocaleTimeString('cs-CZ', { hour:'2-digit', minute:'2-digit' })
    const dateStr = time.toLocaleDateString('cs-CZ', { day:'2-digit', month:'2-digit' })
    return (
      <SwipeCard
        onSwipeLeft={() => markNotifRead(n.id)}
        leftLabel="Přečteno" leftColor="bg-green-500"
        leftIcon={<CheckCircle size={14}/>}
      >
      <div onClick={() => markNotifRead(n.id)}
        className={cn('flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 cursor-pointer hover:bg-accent/30 transition-colors touch-manipulation', !n.read && 'bg-blue-50/30')}>
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', color)}>
          <Icon size={14} strokeWidth={2}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-snug', !n.read && 'font-medium')}>{n.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">{notifLabels[n.type]}</span>
            <span className="text-[10px] text-muted-foreground">{dateStr} {timeStr}</span>
          </div>
        </div>
        {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"/>}
      </div>
      </SwipeCard>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

        {/* Left — notifications */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Notifikace</h2>
              {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} nepřečtených</p>}
            </div>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllNotifsRead} className="gap-1.5">
                <BellOff size={13}/>Označit vše přečteno
              </Button>
            )}
          </div>

          {unread.length > 0 && (
            <Card>
              <div className="px-4 py-2.5 border-b border-border bg-blue-50/50">
                <p className="text-xs font-semibold text-blue-700">Nepřečtené — {unread.length}</p>
              </div>
              {unread.map(n => <NotifItem key={n.id} n={n}/>)}
            </Card>
          )}

          {read.length > 0 && (
            <Card>
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground">Přečtené</p>
              </div>
              {read.map(n => <NotifItem key={n.id} n={n}/>)}
            </Card>
          )}

          {/* No contact clients */}
          {needsContact.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Klienti bez kontaktu 21+ dní</h3>
                <span className="text-xs text-muted-foreground">{needsContact.length} klientů</span>
              </div>
              <div className="space-y-2">
                {needsContact.slice(0, 5).map(c => {
                  const last = orders.filter(o => o.clientId === c.id).sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                  const days = daysSince(last?.date)
                  return (
                    <Card key={c.id} className="border-amber-200">
                      <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{c.name}</p>
                          <p className="text-xs text-amber-600 font-medium">
                            {last ? `Naposledy před ${days} dny` : 'Zatím žádná zakázka'} · {c.city}
                          </p>
                        </div>
                        <Button variant="primary" size="sm" onClick={() => toast(`SMS odesláno na ${c.phone}`)} className="flex-shrink-0 gap-1">
                          <Send size={12}/>SMS
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Šablony zpráv</CardTitle></CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-2">
              {[
                ['Připomenutí návštěvy', 'Den předem automaticky'],
                ['Zakázka dokončena',    'Potvrzení a poděkování'],
                ['Faktura k úhradě',     'Platební upomínka'],
                ['Vlastní zpráva',       'Napsat vlastní text'],
              ].map(([t, d]) => (
                <button key={t} onClick={() => toast(`Šablona "${t}" zkopírována`, 'info')}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-green-50 transition-all text-left touch-manipulation active:scale-[0.98]">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground flex-shrink-0"/>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Sezónní kampaně</CardTitle></CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-2">
              {seasons.map(s => (
                <div key={s.label} className={cn('flex items-center gap-3 p-3 rounded-xl border', s.style)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Button size="sm" onClick={() => toast(`Kampaň odeslána ${clients.filter(c => c.status === 'active').length} klientům`, 'success')} className="flex-shrink-0">
                    Rozeslat
                  </Button>
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
  const { currentUser, can } = useAuth()
  const [tab, setTab] = useState('firma')
  const [showReset, setShowReset] = useState(false)
  const [biz, setBiz] = useState({
    name:'ZahradaPro s.r.o.', owner:'Jan Novák',
    phone:'+420 602 123 456', email:'jan@zahradapro.cz',
    address:'Průmyslová 12, Praha-Horní Počernice',
    ico:'12345678', dic:'CZ12345678', bank:'CZ65 0800 0000 1920 0014 5399',
  })
  const tabs = [{ label:'Firma', value:'firma' },{ label:'Notifikace', value:'notif' },{ label:'Data', value:'data' }]
  const toggles = [
    ['Připomenutí den před zakázkou', 'SMS klientovi automaticky', true],
    ['Potvrzení dokončené zakázky',   'SMS po dokončení', true],
    ['Upomínka nezaplacené faktury',  'Email po 7 dnech po splatnosti', true],
    ['Sezónní kampaně',               'Automatické nabídky na začátku sezóny', false],
    ['Hodnocení po zakázce',          'Žádost o recenzi 24 hod po dokončení', false],
  ]

  function exportData() {
    const blob = new Blob([JSON.stringify({ clients, orders, invoices, services, date: new Date().toISOString() }, null, 2)], { type:'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `zahradapro-backup-${new Date().toISOString().split('T')[0]}.json`; a.click()
    toast('Data exportována')
  }
  function exportCSV() {
    const rows = [['Číslo','Klient','Datum','Splatnost','Částka','Zaplaceno']]
    invoices.forEach(inv => {
      const c = clients.find(x => x.id === inv.clientId)
      rows.push([inv.id, c?.name || '—', inv.date, inv.dueDate, inv.amount, inv.paid ? 'Ano' : 'Ne'])
    })
    const blob = new Blob(['\uFEFF' + rows.map(r => r.join(';')).join('\n')], { type:'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `faktury-${new Date().toISOString().split('T')[0]}.csv`; a.click()
    toast('CSV exportováno')
  }

  const totalRevenue = invoices.filter(i => i.paid).reduce((s, i) => s + i.amount, 0)
  const avgOrder = orders.length ? Math.round(orders.reduce((s, o) => s + o.totalPrice, 0) / orders.length) : 0

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Nastavení</h2>
        <p className="text-sm text-muted-foreground">Firemní údaje, notifikace a správa dat</p>
      </div>
      <PillTabs tabs={tabs} active={tab} onChange={setTab} className="w-full sm:w-auto"/>

      {tab === 'firma' && (
        <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Firemní informace</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Název firmy"><Input value={biz.name} onChange={e => setBiz(b => ({ ...b, name: e.target.value }))}/></FormField>
              <FormField label="Jméno majitele"><Input value={biz.owner} onChange={e => setBiz(b => ({ ...b, owner: e.target.value }))}/></FormField>
              <FormField label="Telefon"><Input value={biz.phone} onChange={e => setBiz(b => ({ ...b, phone: e.target.value }))}/></FormField>
              <FormField label="Email"><Input type="email" value={biz.email} onChange={e => setBiz(b => ({ ...b, email: e.target.value }))}/></FormField>
            </div>
            <FormField label="Adresa"><Input value={biz.address} onChange={e => setBiz(b => ({ ...b, address: e.target.value }))}/></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="IČO"><Input value={biz.ico} onChange={e => setBiz(b => ({ ...b, ico: e.target.value }))}/></FormField>
              <FormField label="DIČ"><Input value={biz.dic} onChange={e => setBiz(b => ({ ...b, dic: e.target.value }))}/></FormField>
            </div>
            <FormField label="Číslo účtu (IBAN)"><Input value={biz.bank} onChange={e => setBiz(b => ({ ...b, bank: e.target.value }))}/></FormField>
            <div className="flex justify-end"><Button variant="primary" onClick={() => toast('Firemní údaje uloženy')}>Uložit změny</Button></div>
          </CardContent>
        </Card>

        {/* Profiles quick link */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">Profily a přístupy</p>
              <p className="text-xs text-muted-foreground">Správa uživatelů, PIN a oprávnění</p>
            </div>
            <Link to="/profiles"><Button size="sm" className="gap-1 flex-shrink-0"><Users size={13}/>Spravovat</Button></Link>
          </CardContent>
        </Card>
        </div>
      )}

      {tab === 'notif' && (
        <Card>
          <CardHeader><CardTitle>SMS a Email notifikace</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {toggles.map(([t, d, def]) => (
              <div key={t} className="flex items-center justify-between py-4 gap-4">
                <div className="flex-1 min-w-0"><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                <label className="relative w-10 h-[22px] flex-shrink-0 cursor-pointer touch-manipulation">
                  <input type="checkbox" defaultChecked={def} className="sr-only peer" onChange={() => toast('Nastavení uloženo')}/>
                  <div className="absolute inset-0 rounded-full bg-gray-200 peer-checked:bg-primary transition-colors"/>
                  <div className="absolute w-4 h-4 bg-white rounded-full top-[3px] left-[3px] shadow-sm transition-transform peer-checked:translate-x-[18px]"/>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'data' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[['Klientů', clients.length], ['Zakázek', orders.length], ['Faktur', invoices.length], ['Tržby', formatCurrency(totalRevenue)]].map(([l, v]) => (
              <Card key={l}><CardContent className="p-4 text-center"><p className="text-xl font-bold tracking-tight">{v}</p><p className="text-xs text-muted-foreground mt-1">{l}</p></CardContent></Card>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold">{formatCurrency(avgOrder)}</p><p className="text-xs text-muted-foreground mt-1">Průměrná zakázka</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold">{clients.filter(c => c.status === 'active').length}</p><p className="text-xs text-muted-foreground mt-1">Aktivních klientů</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Export a záloha</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                ['Export dat (JSON)', 'Záloha všech dat', exportData],
                ['Export faktur (CSV)', 'Pro POHODA, Money S3, účetní', exportCSV],
              ].map(([t, d, fn]) => (
                <div key={t} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl gap-3">
                  <div className="min-w-0"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
                  <Button size="sm" onClick={fn} className="flex-shrink-0">Export</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader><CardTitle>Demo data</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-amber-200 gap-3">
                <div><p className="text-sm font-semibold">Obnovit demo data</p><p className="text-xs text-muted-foreground">Vrátit vše do původního stavu</p></div>
                <Button size="sm" onClick={() => setShowReset(true)} className="flex-shrink-0 gap-1"><RotateCcw size={12}/>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-red-50/20">
            <CardHeader><CardTitle className="text-destructive">Nebezpečná zóna</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-red-200 gap-3">
                <div><p className="text-sm font-semibold text-destructive">Smazat všechna data</p><p className="text-xs text-muted-foreground">Nelze vrátit zpět</p></div>
                <Button variant="danger" size="sm" onClick={() => {
                  if (confirm('Opravdu smazat vše?')) {
                    ['zp3_clients','zp3_orders','zp3_invoices','zp3_services','zp3_notifs'].forEach(k => localStorage.removeItem(k))
                    toast('Data smazána', 'warning')
                    setTimeout(() => window.location.reload(), 1000)
                  }
                }} className="flex-shrink-0">Smazat</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmDialog open={showReset} onClose={() => setShowReset(false)}
        onConfirm={() => { resetDemo(); toast('Demo data obnovena') }}
        title="Obnovit demo data?" description="Všechny vaše změny budou ztraceny."
        confirmLabel="Obnovit" variant="primary"/>
    </div>
  )
}
