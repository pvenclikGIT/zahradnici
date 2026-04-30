import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, formatDateShort, getInitials, TAG_STYLES, daysSince } from '../data'
import { Card, CardContent, Button, Input, Select, StatusBadge, TagBadge, Avatar, EmptyState, Dialog, FormField, Textarea, toast, ConfirmDialog } from '../components/ui'
import { Plus, Search, Phone, Mail, MapPin, AlertTriangle, X, Edit2, Trash2, Users, Map, Clock, ExternalLink } from 'lucide-react'
import { ClientMap } from '../components/ClientMap'
import { cn } from '../lib/utils'

const emptyForm = { name:'', phone:'', email:'', address:'', gardenSize:'střední', tag:'pravidelný', notes:'', status:'active' }

export default function Clients() {
  const { clients, orders, addClient, updateClient, deleteClient } = useApp()
  const [q, setQ] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [detailId, setDetailId] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [firstOrderOffer, setFirstOrderOffer] = useState(null)

  const filtered = clients.filter(c => {
    const mq = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.address.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
    const mt = !filterTag || c.tags.includes(filterTag)
    const ms = !filterStatus || c.status === filterStatus
    return mq && mt && ms
  })

  const detailClient = clients.find(c => c.id === detailId)
  const clientOrders = id => orders.filter(o => o.clientId === id)

  function openNew() {
    setEditingId(null); setForm(emptyForm); setModalOpen(true)
  }
  function openEdit(c) {
    setEditingId(c.id)
    setForm({ name:c.name, phone:c.phone, email:c.email||'', address:c.address, gardenSize:c.gardenSize||'střední', tag:c.tags[0]||'pravidelný', notes:c.notes||'', status:c.status })
    setDetailId(null); setModalOpen(true)
  }
  function handleSave() {
    if (!form.name||!form.phone||!form.address) { toast('Vyplňte povinná pole','error'); return }
    const data = { ...form, tags:[form.tag], joinDate: new Date().toISOString().split('T')[0] }
    if (editingId) { updateClient({ ...data, id:editingId }); toast('Klient upraven') }
    else { addClient(data); setFirstOrderOffer({ name:form.name, tag:form.tag }); toast('Klient přidán') }
    setModalOpen(false)
  }

  if (location.search.includes('new=1') && !modalOpen) {
    // openNew() — handled via useEffect would cause infinite loop, skip
  }

  return (
    <div className="space-y-4">
      {showMap && <ClientMap onClose={() => setShowMap(false)}/>}

      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Hledat klienta, adresu…" className="pl-8"/>
        </div>
        <div className="flex gap-2">
        <Select value={filterTag} onChange={e=>setFilterTag(e.target.value)} className="flex-1">
          <option value="">Všechny typy</option>
          <option value="pravidelný">Pravidelný</option>
          <option value="vip">VIP</option>
          <option value="firemní">Firemní</option>
          <option value="jednorázový">Jednorázový</option>
          <option value="nový">Nový</option>
        </Select>
        <Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="flex-1">
          <option value="">Všichni</option>
          <option value="active">Aktivní</option>
          <option value="inactive">Neaktivní</option>
        </Select>
        </div>
        <div className="flex gap-2">
        <Button size="sm" onClick={() => setShowMap(true)} className="flex-1 sm:flex-none gap-1.5"><Map size={13}/>Mapa</Button>
        <Button variant="primary" size="sm" onClick={openNew} className="flex-1 sm:flex-none"><Plus size={14}/>Nový klient</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length===1?'klient':'klientů'}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Žádní klienti nenalezeni" description="Zkuste jiný filtr nebo přidejte nového klienta."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Přidat klienta</Button>}/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(c => {
            const co = clientOrders(c.id)
            const rev = co.filter(o=>o.paid).reduce((s,o)=>s+o.totalPrice,0)
            const last = co.sort((a,b)=>new Date(b.date)-new Date(a.date))[0]
            const days = daysSince(last?.date)
            const needsContact = days > 21 && c.status === 'active'
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all" onClick={() => setDetailId(c.id)}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={c.name} size="lg"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold tracking-tight truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate"><MapPin size={10}/>{c.city||c.address}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <StatusBadge status={c.status}/>
                        {c.tags.map(t => <TagBadge key={t} tag={t}/>)}
                        {needsContact && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={9}/>{days}d</span>}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border mb-3">
                    {[['Zakázek',co.length],['Celkem',rev>0?formatCurrency(rev):'—'],['Naposledy',last?formatDateShort(last.date):'—']].map(([l,v])=>(
                      <div key={l} className="text-center">
                        <p className="font-bold tracking-tight text-sm">{v}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
                    <a href={`tel:${c.phone}`} className="flex-1"><Button size="sm" className="w-full gap-1"><Phone size={12}/>Volat</Button></a>
                    <Button size="icon-sm" onClick={() => openEdit(c)}><Edit2 size={12}/></Button>
                    <Link to={`/orders?client=${c.id}&new=1`} className="flex-1"><Button variant="primary" size="sm" className="w-full gap-1"><Plus size={12}/>Zakázka</Button></Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Panel */}
      {detailClient && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-stretch sm:justify-end" onClick={() => setDetailId(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
          <div onClick={e => e.stopPropagation()} className="relative w-full sm:max-w-[420px] bg-white border-border shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none sm:border-l" style={{maxHeight:'calc(100dvh - 16px)', height:'100%'}}>
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
            <div className="bg-white flex items-center justify-between px-5 py-3 sm:py-4 border-b border-border flex-shrink-0">
              <p className="text-sm font-semibold">Detail klienta</p>
              <button onClick={() => setDetailId(null)} className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent touch-manipulation"><X size={14}/></button>
            </div>
            <div className="overflow-y-auto overscroll-contain flex-1" style={{WebkitOverflowScrolling:'touch'}}>
            <div className="px-5 py-5 border-b border-border">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={detailClient.name} size="xl"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold tracking-tight">{detailClient.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate"><MapPin size={10}/>{detailClient.address}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <StatusBadge status={detailClient.status}/>
                    {detailClient.tags.map(t => <TagBadge key={t} tag={t}/>)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const co = clientOrders(detailClient.id)
                  const rev = co.filter(o=>o.paid).reduce((s,o)=>s+o.totalPrice,0)
                  return [['Zakázek',co.length],['Celkem',rev>0?formatCurrency(rev):'—'],['Zahrada',detailClient.gardenSize||'—']]
                })().map(([l,v]) => (
                  <div key={l} className="bg-muted rounded-xl py-3 text-center">
                    <p className="font-bold tracking-tight">{v}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pt-4 flex gap-2">
              <a href={`tel:${detailClient.phone}`} className="flex-1"><Button size="sm" className="w-full gap-1"><Phone size={12}/>Volat</Button></a>
              <a href={`mailto:${detailClient.email}`} className="flex-1"><Button size="sm" className="w-full gap-1"><Mail size={12}/>Email</Button></a>
              <Link to={`/orders?client=${detailClient.id}&new=1`} className="flex-1"><Button variant="primary" size="sm" className="w-full gap-1"><Plus size={12}/>Zakázka</Button></Link>
            </div>
            <div className="px-5 py-4 space-y-4 flex-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Kontakt</p>
                {[['Telefon',detailClient.phone,Phone],['Email',detailClient.email||'—',Mail],['Adresa',detailClient.address,MapPin],['Klient od',formatDate(detailClient.joinDate)]].map(([l,v,Icon]) => (
                  <div key={l} className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
                    {Icon && <Icon size={13} className="text-muted-foreground mt-0.5 flex-shrink-0"/>}
                    <div><p className="text-xs text-muted-foreground">{l}</p><p className="text-sm font-medium">{v}</p></div>
                  </div>
                ))}
              </div>
              {detailClient.notes && (
                <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0"/>
                  <p className="text-sm text-amber-900 leading-snug">{detailClient.notes}</p>
                </div>
              )}
              {/* Timeline */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Historie zakázek</p>
                {clientOrders(detailClient.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Žádné zakázky</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-border"/>
                    {clientOrders(detailClient.id).sort((a,b)=>new Date(b.date)-new Date(a.date)).map(o => (
                      <div key={o.id} className="flex items-start gap-4 pb-4 pl-4 relative">
                        <div className={cn('absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white flex-shrink-0',
                          o.status==='completed'?'bg-green-500':'bg-blue-400'
                        )}/>
                        <div className="flex-1 min-w-0 ml-2">
                          <p className="text-sm font-medium truncate">{o.services.slice(0,2).join(', ')}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                        </div>
                        <p className={cn('text-sm font-bold flex-shrink-0', o.paid?'text-primary':'text-amber-600')}>{formatCurrency(o.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

              {/* Photo Gallery */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Fotogalerie</p>
                {clientOrders(detailClient.id).filter(o=>o.photos&&o.photos.length>0).length===0 ? (
                  <div className="border-2 border-dashed border-border rounded-xl py-6 text-center">
                    <p className="text-xs text-muted-foreground">Zatím žádné fotky</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">Fotky se přidají při checklistu zakázky</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {clientOrders(detailClient.id).flatMap(o=>o.photos||[]).slice(0,9).map((p,i)=>(
                      <div key={i} className="aspect-square rounded-xl bg-green-50 border border-green-100 flex flex-col items-center justify-center text-center p-1">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mb-1">
                          <span className="text-[10px]">{p.type==='before'?'P':'A'}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground">{p.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seasonal Plan */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Sezónní plán</p>
                <div className="space-y-2">
                  {[
                    { season:'Jaro (3–5)',  services:['Vertikutace','Hnojení trávníku','Sekání trávy'], color:'bg-green-50 border-green-200 text-green-700' },
                    { season:'Léto (6–8)',  services:['Sekání trávy','Zálivka','Stříhání keřů'],        color:'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { season:'Podzim (9–11)',services:['Shrabání listí','Mulčování','Odvoz odpadu'],    color:'bg-orange-50 border-orange-200 text-orange-700' },
                    { season:'Zima (12–2)', services:['Řez stromů','Plánování roku'],                   color:'bg-sky-50 border-sky-200 text-sky-700' },
                  ].map(({ season, services: svcs, color }) => (
                    <div key={season} className={cn('p-3 rounded-xl border text-xs', color)}>
                      <p className="font-bold mb-1">{season}</p>
                      <p className="opacity-80">{svcs.join(' · ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 sm:py-4 border-t border-border flex gap-2 flex-wrap flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
              <Button size="sm" onClick={() => openEdit(detailClient)} className="gap-1"><Edit2 size={12}/>Upravit</Button>
              <Link to={`/portal/${detailClient.id}`} target="_blank"><Button size="sm" className="gap-1"><ExternalLink size={12}/>Portál klienta</Button></Link>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(detailClient.id)} className="gap-1"><Trash2 size={12}/>Odstranit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId?'Upravit klienta':'Nový klient'}
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit klienta</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Jméno a příjmení *"><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Marie Horáčková"/></FormField>
          <FormField label="Telefon *"><Input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+420 601 234 567"/></FormField>
        </div>
        <FormField label="Email"><Input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="klient@email.cz"/></FormField>
        <FormField label="Adresa zahrady *"><Input value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="Ke Křížku 14, Praha-Šeberov"/></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Velikost zahrady">
            <Select value={form.gardenSize} onChange={e=>setForm(f=>({...f,gardenSize:e.target.value}))}>
              <option value="malá">Malá (do 200 m²)</option>
              <option value="střední">Střední (200–500 m²)</option>
              <option value="velká">Velká (500+ m²)</option>
            </Select>
          </FormField>
          <FormField label="Typ klienta">
            <Select value={form.tag} onChange={e=>setForm(f=>({...f,tag:e.target.value}))}>
              <option value="pravidelný">Pravidelný</option>
              <option value="jednorázový">Jednorázový</option>
              <option value="firemní">Firemní</option>
              <option value="vip">VIP</option>
              <option value="nový">Nový</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Poznámky (pes, kód branky, požadavky…)">
          <Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Pozor — velký pes Rexe. Kód od branky: 4521."/>
        </FormField>
      </Dialog>


      {/* First order offer */}
      {firstOrderOffer && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setFirstOrderOffer(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
          <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-sm sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5 sm:p-6" style={{paddingBottom:'max(20px, env(safe-area-inset-bottom))'}}>
            <div className="sm:hidden flex justify-center -mt-2 mb-3"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
            <h3 className="font-bold text-base mb-2">Vytvořit první zakázku?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Klient <span className="font-semibold text-foreground">{firstOrderOffer.name}</span> byl přidán. Chcete rovnou vytvořit první zakázku?
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setFirstOrderOffer(null)}>Později</Button>
              <Link to="/orders?new=1" className="flex-1" onClick={() => setFirstOrderOffer(null)}>
                <Button variant="primary" className="w-full gap-1"><Plus size={14}/>Vytvořit zakázku</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteClient(deleteId); setDetailId(null); toast('Klient odstraněn','warning') }}
        title="Odstranit klienta?" description="Tato akce je nevratná." confirmLabel="Odstranit" variant="danger"/>
    </div>
  )
}
