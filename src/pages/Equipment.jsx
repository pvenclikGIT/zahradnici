import { useState, useMemo, useEffect } from 'react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import {
  equipmentCategories, equipmentConditions, equipmentLocations,
  serviceEquipmentMap, detectServiceType, equipmentTemplates,
  formatDate, formatDateShort
} from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard, EmptyState,
  Dialog, FormField, Textarea, ConfirmDialog, toast
} from '../components/ui'
import {
  Plus, Search, Wrench, Edit2, Trash2, X, Check, Truck, ArrowRight,
  AlertCircle, ClipboardCheck, Sparkles, Zap, MapPin, Tag, Clock,
  Sunrise, RefreshCw
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyEq = {
  name:'', category:'tools', icon:'🔧', condition:'ok',
  location:'van', assignedTo:null, brand:'', model:'', serial:'',
  notes:'', purchaseDate:''
}

export function Equipment() {
  const { equipment, orders, clients, services, workers, addEquipment, updateEquipment, deleteEquipment } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('checklist')         // 'checklist' | 'inventory'
  const [q, setQ]    = useState('')
  const [cat, setCat] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [locFilter, setLocFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyEq)
  const [detailId, setDetailId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Pre-trip checklist state
  const [checkedIds, setCheckedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zp_pretrip_checked') || '[]') } catch { return [] }
  })
  const [missingIds, setMissingIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zp_pretrip_missing') || '[]') } catch { return [] }
  })
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0])
  const [showAdHoc, setShowAdHoc] = useState(false)
  const [adHocText, setAdHocText] = useState('')
  const [adHocItems, setAdHocItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zp_pretrip_adhoc') || '[]') } catch { return [] }
  })
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => { localStorage.setItem('zp_pretrip_checked', JSON.stringify(checkedIds)) }, [checkedIds])
  useEffect(() => { localStorage.setItem('zp_pretrip_missing', JSON.stringify(missingIds)) }, [missingIds])
  useEffect(() => { localStorage.setItem('zp_pretrip_adhoc',   JSON.stringify(adHocItems)) }, [adHocItems])

  // ── Compute equipment needed for selected day ──
  const myWorkerId = useMemo(() => {
    const me = workers.find(w => w.name === currentUser?.name)
    return me?.id || null
  }, [workers, currentUser])

  const dayOrders = useMemo(() => {
    return orders.filter(o => o.date === checkDate && o.status !== 'completed')
  }, [orders, checkDate])

  // My orders if I'm a worker, all orders if owner
  const myDayOrders = useMemo(() => {
    if (currentUser?.role === 'owner') return dayOrders
    if (myWorkerId) return dayOrders.filter(o => o.workerId === myWorkerId)
    return dayOrders
  }, [dayOrders, currentUser, myWorkerId])

  const neededEquipmentIds = useMemo(() => {
    const ids = new Set()
    myDayOrders.forEach(order => {
      (order.services || []).forEach(svcName => {
        const type = detectServiceType(svcName)
        const eqIds = serviceEquipmentMap[type] || serviceEquipmentMap.standardni
        eqIds.forEach(id => ids.add(id))
      })
    })
    return Array.from(ids)
  }, [myDayOrders])

  const neededEquipment = useMemo(() => {
    return neededEquipmentIds.map(id => equipment.find(e => e.id === id)).filter(Boolean)
  }, [neededEquipmentIds, equipment])

  // Group by category for display
  const equipmentByCategory = useMemo(() => {
    const groups = {}
    neededEquipment.forEach(e => {
      if (!groups[e.category]) groups[e.category] = []
      groups[e.category].push(e)
    })
    return groups
  }, [neededEquipment])

  // ── Handlers ──
  function toggleChecked(eqId) {
    setCheckedIds(ids => ids.includes(eqId) ? ids.filter(x => x !== eqId) : [...ids, eqId])
    setMissingIds(ids => ids.filter(x => x !== eqId))
  }
  function toggleMissing(eqId) {
    setMissingIds(ids => ids.includes(eqId) ? ids.filter(x => x !== eqId) : [...ids, eqId])
    setCheckedIds(ids => ids.filter(x => x !== eqId))
  }
  function resetChecklist() {
    setCheckedIds([])
    setMissingIds([])
    toast('Checklist resetován')
  }
  function loadTemplate(tplId) {
    const tpl = equipmentTemplates.find(t => t.id === tplId)
    if (!tpl) return
    setCheckedIds([])
    setMissingIds([])
    setShowTemplates(false)
    toast(`Šablona "${tpl.name}" načtena`)
  }
  function addAdHoc() {
    if (!adHocText.trim()) return
    setAdHocItems(items => [...items, { id: Date.now(), text: adHocText.trim(), checked: false }])
    setAdHocText('')
  }
  function toggleAdHoc(id) {
    setAdHocItems(items => items.map(i => i.id === id ? {...i, checked: !i.checked} : i))
  }
  function removeAdHoc(id) {
    setAdHocItems(items => items.filter(i => i.id !== id))
  }
  function finishCheck() {
    if (missingIds.length > 0) {
      toast(`⚠️ Pozor — ${missingIds.length} položek chybí!`, 'error')
      return
    }
    toast('🚀 Hotovo, jedeme!')
    // Save trip ready timestamp
    localStorage.setItem('zp_pretrip_done', new Date().toISOString())
    setCheckedIds([])
    setMissingIds([])
    setAdHocItems([])
  }

  // Build template equipment for show
  const [activeTemplate, setActiveTemplate] = useState(null)
  const templateEquipment = useMemo(() => {
    if (!activeTemplate) return null
    const tpl = equipmentTemplates.find(t => t.id === activeTemplate)
    if (!tpl) return null
    return tpl.equipmentIds.map(id => equipment.find(e => e.id === id)).filter(Boolean)
  }, [activeTemplate, equipment])

  const displayEquipment = templateEquipment || neededEquipment
  const displayByCategory = useMemo(() => {
    const groups = {}
    displayEquipment.forEach(e => {
      if (!groups[e.category]) groups[e.category] = []
      groups[e.category].push(e)
    })
    return groups
  }, [displayEquipment])

  const totalToCheck = displayEquipment.length + adHocItems.length
  const totalChecked = checkedIds.length + adHocItems.filter(i => i.checked).length
  const progress = totalToCheck > 0 ? Math.round((totalChecked / totalToCheck) * 100) : 0
  const allChecked = totalToCheck > 0 && totalChecked === totalToCheck

  // ── Inventory filtering ──
  const filteredInventory = useMemo(() => {
    let list = equipment.filter(e => {
      const mq = !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.brand?.toLowerCase().includes(q.toLowerCase())
      const mc = !cat || e.category === cat
      const mco = !conditionFilter || e.condition === conditionFilter
      const ml = !locFilter || e.location === locFilter
      return mq && mc && mco && ml
    })
    list.sort((a,b) => a.name.localeCompare(b.name, 'cs'))
    return list
  }, [equipment, q, cat, conditionFilter, locFilter])

  // ── Inventory stats ──
  const totalCount = equipment.length
  const inService = equipment.filter(e => e.condition === 'service').length
  const broken = equipment.filter(e => e.condition === 'broken').length
  const inVan = equipment.filter(e => e.location === 'van').length

  // ── CRUD form ──
  function openNew() {
    setEditingId(null)
    setForm(emptyEq)
    setModalOpen(true)
  }
  function openEdit(e) {
    setEditingId(e.id)
    setForm({...e, assignedTo: e.assignedTo ? String(e.assignedTo) : ''})
    setDetailId(null)
    setModalOpen(true)
  }
  function handleSave() {
    if (!form.name?.trim()) { toast('Vyplňte název', 'error'); return }
    const data = {
      ...form,
      assignedTo: form.assignedTo ? parseInt(form.assignedTo) : null,
    }
    if (editingId) { updateEquipment({...data, id:editingId}); toast('Vybavení upraveno') }
    else { addEquipment(data); toast('Vybavení přidáno') }
    setModalOpen(false)
  }

  const detailEquipment = equipment.find(e => e.id === detailId)
  const todayLabel = checkDate === new Date().toISOString().split('T')[0] ? 'Dnes' : 'Vybraný den'

  return (
    <div className="space-y-5">

      {/* Tab switcher */}
      <div className="flex bg-muted rounded-2xl p-1 gap-0.5">
        <button onClick={() => setTab('checklist')}
          className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all touch-manipulation',
            tab === 'checklist' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
          )}>
          <Sunrise size={14}/>Pre-trip
        </button>
        <button onClick={() => setTab('inventory')}
          className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all touch-manipulation',
            tab === 'inventory' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground'
          )}>
          <Wrench size={14}/>Inventář ({totalCount})
        </button>
      </div>

      {/* ─────── PRE-TRIP CHECKLIST ─────── */}
      {tab === 'checklist' && (
        <div className="space-y-4">
          {/* Date + template selector */}
          <div className="flex flex-wrap gap-2 items-center">
            <Input type="date" value={checkDate} onChange={e => { setCheckDate(e.target.value); setActiveTemplate(null) }} className="flex-1 max-w-[180px]"/>
            <Button size="sm" onClick={() => setShowTemplates(s => !s)} className="gap-1">
              <Sparkles size={13}/>Šablony
            </Button>
            {(checkedIds.length > 0 || missingIds.length > 0) && (
              <Button size="sm" variant="ghost" onClick={resetChecklist} className="gap-1">
                <RefreshCw size={13}/>Reset
              </Button>
            )}
            {activeTemplate && (
              <button onClick={() => setActiveTemplate(null)} className="text-xs text-primary font-semibold hover:underline">
                ← Zpět na zakázky
              </button>
            )}
          </div>

          {/* Templates panel */}
          {showTemplates && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {equipmentTemplates.map(tpl => (
                <button key={tpl.id} onClick={() => { setActiveTemplate(tpl.id); setShowTemplates(false); setCheckedIds([]); setMissingIds([]) }}
                  className={cn('p-3 rounded-xl border-2 text-left touch-manipulation transition-all',
                    activeTemplate === tpl.id ? 'border-primary bg-green-50' : 'border-border hover:border-primary'
                  )}>
                  <div className="text-2xl mb-1">{tpl.icon}</div>
                  <p className="font-bold text-sm">{tpl.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tpl.equipmentIds.length} položek</p>
                </button>
              ))}
            </div>
          )}

          {/* Today's orders summary */}
          {!activeTemplate && myDayOrders.length > 0 && (
            <Card className="bg-blue-50/40 border-blue-200">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 mb-2">{todayLabel}: {myDayOrders.length} {myDayOrders.length === 1 ? 'zakázka' : 'zakázek'}</p>
                <div className="space-y-1.5">
                  {myDayOrders.map(o => {
                    const c = clients.find(x => x.id === o.clientId)
                    return (
                      <div key={o.id} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"/>
                        <p className="font-semibold truncate">{c?.name}</p>
                        <p className="text-muted-foreground truncate">— {o.services.slice(0,2).join(', ')}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {!activeTemplate && myDayOrders.length === 0 && (
            <EmptyState icon={Sunrise} title="Žádné zakázky na tento den" description="Nemáte naplánované zakázky. Vyberte šablonu nebo přidejte zakázku v sekci Zakázky."
              action={<Link to="/orders?new=1"><Button variant="primary" size="sm" className="gap-1"><Plus size={14}/>Nová zakázka</Button></Link>}/>
          )}

          {/* Progress bar */}
          {totalToCheck > 0 && (
            <Card className={cn(allChecked ? 'bg-green-50 border-green-200' : missingIds.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold">
                    {allChecked ? '✓ Vše zkontrolováno' :
                     missingIds.length > 0 ? `⚠️ ${missingIds.length} položek chybí` :
                     `${totalChecked} / ${totalToCheck} zkontrolováno`}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">{progress}%</p>
                </div>
                <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all',
                    allChecked ? 'bg-green-500' : missingIds.length > 0 ? 'bg-red-500' : 'bg-amber-500'
                  )} style={{width: `${progress}%`}}/>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Equipment cards by category — BIG BUTTONS! */}
          {Object.entries(displayByCategory).map(([catId, items]) => {
            const category = equipmentCategories.find(c => c.id === catId)
            return (
              <div key={catId}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-lg">{category?.icon}</span>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{category?.label}</p>
                  <p className="text-[11px] text-muted-foreground ml-auto">{items.length} ks</p>
                </div>
                <div className="space-y-2">
                  {items.map(eq => {
                    const isChecked = checkedIds.includes(eq.id)
                    const isMissing = missingIds.includes(eq.id)
                    const cond = equipmentConditions.find(c => c.id === eq.condition)
                    const loc  = equipmentLocations.find(l => l.id === eq.location)
                    return (
                      <div key={eq.id}
                        className={cn('flex items-center gap-3 p-3 rounded-2xl border-2 transition-all',
                          isChecked ? 'bg-green-50 border-green-300' :
                          isMissing ? 'bg-red-50 border-red-300' :
                          'bg-white border-border'
                        )}>
                        <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                          {eq.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('font-bold text-sm leading-tight',
                            isChecked && 'line-through opacity-60'
                          )}>{eq.name}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                              {loc?.icon} {loc?.label}
                            </span>
                            {eq.condition !== 'ok' && cond && (
                              <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border', cond.color)}>
                                {cond.label}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Big tap targets — MÁM / NEMÁM */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => toggleChecked(eq.id)}
                            className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-all touch-manipulation active:scale-90',
                              isChecked ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                            )}>
                            <Check size={22} strokeWidth={3}/>
                          </button>
                          <button onClick={() => toggleMissing(eq.id)}
                            className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-all touch-manipulation active:scale-90',
                              isMissing ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600'
                            )}>
                            <X size={22} strokeWidth={3}/>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Ad-hoc items */}
          {(adHocItems.length > 0 || showAdHoc) && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-lg">📝</span>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Vlastní poznámky</p>
              </div>
              <div className="space-y-2">
                {adHocItems.map(item => (
                  <div key={item.id} className={cn('flex items-center gap-3 p-3 rounded-2xl border-2 transition-all',
                    item.checked ? 'bg-green-50 border-green-300' : 'bg-white border-border'
                  )}>
                    <button onClick={() => toggleAdHoc(item.id)}
                      className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all touch-manipulation flex-shrink-0',
                        item.checked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                      )}>
                      <Check size={18} strokeWidth={3}/>
                    </button>
                    <p className={cn('flex-1 text-sm', item.checked && 'line-through opacity-60')}>{item.text}</p>
                    <button onClick={() => removeAdHoc(item.id)} className="p-1.5 text-muted-foreground hover:text-red-500 touch-manipulation">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add ad-hoc form */}
          {showAdHoc ? (
            <div className="flex gap-2">
              <Input value={adHocText} onChange={e => setAdHocText(e.target.value)} placeholder="Např. nesmím zapomenout..."
                onKeyDown={e => e.key === 'Enter' && addAdHoc()} autoFocus/>
              <Button variant="primary" size="sm" onClick={addAdHoc}>Přidat</Button>
              <Button size="sm" onClick={() => { setShowAdHoc(false); setAdHocText('') }}>Zrušit</Button>
            </div>
          ) : (
            <Button onClick={() => setShowAdHoc(true)} className="w-full gap-1.5 justify-center" size="sm">
              <Plus size={14}/>Přidat vlastní položku
            </Button>
          )}

          {/* Big finish button */}
          {totalToCheck > 0 && (
            <div className="sticky bottom-20 lg:bottom-4 z-10">
              <button onClick={finishCheck}
                disabled={missingIds.length > 0 || !allChecked}
                className={cn('w-full py-5 rounded-2xl font-bold text-base shadow-xl transition-all touch-manipulation flex items-center justify-center gap-2',
                  allChecked ? 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-green-300' :
                  missingIds.length > 0 ? 'bg-red-500 text-white opacity-90' :
                  'bg-gray-300 text-gray-500'
                )}>
                {allChecked ? '🚀 Hotovo, jedu!' :
                 missingIds.length > 0 ? `⚠️ ${missingIds.length} položek chybí` :
                 `Zbývá zkontrolovat ${totalToCheck - totalChecked}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────── INVENTORY ─────── */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <StatCard label="Celkem" value={totalCount} sub="všech položek" icon={Wrench}/>
            <StatCard label="V dodávce" value={inVan} sub="naloženo" icon={Truck}/>
            <StatCard label="V servisu" value={inService} sub={inService>0?'v opravě':'OK'} color={inService>0?'text-amber-600':undefined} icon={AlertCircle}/>
            <StatCard label="Rozbité" value={broken} sub={broken>0?'k opravě':'OK'} color={broken>0?'text-destructive':undefined}/>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Hledat vybavení…" className="pl-8"/>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 sm:flex-initial sm:w-44">
                <option value="">Všechny kategorie</option>
                {equipmentCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </Select>
              <Select value={locFilter} onChange={e => setLocFilter(e.target.value)} className="flex-1 sm:flex-initial sm:w-36">
                <option value="">Všechna místa</option>
                {equipmentLocations.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </Select>
              <Select value={conditionFilter} onChange={e => setConditionFilter(e.target.value)} className="flex-1 sm:flex-initial sm:w-32">
                <option value="">Všechny stavy</option>
                {equipmentConditions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
              <Button variant="primary" size="sm" onClick={openNew} className="gap-1 flex-shrink-0">
                <Plus size={14}/><span className="hidden sm:inline">Přidat</span>
              </Button>
            </div>
          </div>

          {/* Quick category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button onClick={() => setCat('')}
              className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 transition-all touch-manipulation',
                !cat ? 'bg-foreground text-white border-foreground' : 'bg-white text-muted-foreground border-border hover:border-foreground'
              )}>
              Vše ({equipment.length})
            </button>
            {equipmentCategories.map(c => {
              const count = equipment.filter(e => e.category === c.id).length
              if (count === 0) return null
              return (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap flex-shrink-0 transition-all touch-manipulation',
                    cat === c.id ? 'bg-foreground text-white border-foreground' : c.color + ' hover:opacity-80'
                  )}>
                  {c.icon} {c.label} ({count})
                </button>
              )
            })}
          </div>

          <p className="text-xs text-muted-foreground">{filteredInventory.length} {filteredInventory.length === 1 ? 'položka' : filteredInventory.length < 5 ? 'položky' : 'položek'}</p>

          {/* Equipment grid */}
          {filteredInventory.length === 0 ? (
            <EmptyState icon={Wrench} title="Žádné vybavení nenalezeno"
              action={<Button variant="primary" size="sm" onClick={openNew}><Plus size={14}/>Přidat</Button>}/>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredInventory.map(eq => {
                const cat = equipmentCategories.find(c => c.id === eq.category)
                const cond = equipmentConditions.find(c => c.id === eq.condition)
                const loc = equipmentLocations.find(l => l.id === eq.location)
                const owner = workers.find(w => w.id === eq.assignedTo)
                return (
                  <Card key={eq.id} onClick={() => setDetailId(eq.id)}
                    className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center flex-shrink-0 text-2xl">
                          {eq.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-sm leading-tight truncate">{eq.name}</p>
                            <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1.5', cond?.dot)}/>
                          </div>
                          {eq.brand && <p className="text-[10px] text-muted-foreground truncate">{eq.brand} {eq.model}</p>}
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {cat && (
                              <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border', cat.color)}>
                                {cat.icon} {cat.label}
                              </span>
                            )}
                            <span className="inline-flex items-center text-[10px] text-muted-foreground">
                              {loc?.icon} {loc?.label}
                            </span>
                          </div>
                          {owner && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="w-3.5 h-3.5 rounded-full text-[8px] font-bold text-white flex items-center justify-center" style={{backgroundColor: owner.color}}>
                                {owner.initials}
                              </span>
                              <p className="text-[10px] text-muted-foreground">{owner.name.split(' ')[0]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {detailEquipment && (() => {
        const cat = equipmentCategories.find(c => c.id === detailEquipment.category)
        const cond = equipmentConditions.find(c => c.id === detailEquipment.condition)
        const loc = equipmentLocations.find(l => l.id === detailEquipment.location)
        const owner = workers.find(w => w.id === detailEquipment.assignedTo)
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setDetailId(null)}>
            <div className="absolute inset-0 bg-black/60"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-md sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)'}}>
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                <p className="font-bold">Detail</p>
                <button onClick={() => setDetailId(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent"><X size={14}/></button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1">
                <div className="px-5 py-5 text-center border-b border-border">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 text-4xl">
                    {detailEquipment.icon}
                  </div>
                  <h2 className="text-lg font-bold">{detailEquipment.name}</h2>
                  {detailEquipment.brand && <p className="text-sm text-muted-foreground">{detailEquipment.brand} {detailEquipment.model}</p>}
                  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                    {cat && <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border', cat.color)}>{cat.icon} {cat.label}</span>}
                    {cond && <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border', cond.color)}>{cond.label}</span>}
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="flex justify-between text-sm py-2 border-b border-border"><span className="text-muted-foreground">Umístění</span><span className="font-medium">{loc?.icon} {loc?.label}</span></div>
                  {owner && <div className="flex justify-between text-sm py-2 border-b border-border"><span className="text-muted-foreground">Přiřazeno</span><span className="font-medium">{owner.name}</span></div>}
                  {detailEquipment.serial && <div className="flex justify-between text-sm py-2 border-b border-border"><span className="text-muted-foreground">Sériové č.</span><span className="font-mono text-xs">{detailEquipment.serial}</span></div>}
                  {detailEquipment.purchaseDate && <div className="flex justify-between text-sm py-2 border-b border-border"><span className="text-muted-foreground">Pořízeno</span><span className="font-medium">{formatDate(detailEquipment.purchaseDate)}</span></div>}
                  {detailEquipment.lastUsed && <div className="flex justify-between text-sm py-2 border-b border-border"><span className="text-muted-foreground">Naposled použito</span><span className="font-medium">{formatDateShort(detailEquipment.lastUsed)}</span></div>}
                </div>
                {detailEquipment.notes && (
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Poznámka</p>
                    <p className="text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">{detailEquipment.notes}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border flex gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
                <Button size="sm" onClick={() => openEdit(detailEquipment)} className="gap-1 flex-1"><Edit2 size={12}/>Upravit</Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(detailEquipment.id)}><Trash2 size={12}/></Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Edit modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Upravit vybavení' : 'Nové vybavení'} wide
        footer={<><Button onClick={() => setModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSave}>Uložit</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Název *" className="sm:col-span-2"><Input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Sekačka Honda HRX 537"/></FormField>
          <FormField label="Ikona (emoji)"><Input value={form.icon} onChange={e => setForm(f => ({...f, icon:e.target.value}))} placeholder="🚜" maxLength={2}/></FormField>
          <FormField label="Kategorie"><Select value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>{equipmentCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</Select></FormField>
          <FormField label="Stav"><Select value={form.condition} onChange={e => setForm(f => ({...f, condition:e.target.value}))}>{equipmentConditions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</Select></FormField>
          <FormField label="Umístění"><Select value={form.location} onChange={e => setForm(f => ({...f, location:e.target.value}))}>{equipmentLocations.map(l => <option key={l.id} value={l.id}>{l.icon} {l.label}</option>)}</Select></FormField>
          <FormField label="Značka"><Input value={form.brand} onChange={e => setForm(f => ({...f, brand:e.target.value}))} placeholder="Honda"/></FormField>
          <FormField label="Model"><Input value={form.model} onChange={e => setForm(f => ({...f, model:e.target.value}))} placeholder="HRX 537"/></FormField>
          <FormField label="Sériové číslo" className="sm:col-span-2"><Input value={form.serial} onChange={e => setForm(f => ({...f, serial:e.target.value}))} placeholder="HRX537-2019-1234"/></FormField>
          <FormField label="Datum pořízení"><Input type="date" value={form.purchaseDate || ''} onChange={e => setForm(f => ({...f, purchaseDate:e.target.value}))}/></FormField>
          <FormField label="Přiřazeno"><Select value={form.assignedTo || ''} onChange={e => setForm(f => ({...f, assignedTo:e.target.value}))}><option value="">— Společné —</option>{workers.filter(w => w.active).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField>
          <FormField label="Poznámka" className="sm:col-span-2"><Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Servis 1× ročně..."/></FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteEquipment(deleteId); setDetailId(null); toast('Vybavení smazáno', 'warning') }}
        title="Smazat vybavení?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
