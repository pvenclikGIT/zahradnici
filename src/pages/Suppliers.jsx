import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { supplierCategories, formatCurrency } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard,
  EmptyState, Dialog, FormField, Textarea, ConfirmDialog, toast
} from '../components/ui'
import {
  Plus, Search, Phone, Mail, MapPin, Edit2, Trash2, X,
  Globe, Star, ExternalLink, Truck, Clock, Tag, Building2,
  Heart, MessageCircle, FileText, Award, Percent
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyForm = {
  name:'', contactPerson:'', phone:'', email:'', web:'', address:'',
  ico:'', dic:'', bank:'', categories:[], paymentTerms:'14 dní',
  deliveryTime:'2-3 dny', rating:4, favorite:false, notes:'',
  minOrder:'', discount:''
}

export function Suppliers() {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier, toggleSupplierFavorite } = useApp()
  const [q, setQ]              = useState('')
  const [cat, setCat]          = useState('')
  const [view, setView]        = useState('grid')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingId, setEditingId]         = useState(null)
  const [form, setForm]                   = useState(emptyForm)
  const [deleteId, setDeleteId]           = useState(null)
  const [detailId, setDetailId]           = useState(null)

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      const mq = !q
        || s.name.toLowerCase().includes(q.toLowerCase())
        || s.contactPerson?.toLowerCase().includes(q.toLowerCase())
        || s.email?.toLowerCase().includes(q.toLowerCase())
        || s.phone?.includes(q)
      const mc = !cat || s.categories?.includes(cat)
      const mf = !favoritesOnly || s.favorite
      return mq && mc && mf
    }).sort((a, b) => {
      // Favorites first, then by name
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
      return a.name.localeCompare(b.name, 'cs')
    })
  }, [suppliers, q, cat, favoritesOnly])

  const detailSupplier = suppliers.find(s => s.id === detailId)

  // Stats
  const totalSuppliers = suppliers.length
  const favoriteCount  = suppliers.filter(s => s.favorite).length
  const avgRating      = suppliers.length
    ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1)
    : 0
  const productsCount  = (supplierName) => products.filter(p => p.supplier === supplierName).length

  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  function openEdit(s) {
    setEditingId(s.id)
    setForm({
      ...s,
      minOrder: s.minOrder ? String(s.minOrder) : '',
      discount: s.discount ? String(s.discount) : '',
      rating:   s.rating || 4,
    })
    setDetailId(null)
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.name.trim()) { toast('Vyplňte název dodavatele', 'error'); return }
    if (!form.phone && !form.email) { toast('Vyplňte alespoň telefon nebo email', 'error'); return }
    const data = {
      ...form,
      minOrder: form.minOrder ? parseInt(form.minOrder) : 0,
      discount: form.discount ? parseInt(form.discount) : 0,
    }
    if (editingId) {
      updateSupplier({ ...data, id: editingId })
      toast('Dodavatel upraven')
    } else {
      addSupplier(data)
      toast('Dodavatel přidán')
    }
    setModalOpen(false)
  }

  function getInitials(name) {
    return name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  // Color generated deterministically from name
  function getAvatarColor(name) {
    const colors = ['bg-blue-500','bg-green-600','bg-purple-500','bg-amber-500','bg-rose-500','bg-cyan-600','bg-emerald-600','bg-indigo-500']
    const hash = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Dodavatelů"    value={totalSuppliers} sub="celkem v adresáři"   icon={Building2}/>
        <StatCard label="Oblíbení"      value={favoriteCount}  sub="rychlý přístup"      icon={Heart} color={favoriteCount>0?'text-rose-500':undefined}/>
        <StatCard label="Průměr hodn."  value={`${avgRating} / 5`} sub="kvalita partnerů" icon={Star}/>
        <StatCard label="Kategorií"     value={supplierCategories.length} sub="oblastí dodávek" icon={Tag}/>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat dodavatele, kontakt, telefon…" className="pl-8"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFavoritesOnly(f => !f)}
            className={cn('flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-semibold border transition-all touch-manipulation flex-shrink-0',
              favoritesOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-muted-foreground border-input hover:border-foreground'
            )}>
            <Heart size={14} className={favoritesOnly ? 'fill-rose-500 text-rose-500' : ''}/>
            <span className="hidden sm:inline">Oblíbení</span>
          </button>
          <Select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 sm:flex-initial sm:w-44">
            <option value="">Všechny kategorie</option>
            {supplierCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
          <Button variant="primary" size="sm" onClick={openNew} className="gap-1 flex-shrink-0">
            <Plus size={14}/><span className="hidden sm:inline">Nový dodavatel</span><span className="sm:hidden">Nový</span>
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'dodavatel' : filtered.length < 5 ? 'dodavatelé' : 'dodavatelů'}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Žádní dodavatelé nenalezeni" description="Zkuste jiný filtr nebo přidejte nového dodavatele."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nový dodavatel</Button>}/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(s => {
            const productCount = productsCount(s.name)
            return (
              <Card key={s.id} onClick={() => setDetailId(s.id)}
                className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                <CardContent className="p-4">
                  {/* Header — avatar + name + favorite */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0', getAvatarColor(s.name))}>
                      {getInitials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold tracking-tight text-[15px] leading-tight truncate">{s.name}</p>
                        <button onClick={e => { e.stopPropagation(); toggleSupplierFavorite(s.id) }}
                          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg hover:bg-accent touch-manipulation">
                          <Heart size={15} className={s.favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground/40'}/>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{s.contactPerson || '—'}</p>
                      {/* Rating */}
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={10}
                            className={n <= (s.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  {s.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {s.categories.slice(0, 3).map(catId => {
                        const c = supplierCategories.find(x => x.id === catId)
                        if (!c) return null
                        return (
                          <span key={catId} className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full border', c.color)}>
                            {c.label}
                          </span>
                        )
                      })}
                      {s.categories.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">+{s.categories.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Quick info */}
                  <div className="grid grid-cols-2 gap-2 py-2.5 border-t border-b border-border my-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Doprava</p>
                      <p className="text-xs font-semibold flex items-center gap-1 mt-0.5"><Truck size={10}/>{s.deliveryTime || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Splatnost</p>
                      <p className="text-xs font-semibold flex items-center gap-1 mt-0.5"><Clock size={10}/>{s.paymentTerms || '—'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className="flex-1">
                        <Button size="sm" className="w-full gap-1"><Phone size={11}/>Volat</Button>
                      </a>
                    )}
                    {s.email && (
                      <a href={`mailto:${s.email}`} className="flex-1">
                        <Button size="sm" className="w-full gap-1"><Mail size={11}/>Email</Button>
                      </a>
                    )}
                    <Button size="icon-sm" onClick={() => openEdit(s)}><Edit2 size={11}/></Button>
                  </div>

                  {/* Product link */}
                  {productCount > 0 && (
                    <p className="text-[10px] text-muted-foreground text-center mt-2">
                      {productCount} {productCount === 1 ? 'produkt' : productCount < 5 ? 'produkty' : 'produktů'} v katalogu
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Panel */}
      {detailSupplier && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-stretch sm:justify-end" onClick={() => setDetailId(null)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={e => e.stopPropagation()} className="relative w-full sm:max-w-[440px] bg-white border-border shadow-2xl flex flex-col rounded-t-3xl sm:rounded-none sm:border-l" style={{maxHeight:'calc(100vh - 16px)', height:'100%'}}>
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>

            <div className="bg-white flex items-center justify-between px-5 py-3 sm:py-4 border-b border-border flex-shrink-0">
              <p className="text-sm font-semibold">Detail dodavatele</p>
              <button onClick={() => setDetailId(null)} className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-accent touch-manipulation"><X size={14}/></button>
            </div>

            <div className="overflow-y-auto overscroll-contain flex-1" style={{WebkitOverflowScrolling:'touch'}}>
              {/* Hero */}
              <div className="px-5 py-5 border-b border-border">
                <div className="flex items-start gap-4 mb-4">
                  <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0', getAvatarColor(detailSupplier.name))}>
                    {getInitials(detailSupplier.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold tracking-tight">{detailSupplier.name}</p>
                    <p className="text-xs text-muted-foreground">{detailSupplier.contactPerson}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={12}
                            className={n <= (detailSupplier.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                      <button onClick={() => toggleSupplierFavorite(detailSupplier.id)}
                        className="ml-auto p-1.5 rounded-lg hover:bg-accent touch-manipulation">
                        <Heart size={14} className={detailSupplier.favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}/>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                {detailSupplier.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {detailSupplier.categories.map(catId => {
                      const c = supplierCategories.find(x => x.id === catId)
                      if (!c) return null
                      return (
                        <span key={catId} className={cn('text-[10px] font-semibold px-2 py-1 rounded-full border', c.color)}>
                          {c.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Quick action buttons */}
              <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border">
                {detailSupplier.phone && (
                  <a href={`tel:${detailSupplier.phone}`}>
                    <Button size="sm" className="w-full gap-1 flex-col h-auto py-2"><Phone size={14}/><span className="text-[10px]">Volat</span></Button>
                  </a>
                )}
                {detailSupplier.email && (
                  <a href={`mailto:${detailSupplier.email}`}>
                    <Button size="sm" className="w-full gap-1 flex-col h-auto py-2"><Mail size={14}/><span className="text-[10px]">Email</span></Button>
                  </a>
                )}
                {detailSupplier.web && (
                  <a href={`https://${detailSupplier.web}`} target="_blank" rel="noreferrer">
                    <Button size="sm" className="w-full gap-1 flex-col h-auto py-2"><Globe size={14}/><span className="text-[10px]">Web</span></Button>
                  </a>
                )}
                {detailSupplier.phone && (
                  <a href={`sms:${detailSupplier.phone}`}>
                    <Button size="sm" className="w-full gap-1 flex-col h-auto py-2"><MessageCircle size={14}/><span className="text-[10px]">SMS</span></Button>
                  </a>
                )}
              </div>

              {/* Contact info */}
              <div className="px-5 py-4 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Kontakt</p>
                <div className="space-y-3">
                  {[
                    ['Kontaktní osoba', detailSupplier.contactPerson, null],
                    ['Telefon',  detailSupplier.phone,   Phone],
                    ['Email',    detailSupplier.email,   Mail],
                    ['Web',      detailSupplier.web,     Globe],
                    ['Adresa',   detailSupplier.address, MapPin],
                  ].filter(([,v]) => v).map(([label, value, Icon]) => (
                    <div key={label} className="flex items-start gap-3">
                      {Icon && <Icon size={13} className="text-muted-foreground mt-0.5 flex-shrink-0"/>}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium break-words">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Business terms */}
              <div className="px-5 py-4 border-b border-border">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Obchodní podmínky</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <Truck size={13} className="text-muted-foreground mb-1"/>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Doprava</p>
                    <p className="text-sm font-bold">{detailSupplier.deliveryTime || '—'}</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <Clock size={13} className="text-muted-foreground mb-1"/>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Splatnost</p>
                    <p className="text-sm font-bold">{detailSupplier.paymentTerms || '—'}</p>
                  </div>
                  {detailSupplier.minOrder > 0 && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <Tag size={13} className="text-muted-foreground mb-1"/>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Min. objednávka</p>
                      <p className="text-sm font-bold">{formatCurrency(detailSupplier.minOrder)}</p>
                    </div>
                  )}
                  {detailSupplier.discount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <Percent size={13} className="text-green-600 mb-1"/>
                      <p className="text-[10px] text-green-700 uppercase tracking-wider">Sleva</p>
                      <p className="text-sm font-bold text-green-700">{detailSupplier.discount} %</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fakturace */}
              {(detailSupplier.ico || detailSupplier.bank) && (
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Fakturační údaje</p>
                  <div className="space-y-2">
                    {detailSupplier.ico && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">IČO</span>
                        <span className="font-mono font-medium">{detailSupplier.ico}</span>
                      </div>
                    )}
                    {detailSupplier.dic && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">DIČ</span>
                        <span className="font-mono font-medium">{detailSupplier.dic}</span>
                      </div>
                    )}
                    {detailSupplier.bank && (
                      <div className="flex items-center justify-between text-sm gap-2">
                        <span className="text-muted-foreground flex-shrink-0">Účet</span>
                        <span className="font-mono font-medium text-right break-all">{detailSupplier.bank}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {detailSupplier.notes && (
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Poznámky</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm leading-relaxed text-amber-900">{detailSupplier.notes}</p>
                  </div>
                </div>
              )}

              {/* Linked products */}
              {productsCount(detailSupplier.name) > 0 && (
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Produkty od dodavatele ({productsCount(detailSupplier.name)})</p>
                  <div className="space-y-2">
                    {products.filter(p => p.supplier === detailSupplier.name).slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.unit}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">{formatCurrency(p.price)}</p>
                      </div>
                    ))}
                    {productsCount(detailSupplier.name) > 5 && (
                      <p className="text-[11px] text-muted-foreground text-center">+ {productsCount(detailSupplier.name) - 5} dalších</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 sm:py-4 border-t border-border flex gap-2 flex-wrap flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
              <Button size="sm" onClick={() => openEdit(detailSupplier)} className="gap-1 flex-1"><Edit2 size={12}/>Upravit</Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(detailSupplier.id)} className="gap-1"><Trash2 size={12}/>Smazat</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit dodavatele' : 'Nový dodavatel'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit dodavatele</Button></>}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Název firmy *" className="sm:col-span-2">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="AGRO CS a.s."/>
          </FormField>

          <FormField label="Kontaktní osoba" className="sm:col-span-2">
            <Input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="Ing. Petr Novák"/>
          </FormField>

          <FormField label="Telefon">
            <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+420 491 401 001"/>
          </FormField>
          <FormField label="Email">
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="objednavky@firma.cz"/>
          </FormField>

          <FormField label="Web" className="sm:col-span-2">
            <Input value={form.web} onChange={e => setForm(f => ({ ...f, web: e.target.value }))} placeholder="www.firma.cz"/>
          </FormField>

          <FormField label="Adresa" className="sm:col-span-2">
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Říkov 265, 552 03 Česká Skalice"/>
          </FormField>

          <FormField label="Kategorie dodávek" className="sm:col-span-2" hint="Co od nich odebíráte">
            <div className="grid grid-cols-2 gap-1.5 border border-input rounded-xl p-2.5">
              {supplierCategories.map(c => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer touch-manipulation py-1">
                  <input type="checkbox" className="w-4 h-4 accent-primary"
                    checked={form.categories.includes(c.id)}
                    onChange={e => setForm(f => ({
                      ...f,
                      categories: e.target.checked
                        ? [...f.categories, c.id]
                        : f.categories.filter(x => x !== c.id)
                    }))}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Dodací doba">
            <Input value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} placeholder="2-3 dny"/>
          </FormField>
          <FormField label="Splatnost faktur">
            <Input value={form.paymentTerms} onChange={e => setForm(f => ({ ...f, paymentTerms: e.target.value }))} placeholder="14 dní"/>
          </FormField>

          <FormField label="Min. objednávka (Kč)">
            <Input type="number" inputMode="numeric" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} placeholder="1500"/>
          </FormField>
          <FormField label="Sleva (%)">
            <Input type="number" inputMode="numeric" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="8"/>
          </FormField>

          <FormField label="IČO">
            <Input value={form.ico} onChange={e => setForm(f => ({ ...f, ico: e.target.value }))} placeholder="64829413"/>
          </FormField>
          <FormField label="DIČ">
            <Input value={form.dic} onChange={e => setForm(f => ({ ...f, dic: e.target.value }))} placeholder="CZ64829413"/>
          </FormField>

          <FormField label="Číslo účtu" className="sm:col-span-2">
            <Input value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} placeholder="12345678/0100"/>
          </FormField>

          <FormField label="Hodnocení (1–5 hvězd)" className="sm:col-span-2">
            <div className="flex gap-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}
                  className="p-1 touch-manipulation">
                  <Star size={26} className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 hover:text-gray-300'}/>
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Poznámky" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Hlavní velkoobchod. Sleva při odběru nad 5 000 Kč..."/>
          </FormField>

          <FormField label="" className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
              <input type="checkbox" className="w-5 h-5 accent-rose-500"
                checked={form.favorite}
                onChange={e => setForm(f => ({ ...f, favorite: e.target.checked }))}
              />
              <span className="text-sm font-medium">Označit jako oblíbeného</span>
              <Heart size={14} className={form.favorite ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground/40'}/>
            </label>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteSupplier(deleteId); setDetailId(null); toast('Dodavatel odstraněn', 'warning') }}
        title="Smazat dodavatele?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
