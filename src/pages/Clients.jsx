import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate, formatDateShort, getInitials, TAG_STYLES } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatusBadge, TagBadge,
  Avatar, EmptyState, Dialog, FormField, Textarea, toast
} from '../components/ui'
import { Plus, Search, Phone, Mail, MapPin, AlertTriangle, X, Edit2, Trash2, Users } from 'lucide-react'
import { cn } from '../lib/utils'

const emptyForm = { name: '', phone: '', email: '', address: '', gardenSize: 'střední', tag: 'pravidelný', notes: '', status: 'active' }

export default function Clients() {
  const { clients, orders, addClient, updateClient, deleteClient } = useApp()
  const [q, setQ] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [detailId, setDetailId] = useState(null)

  const filtered = clients.filter(c => {
    const mq = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.address.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
    const mt = !filterTag || c.tags.includes(filterTag)
    const ms = !filterStatus || c.status === filterStatus
    return mq && mt && ms
  })

  const detailClient = clients.find(c => c.id === detailId)
  const clientOrders = id => orders.filter(o => o.clientId === id)

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  function openEdit(c) {
    setEditingId(c.id)
    setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address, gardenSize: c.gardenSize || 'střední', tag: c.tags[0] || 'pravidelný', notes: c.notes || '', status: c.status })
    setDetailId(null)
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.name || !form.phone || !form.address) { toast('Vyplňte povinná pole', 'error'); return }
    const data = { ...form, tags: [form.tag], joinDate: new Date().toISOString().split('T')[0] }
    if (editingId) { updateClient({ ...data, id: editingId }); toast('Klient upraven') }
    else           { addClient(data); toast('Klient přidán') }
    setModalOpen(false)
  }
  function handleDelete(id) {
    if (!confirm('Opravdu odstranit klienta?')) return
    deleteClient(id); setDetailId(null); toast('Klient odstraněn', 'warning')
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat klienta, adresu…" className="pl-8" />
        </div>
        <Select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="w-40">
          <option value="">Všechny typy</option>
          <option value="pravidelný">Pravidelný</option>
          <option value="vip">VIP</option>
          <option value="firemní">Firemní</option>
          <option value="jednorázový">Jednorázový</option>
          <option value="nový">Nový</option>
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-36">
          <option value="">Všichni</option>
          <option value="active">Aktivní</option>
          <option value="inactive">Neaktivní</option>
        </Select>
        <Button variant="primary" size="sm" onClick={openNew}><Plus size={14} />Nový klient</Button>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'klient' : 'klientů'}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Žádní klienti nenalezeni" description="Zkuste jiný filtr nebo přidejte nového klienta."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14} />Přidat klienta</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => {
            const co = clientOrders(c.id)
            const rev = co.filter(o => o.paid).reduce((s, o) => s + o.totalPrice, 0)
            const last = co.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all" onClick={() => setDetailId(c.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar name={c.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold tracking-tight truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} />{c.address}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <StatusBadge status={c.status} />
                        {c.tags.map(t => <TagBadge key={t} tag={t} />)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border mb-3">
                    {[['Zakázek', co.length], ['Celkem', rev > 0 ? formatCurrency(rev) : '—'], ['Naposledy', last ? formatDateShort(last.date) : '—']].map(([l, v]) => (
                      <div key={l} className="text-center">
                        <p className="font-bold tracking-tight text-sm">{v}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <a href={`tel:${c.phone}`} className="flex-1"><Button size="sm" className="w-full gap-1"><Phone size={12} />Volat</Button></a>
                    <Button size="icon-sm" onClick={() => openEdit(c)}><Edit2 size={12} /></Button>
                    <Link to={`/orders?client=${c.id}&new=1`} className="flex-1"><Button variant="primary" size="sm" className="w-full gap-1"><Plus size={12} />Zakázka</Button></Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Panel */}
      {detailClient && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setDetailId(null)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white border-l border-border shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Detail klienta</p>
              <button onClick={() => setDetailId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent"><X size={14} /></button>
            </div>
            {/* Hero */}
            <div className="px-5 py-6 border-b border-border">
              <div className="flex items-start gap-4 mb-5">
                <Avatar name={detailClient.name} size="xl" />
                <div>
                  <p className="text-xl font-bold tracking-tight">{detailClient.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={10} />{detailClient.address}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <StatusBadge status={detailClient.status} />
                    {detailClient.tags.map(t => <TagBadge key={t} tag={t} />)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const co = clientOrders(detailClient.id)
                  const rev = co.filter(o => o.paid).reduce((s, o) => s + o.totalPrice, 0)
                  return [['Zakázek', co.length], ['Celkem', rev > 0 ? formatCurrency(rev) : '—'], ['Zahrada', detailClient.gardenSize || '—']]
                })().map(([l, v]) => (
                  <div key={l} className="bg-muted rounded-xl py-3 text-center">
                    <p className="font-bold tracking-tight">{v}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="px-5 pt-4 flex gap-2">
              <a href={`tel:${detailClient.phone}`} className="flex-1"><Button size="sm" className="w-full gap-1"><Phone size={12} />Volat</Button></a>
              <a href={`mailto:${detailClient.email}`} className="flex-1"><Button size="sm" className="w-full gap-1"><Mail size={12} />Email</Button></a>
              <Link to={`/orders?client=${detailClient.id}&new=1`} className="flex-1"><Button variant="primary" size="sm" className="w-full gap-1"><Plus size={12} />Zakázka</Button></Link>
            </div>
            {/* Info */}
            <div className="px-5 py-4 space-y-4 flex-1">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Kontakt</p>
                <div className="space-y-2">
                  {[['Telefon', detailClient.phone, Phone], ['Email', detailClient.email || '—', Mail], ['Adresa', detailClient.address, MapPin], ['Klient od', formatDate(detailClient.joinDate)]].map(([l, v, Icon]) => (
                    <div key={l} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                      {Icon && <Icon size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />}
                      <div><p className="text-xs text-muted-foreground">{l}</p><p className="text-sm font-medium">{v}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              {detailClient.notes && (
                <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900">{detailClient.notes}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Historie zakázek</p>
                {clientOrders(detailClient.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Žádné zakázky</p>
                ) : (
                  clientOrders(detailClient.id).sort((a, b) => new Date(b.date) - new Date(a.date)).map(o => (
                    <div key={o.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', o.status === 'completed' ? 'bg-green-500' : 'bg-blue-500')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{o.services.join(', ')}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                      </div>
                      <p className={cn('text-sm font-bold flex-shrink-0', o.paid ? 'text-primary' : 'text-destructive')}>{formatCurrency(o.totalPrice)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border flex gap-2">
              <Button size="sm" onClick={() => openEdit(detailClient)} className="gap-1"><Edit2 size={12} />Upravit</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(detailClient.id)} className="gap-1"><Trash2 size={12} />Odstranit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Upravit klienta' : 'Nový klient'}
        footer={<>
          <Button onClick={() => setModalOpen(false)}>Zrušit</Button>
          <Button variant="primary" onClick={handleSave}>Uložit klienta</Button>
        </>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Jméno a příjmení *">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Marie Horáčková" />
          </FormField>
          <FormField label="Telefon *">
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+420 601 234 567" />
          </FormField>
        </div>
        <FormField label="Email">
          <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="klient@email.cz" />
        </FormField>
        <FormField label="Adresa zahrady *">
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Lipová 15, Brno-Židenice" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Velikost zahrady">
            <Select value={form.gardenSize} onChange={e => setForm(f => ({ ...f, gardenSize: e.target.value }))}>
              <option value="malá">Malá (do 200 m²)</option>
              <option value="střední">Střední (200–500 m²)</option>
              <option value="velká">Velká (500+ m²)</option>
            </Select>
          </FormField>
          <FormField label="Typ klienta">
            <Select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
              <option value="pravidelný">Pravidelný</option>
              <option value="jednorázový">Jednorázový</option>
              <option value="firemní">Firemní</option>
              <option value="vip">VIP</option>
              <option value="nový">Nový</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Poznámky (pes, kód branky, požadavky…)">
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Pozor — velký pes Asta. Kód od branky: 4521." />
        </FormField>
      </Dialog>
    </div>
  )
}
