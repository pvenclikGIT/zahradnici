import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { formatCurrency, productCategories } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard,
  EmptyState, Dialog, FormField, Textarea, ConfirmDialog, toast
} from '../components/ui'
import {
  Plus, Search, Package, Edit2, Trash2, AlertTriangle,
  TrendingUp, ShoppingCart, X, Tag, Boxes
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyForm = {
  name:'', category:'substraty', unit:'', price:'', stock:'',
  minStock:'', supplier:'', sku:'', desc:''
}

const sortOptions = [
  { value:'name',     label:'Název A→Z'      },
  { value:'priceAsc', label:'Cena ↑'         },
  { value:'priceDesc',label:'Cena ↓'         },
  { value:'stockAsc', label:'Sklad ↑'        },
  { value:'stockDesc',label:'Sklad ↓'        },
]

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)

  // ── Filtered + sorted products ──
  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const mq = !q || p.name.toLowerCase().includes(q.toLowerCase())
        || p.sku?.toLowerCase().includes(q.toLowerCase())
        || p.supplier?.toLowerCase().includes(q.toLowerCase())
      const mc = !cat || p.category === cat
      let ms = true
      if (stockFilter === 'low')  ms = p.stock > 0 && p.stock <= p.minStock
      if (stockFilter === 'out')  ms = p.stock === 0
      if (stockFilter === 'ok')   ms = p.stock > p.minStock
      return mq && mc && ms
    })
    list.sort((a, b) => {
      if (sort === 'name')      return a.name.localeCompare(b.name, 'cs')
      if (sort === 'priceAsc')  return a.price - b.price
      if (sort === 'priceDesc') return b.price - a.price
      if (sort === 'stockAsc')  return a.stock - b.stock
      if (sort === 'stockDesc') return b.stock - a.stock
      return 0
    })
    return list
  }, [products, q, cat, stockFilter, sort])

  // ── Stats ──
  const totalValue   = products.reduce((s, p) => s + p.price * p.stock, 0)
  const lowStock     = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length
  const outOfStock   = products.filter(p => p.stock === 0).length
  const totalItems   = products.reduce((s, p) => s + p.stock, 0)

  // ── Handlers ──
  function openNew() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }
  function openEdit(p) {
    setEditingId(p.id)
    setForm({ ...p, price:String(p.price), stock:String(p.stock), minStock:String(p.minStock) })
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.name.trim()) { toast('Vyplňte název produktu', 'error'); return }
    if (!form.price || isNaN(form.price)) { toast('Vyplňte platnou cenu', 'error'); return }
    const data = {
      ...form,
      price: parseInt(form.price)    || 0,
      stock: parseInt(form.stock)    || 0,
      minStock: parseInt(form.minStock) || 0,
    }
    if (editingId) {
      updateProduct({ ...data, id: editingId })
      toast('Produkt upraven')
    } else {
      addProduct(data)
      toast('Produkt přidán')
    }
    setModalOpen(false)
  }

  // ── Stock status helper ──
  function stockStatus(p) {
    if (p.stock === 0) return { label:'Vyprodáno',   color:'bg-red-50 text-red-700 border-red-200',     dot:'bg-red-500'    }
    if (p.stock <= p.minStock) return { label:'Nízký sklad', color:'bg-amber-50 text-amber-700 border-amber-200', dot:'bg-amber-500' }
    return                      { label:'Skladem',    color:'bg-green-50 text-green-700 border-green-200', dot:'bg-green-500'  }
  }

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Hodnota skladu"  value={formatCurrency(totalValue)} sub={`${products.length} druhů`}      icon={Boxes}/>
        <StatCard label="Kusů celkem"      value={totalItems}                  sub="všech produktů"                  icon={Package}/>
        <StatCard label="Nízký sklad"      value={lowStock}                    sub={lowStock>0?'doplnit':'v pořádku'} subVariant={lowStock>0?'down':undefined} color={lowStock>0?'text-amber-600':undefined} icon={AlertTriangle}/>
        <StatCard label="Vyprodáno"        value={outOfStock}                  sub={outOfStock>0?'objednat':'OK'}    subVariant={outOfStock>0?'down':undefined} color={outOfStock>0?'text-destructive':undefined} icon={ShoppingCart}/>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat produkt, SKU, dodavatele…" className="pl-8"/>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 sm:flex-initial sm:w-44">
            <option value="">Všechny kategorie</option>
            {productCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
          <Select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="flex-1 sm:flex-initial sm:w-36">
            <option value="all">Všechny</option>
            <option value="ok">Skladem</option>
            <option value="low">Nízký</option>
            <option value="out">Vyprodáno</option>
          </Select>
          <Select value={sort} onChange={e => setSort(e.target.value)} className="flex-1 sm:flex-initial sm:w-36">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
          <Button variant="primary" size="sm" onClick={openNew} className="gap-1 flex-shrink-0">
            <Plus size={14}/><span className="hidden sm:inline">Nový produkt</span><span className="sm:hidden">Nový</span>
          </Button>
        </div>
      </div>

      {/* Quick category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setCat('')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 transition-all touch-manipulation',
            !cat ? 'bg-foreground text-white border-foreground' : 'bg-white text-muted-foreground border-border hover:border-foreground'
          )}>
          Vše ({products.length})
        </button>
        {productCategories.map(c => {
          const count = products.filter(p => p.category === c.id).length
          if (count === 0) return null
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 transition-all touch-manipulation',
                cat === c.id ? 'bg-foreground text-white border-foreground' : c.color + ' hover:opacity-80'
              )}>
              {c.label} ({count})
            </button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} {filtered.length===1?'produkt':filtered.length<5?'produkty':'produktů'}</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="Žádné produkty nenalezeny" description="Zkuste jiný filtr nebo přidejte nový produkt."
          action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Nový produkt</Button>}/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(p => {
            const status = stockStatus(p)
            const category = productCategories.find(c => c.id === p.category)
            return (
              <Card key={p.id} className="hover:shadow-md hover:-translate-y-px transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold tracking-tight text-[15px] leading-tight">{p.name}</p>
                      {p.sku && <p className="text-[10px] text-muted-foreground mt-1 font-mono">SKU: {p.sku}</p>}
                    </div>
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0', status.color)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)}/>{status.label}
                    </span>
                  </div>

                  {p.desc && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.desc}</p>}

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {category && (
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border', category.color)}>
                        <Tag size={9}/>{category.label}
                      </span>
                    )}
                    {p.supplier && (
                      <span className="text-[10px] text-muted-foreground">{p.supplier}</span>
                    )}
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-xl font-bold tracking-tight">{formatCurrency(p.price)}</p>
                      <p className="text-[10px] text-muted-foreground">{p.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{p.stock} ks</p>
                      <p className="text-[10px] text-muted-foreground">na skladě</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button size="sm" className="flex-1 gap-1" onClick={() => openEdit(p)}><Edit2 size={11}/>Upravit</Button>
                    <Button size="icon-sm" variant="danger" onClick={() => setDeleteId(p.id)}><Trash2 size={11}/></Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit produkt' : 'Nový produkt'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit produkt</Button></>}>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Název produktu *" className="sm:col-span-2">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="např. Mulčovací kůra borová"/>
          </FormField>

          <FormField label="Kategorie *">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {productCategories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Jednotka" hint="Např. pytel 70 l, ks, kg">
            <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="pytel 70 l"/>
          </FormField>

          <FormField label="Cena (Kč) *">
            <Input type="number" inputMode="numeric" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="180"/>
          </FormField>
          <FormField label="SKU / kód">
            <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="MK-BO-70"/>
          </FormField>

          <FormField label="Skladem (ks)">
            <Input type="number" inputMode="numeric" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="48"/>
          </FormField>
          <FormField label="Minimální zásoba" hint="Při poklesu pod tento počet upozornění">
            <Input type="number" inputMode="numeric" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} placeholder="10"/>
          </FormField>

          <FormField label="Dodavatel" className="sm:col-span-2">
            <Input value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="AGRO CS"/>
          </FormField>

          <FormField label="Popis" className="sm:col-span-2">
            <Textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Borová kůra hrubá frakce, 70 litrů"/>
          </FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteProduct(deleteId); toast('Produkt odstraněn', 'warning') }}
        title="Smazat produkt?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
