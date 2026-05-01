import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { vehicleTypes, formatCurrency, formatDate } from '../data'
import {
  Card, CardContent, Button, Input, Select, StatCard, EmptyState,
  Dialog, FormField, Textarea, ConfirmDialog, toast, PillTabs
} from '../components/ui'
import {
  Plus, Search, Truck, Edit2, Trash2, X, Fuel, Gauge,
  Calendar as CalIcon, ChevronRight, Route, AlertCircle, MapPin
} from 'lucide-react'
import { cn } from '../lib/utils'

const emptyVehicle = {
  name:'', type:'van', plate:'', year:2024, currentKm:0,
  fuelType:'diesel', avgConsumption:8, insurance:'', insuranceExpiry:'',
  inspection:'', assignedTo:'', notes:''
}

const emptyTrip = {
  vehicleId:'', driverId:'', date: new Date().toISOString().split('T')[0],
  startKm:'', endKm:'', distance:0, purpose:'', clientId:'', notes:''
}

const emptyRefuel = {
  vehicleId:'', date: new Date().toISOString().split('T')[0],
  liters:'', pricePerL:'', total:0, km:'', station:'', notes:''
}

export function Vehicles() {
  const { vehicles, trips, refuels, workers, clients, addVehicle, updateVehicle, deleteVehicle, addTrip, deleteTrip, addRefuel, deleteRefuel } = useApp()

  const [activeTab, setActiveTab] = useState('vehicles')
  const [vehicleModal, setVehicleModal] = useState(false)
  const [tripModal, setTripModal]       = useState(false)
  const [refuelModal, setRefuelModal]   = useState(false)
  const [editingId, setEditingId]       = useState(null)
  const [vehForm, setVehForm]   = useState(emptyVehicle)
  const [tripForm, setTripForm] = useState(emptyTrip)
  const [refuelForm, setRefuelForm] = useState(emptyRefuel)
  const [vehDetail, setVehDetail] = useState(null)
  const [delVeh, setDelVeh] = useState(null)

  // ── Stats ──
  const totalKm = vehicles.reduce((s,v) => s + (v.currentKm || 0), 0)
  const monthTrips = trips.filter(t => {
    const d = new Date(t.date), n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  })
  const monthDistance = monthTrips.reduce((s,t) => s + (t.distance || 0), 0)
  const monthFuel = refuels.filter(r => {
    const d = new Date(r.date), n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  }).reduce((s,r) => s + (r.total || 0), 0)
  const expiringDocs = vehicles.filter(v => {
    const days = v.insuranceExpiry ? Math.ceil((new Date(v.insuranceExpiry) - new Date()) / 86400000) : 999
    const insp = v.inspection ? Math.ceil((new Date(v.inspection) - new Date()) / 86400000) : 999
    return days <= 30 || insp <= 30
  })

  // ── Vehicle handlers ──
  function openNewVehicle() { setEditingId(null); setVehForm(emptyVehicle); setVehicleModal(true) }
  function openEditVehicle(v) { setEditingId(v.id); setVehForm({...v, year:String(v.year), currentKm:String(v.currentKm), avgConsumption:String(v.avgConsumption)}); setVehDetail(null); setVehicleModal(true) }
  function saveVehicle() {
    if (!vehForm.name?.trim()) { toast('Vyplňte název', 'error'); return }
    if (!vehForm.plate?.trim()) { toast('Vyplňte SPZ', 'error'); return }
    const data = {
      ...vehForm,
      year: parseInt(vehForm.year) || new Date().getFullYear(),
      currentKm: parseInt(vehForm.currentKm) || 0,
      avgConsumption: parseFloat(vehForm.avgConsumption) || 0,
      assignedTo: vehForm.assignedTo ? parseInt(vehForm.assignedTo) : null,
    }
    if (editingId) { updateVehicle({...data, id:editingId}); toast('Vozidlo upraveno') }
    else { addVehicle(data); toast('Vozidlo přidáno') }
    setVehicleModal(false)
  }

  function openNewTrip() { setTripForm({...emptyTrip, vehicleId: vehicles[0]?.id || ''}); setTripModal(true) }
  function saveTrip() {
    if (!tripForm.vehicleId) { toast('Vyberte vozidlo', 'error'); return }
    const startKm = parseInt(tripForm.startKm) || 0
    const endKm = parseInt(tripForm.endKm) || 0
    if (endKm <= startKm) { toast('Konečný stav km musí být vyšší', 'error'); return }
    addTrip({
      ...tripForm,
      vehicleId: parseInt(tripForm.vehicleId),
      driverId: tripForm.driverId ? parseInt(tripForm.driverId) : null,
      clientId: tripForm.clientId ? parseInt(tripForm.clientId) : null,
      startKm, endKm,
      distance: endKm - startKm,
      fuelCost: 0,
    })
    // Update vehicle current km
    const v = vehicles.find(x => x.id === parseInt(tripForm.vehicleId))
    if (v && endKm > v.currentKm) {
      updateVehicle({...v, currentKm:endKm})
    }
    toast('Jízda zaznamenána')
    setTripModal(false)
  }

  function openNewRefuel() { setRefuelForm({...emptyRefuel, vehicleId: vehicles[0]?.id || ''}); setRefuelModal(true) }
  function saveRefuel() {
    if (!refuelForm.vehicleId) { toast('Vyberte vozidlo', 'error'); return }
    const liters = parseFloat(refuelForm.liters) || 0
    const pricePerL = parseFloat(refuelForm.pricePerL) || 0
    const total = parseInt(refuelForm.total) || Math.round(liters * pricePerL)
    addRefuel({
      ...refuelForm,
      vehicleId: parseInt(refuelForm.vehicleId),
      liters, pricePerL, total,
      km: parseInt(refuelForm.km) || 0,
    })
    toast('Tankování zaznamenáno')
    setRefuelModal(false)
  }

  function getVehicle(id) { return vehicles.find(v => v.id === id) }
  function getWorker(id) { return workers.find(w => w.id === id) }
  function getClient(id) { return clients.find(c => c.id === id) }

  const detailVehicle = vehicles.find(v => v.id === vehDetail)
  const vehicleTrips = vehDetail ? trips.filter(t => t.vehicleId === vehDetail).sort((a,b) => new Date(b.date)-new Date(a.date)) : []
  const vehicleRefuels = vehDetail ? refuels.filter(r => r.vehicleId === vehDetail).sort((a,b) => new Date(b.date)-new Date(a.date)) : []

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Vozidel" value={vehicles.length} sub="ve flotile" icon={Truck}/>
        <StatCard label="Tento měsíc — km" value={`${monthDistance} km`} sub={`${monthTrips.length} jízd`} icon={Route}/>
        <StatCard label="Náklady na palivo" value={formatCurrency(monthFuel)} sub="tento měsíc" icon={Fuel}/>
        <StatCard label="Vyprší dokumenty" value={expiringDocs.length} sub="do 30 dnů" icon={AlertCircle} color={expiringDocs.length>0?'text-amber-600':undefined}/>
      </div>

      <div className="flex flex-wrap gap-2">
        <PillTabs
          tabs={[
            { value:'vehicles', label:'Vozidla',     count:vehicles.length },
            { value:'trips',    label:'Jízdy',       count:trips.length },
            { value:'refuels',  label:'Tankování',   count:refuels.length },
          ]}
          active={activeTab} onChange={setActiveTab}
        />
        <div className="ml-auto flex gap-2">
          {activeTab === 'vehicles' && <Button variant="primary" size="sm" onClick={openNewVehicle} className="gap-1"><Plus size={14}/>Vozidlo</Button>}
          {activeTab === 'trips'    && <Button variant="primary" size="sm" onClick={openNewTrip} className="gap-1"><Plus size={14}/>Jízda</Button>}
          {activeTab === 'refuels'  && <Button variant="primary" size="sm" onClick={openNewRefuel} className="gap-1"><Plus size={14}/>Tankování</Button>}
        </div>
      </div>

      {/* Vehicles tab */}
      {activeTab === 'vehicles' && (
        vehicles.length === 0 ? (
          <EmptyState icon={Truck} title="Žádná vozidla" action={<Button variant="primary" size="sm" onClick={openNewVehicle}><Plus size={14}/>Přidat vozidlo</Button>}/>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {vehicles.map(v => {
              const driver = getWorker(v.assignedTo)
              const insDays = v.insuranceExpiry ? Math.ceil((new Date(v.insuranceExpiry)-new Date())/86400000) : 999
              const inspDays = v.inspection ? Math.ceil((new Date(v.inspection)-new Date())/86400000) : 999
              const type = vehicleTypes.find(t => t.id === v.type)
              return (
                <Card key={v.id} onClick={() => setVehDetail(v.id)}
                  className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Truck size={20} className="text-primary"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold tracking-tight truncate">{v.name}</p>
                        <p className="text-xs text-muted-foreground">{v.plate} · {type?.label} · {v.year}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-border my-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stav km</p>
                        <p className="font-bold text-sm">{v.currentKm.toLocaleString('cs-CZ')} km</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spotřeba</p>
                        <p className="font-bold text-sm">{v.avgConsumption} l/100km</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      {driver ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{backgroundColor:driver.color}}>{driver.initials}</span>
                          <span className="font-medium truncate">{driver.name}</span>
                        </span>
                      ) : <span className="text-muted-foreground">Nepřiřazen</span>}
                      {(insDays <= 30 || inspDays <= 30) && (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <AlertCircle size={11}/>
                          {insDays <= 30 ? `Pojištění za ${insDays}d` : `STK za ${inspDays}d`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Trips tab */}
      {activeTab === 'trips' && (
        trips.length === 0 ? (
          <EmptyState icon={Route} title="Žádné jízdy" action={<Button variant="primary" size="sm" onClick={openNewTrip}><Plus size={14}/>Zaznamenat jízdu</Button>}/>
        ) : (
          <div className="space-y-2">
            {[...trips].sort((a,b) => new Date(b.date) - new Date(a.date)).map(t => {
              const v = getVehicle(t.vehicleId)
              const driver = getWorker(t.driverId)
              const client = getClient(t.clientId)
              return (
                <Card key={t.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <Route size={16} className="text-blue-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.purpose || 'Jízda'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {v?.name} · {formatDate(t.date)}
                        {driver && ` · ${driver.name}`}
                        {client && ` · ${client.name}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{t.distance} km</p>
                      <p className="text-[10px] text-muted-foreground">{t.startKm} → {t.endKm}</p>
                    </div>
                    <button onClick={() => deleteTrip(t.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 flex-shrink-0"><X size={14}/></button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Refuels tab */}
      {activeTab === 'refuels' && (
        refuels.length === 0 ? (
          <EmptyState icon={Fuel} title="Žádná tankování" action={<Button variant="primary" size="sm" onClick={openNewRefuel}><Plus size={14}/>Zaznamenat</Button>}/>
        ) : (
          <div className="space-y-2">
            {[...refuels].sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => {
              const v = getVehicle(r.vehicleId)
              return (
                <Card key={r.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      <Fuel size={16} className="text-amber-600"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{v?.name} — {r.liters} l</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {formatDate(r.date)} · {r.station} · {r.km.toLocaleString('cs-CZ')} km
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{formatCurrency(r.total)}</p>
                      <p className="text-[10px] text-muted-foreground">{r.pricePerL} Kč/l</p>
                    </div>
                    <button onClick={() => deleteRefuel(r.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 flex-shrink-0"><X size={14}/></button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Vehicle detail */}
      {detailVehicle && (() => {
        const driver = getWorker(detailVehicle.assignedTo)
        const totalRefuelCost = vehicleRefuels.reduce((s,r) => s+r.total, 0)
        const totalDistance = vehicleTrips.reduce((s,t) => s+t.distance, 0)
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setVehDetail(null)}>
            <div className="absolute inset-0 bg-black/60"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-lg sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)'}}>
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                <div>
                  <p className="font-bold">{detailVehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{detailVehicle.plate}</p>
                </div>
                <button onClick={() => setVehDetail(null)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-accent"><X size={14}/></button>
              </div>
              <div className="overflow-y-auto overscroll-contain flex-1">
                <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
                  <div className="bg-muted/40 rounded-xl p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stav km</p><p className="font-bold">{detailVehicle.currentKm.toLocaleString('cs-CZ')}</p></div>
                  <div className="bg-muted/40 rounded-xl p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spotřeba</p><p className="font-bold">{detailVehicle.avgConsumption} l/100km</p></div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3"><p className="text-[10px] text-blue-700 uppercase tracking-wider">Najeto celkem</p><p className="font-bold">{totalDistance} km</p></div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><p className="text-[10px] text-amber-700 uppercase tracking-wider">Náklady palivo</p><p className="font-bold">{formatCurrency(totalRefuelCost)}</p></div>
                </div>

                <div className="px-5 py-4 border-b border-border space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Dokumenty a údaje</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Pojištění</div><div className="font-medium text-right">{detailVehicle.insurance || '—'}</div>
                    <div className="text-muted-foreground">Plat. do</div><div className="font-medium text-right">{detailVehicle.insuranceExpiry ? formatDate(detailVehicle.insuranceExpiry) : '—'}</div>
                    <div className="text-muted-foreground">STK</div><div className="font-medium text-right">{detailVehicle.inspection ? formatDate(detailVehicle.inspection) : '—'}</div>
                    <div className="text-muted-foreground">Řidič</div><div className="font-medium text-right">{driver?.name || '—'}</div>
                  </div>
                </div>

                {vehicleTrips.length > 0 && (
                  <div className="px-5 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Posledních {Math.min(5, vehicleTrips.length)} jízd</p>
                    <div className="space-y-1.5">
                      {vehicleTrips.slice(0,5).map(t => (
                        <div key={t.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded-lg">
                          <div className="min-w-0"><p className="font-medium truncate">{t.purpose}</p><p className="text-[10px] text-muted-foreground">{formatDate(t.date)}</p></div>
                          <p className="font-bold flex-shrink-0">{t.distance} km</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {vehicleRefuels.length > 0 && (
                  <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Posledních {Math.min(5, vehicleRefuels.length)} tankování</p>
                    <div className="space-y-1.5">
                      {vehicleRefuels.slice(0,5).map(r => (
                        <div key={r.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded-lg">
                          <div className="min-w-0"><p className="font-medium">{r.liters} l · {r.station}</p><p className="text-[10px] text-muted-foreground">{formatDate(r.date)}</p></div>
                          <p className="font-bold flex-shrink-0">{formatCurrency(r.total)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border flex flex-wrap gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
                <Button size="sm" onClick={() => openEditVehicle(detailVehicle)} className="gap-1 flex-1"><Edit2 size={12}/>Upravit</Button>
                <Button variant="danger" size="sm" onClick={() => setDelVeh(detailVehicle.id)}><Trash2 size={12}/></Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Vehicle Form Modal */}
      <Dialog open={vehicleModal} onClose={() => setVehicleModal(false)} title={editingId?'Upravit vozidlo':'Nové vozidlo'} wide
        footer={<><Button onClick={() => setVehicleModal(false)}>Zrušit</Button><Button variant="primary" onClick={saveVehicle}>Uložit</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Název *" className="sm:col-span-2"><Input value={vehForm.name} onChange={e => setVehForm(f => ({...f, name:e.target.value}))} placeholder="Ford Transit 2.0"/></FormField>
          <FormField label="Typ"><Select value={vehForm.type} onChange={e => setVehForm(f => ({...f, type:e.target.value}))}>{vehicleTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</Select></FormField>
          <FormField label="SPZ *"><Input value={vehForm.plate} onChange={e => setVehForm(f => ({...f, plate:e.target.value}))} placeholder="2AB 1234"/></FormField>
          <FormField label="Rok výroby"><Input type="number" inputMode="numeric" value={vehForm.year} onChange={e => setVehForm(f => ({...f, year:e.target.value}))}/></FormField>
          <FormField label="Stav km"><Input type="number" inputMode="numeric" value={vehForm.currentKm} onChange={e => setVehForm(f => ({...f, currentKm:e.target.value}))}/></FormField>
          <FormField label="Pohon"><Select value={vehForm.fuelType} onChange={e => setVehForm(f => ({...f, fuelType:e.target.value}))}><option value="diesel">Nafta</option><option value="petrol">Benzin</option><option value="electric">Elektro</option><option value="hybrid">Hybrid</option></Select></FormField>
          <FormField label="Spotřeba (l/100km)"><Input type="number" inputMode="decimal" value={vehForm.avgConsumption} onChange={e => setVehForm(f => ({...f, avgConsumption:e.target.value}))}/></FormField>
          <FormField label="Pojišťovna"><Input value={vehForm.insurance} onChange={e => setVehForm(f => ({...f, insurance:e.target.value}))} placeholder="Allianz"/></FormField>
          <FormField label="Pojištění platné do"><Input type="date" value={vehForm.insuranceExpiry} onChange={e => setVehForm(f => ({...f, insuranceExpiry:e.target.value}))}/></FormField>
          <FormField label="STK do"><Input type="date" value={vehForm.inspection} onChange={e => setVehForm(f => ({...f, inspection:e.target.value}))}/></FormField>
          <FormField label="Hlavní řidič" className="sm:col-span-2"><Select value={vehForm.assignedTo} onChange={e => setVehForm(f => ({...f, assignedTo:e.target.value}))}><option value="">— Nepřiřazen —</option>{workers.filter(w=>w.active).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField>
          <FormField label="Poznámka" className="sm:col-span-2"><Textarea value={vehForm.notes} onChange={e => setVehForm(f => ({...f, notes:e.target.value}))}/></FormField>
        </div>
      </Dialog>

      {/* Trip Modal */}
      <Dialog open={tripModal} onClose={() => setTripModal(false)} title="Zaznamenat jízdu" wide
        footer={<><Button onClick={() => setTripModal(false)}>Zrušit</Button><Button variant="primary" onClick={saveTrip}>Uložit jízdu</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Vozidlo *"><Select value={tripForm.vehicleId} onChange={e => setTripForm(f => ({...f, vehicleId:e.target.value}))}><option value="">— Vyberte —</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}</Select></FormField>
          <FormField label="Datum"><Input type="date" value={tripForm.date} onChange={e => setTripForm(f => ({...f, date:e.target.value}))}/></FormField>
          <FormField label="Řidič"><Select value={tripForm.driverId} onChange={e => setTripForm(f => ({...f, driverId:e.target.value}))}><option value="">— Vyberte —</option>{workers.filter(w=>w.active).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField>
          <FormField label="Klient"><Select value={tripForm.clientId} onChange={e => setTripForm(f => ({...f, clientId:e.target.value}))}><option value="">— Žádný —</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
          <FormField label="Stav km — start *"><Input type="number" inputMode="numeric" value={tripForm.startKm} onChange={e => setTripForm(f => ({...f, startKm:e.target.value}))}/></FormField>
          <FormField label="Stav km — konec *"><Input type="number" inputMode="numeric" value={tripForm.endKm} onChange={e => setTripForm(f => ({...f, endKm:e.target.value}))}/></FormField>
          <FormField label="Účel jízdy" className="sm:col-span-2"><Input value={tripForm.purpose} onChange={e => setTripForm(f => ({...f, purpose:e.target.value}))} placeholder="Klient Šimánek + nákup AGRO CS"/></FormField>
          <FormField label="Poznámka" className="sm:col-span-2"><Textarea value={tripForm.notes} onChange={e => setTripForm(f => ({...f, notes:e.target.value}))}/></FormField>
        </div>
      </Dialog>

      {/* Refuel Modal */}
      <Dialog open={refuelModal} onClose={() => setRefuelModal(false)} title="Zaznamenat tankování" wide
        footer={<><Button onClick={() => setRefuelModal(false)}>Zrušit</Button><Button variant="primary" onClick={saveRefuel}>Uložit</Button></>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Vozidlo *"><Select value={refuelForm.vehicleId} onChange={e => setRefuelForm(f => ({...f, vehicleId:e.target.value}))}><option value="">— Vyberte —</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}</Select></FormField>
          <FormField label="Datum"><Input type="date" value={refuelForm.date} onChange={e => setRefuelForm(f => ({...f, date:e.target.value}))}/></FormField>
          <FormField label="Litry *"><Input type="number" inputMode="decimal" value={refuelForm.liters} onChange={e => setRefuelForm(f => ({...f, liters:e.target.value}))} placeholder="42.5"/></FormField>
          <FormField label="Cena/litr"><Input type="number" inputMode="decimal" value={refuelForm.pricePerL} onChange={e => setRefuelForm(f => ({...f, pricePerL:e.target.value}))} placeholder="43.5"/></FormField>
          <FormField label="Celkem (Kč)"><Input type="number" inputMode="numeric" value={refuelForm.total} onChange={e => setRefuelForm(f => ({...f, total:e.target.value}))} placeholder="1849"/></FormField>
          <FormField label="Stav km"><Input type="number" inputMode="numeric" value={refuelForm.km} onChange={e => setRefuelForm(f => ({...f, km:e.target.value}))}/></FormField>
          <FormField label="Čerpací stanice" className="sm:col-span-2"><Input value={refuelForm.station} onChange={e => setRefuelForm(f => ({...f, station:e.target.value}))} placeholder="OMV Říčany"/></FormField>
        </div>
      </Dialog>

      <ConfirmDialog open={!!delVeh} onClose={() => setDelVeh(null)}
        onConfirm={() => { deleteVehicle(delVeh); setVehDetail(null); toast('Vozidlo smazáno', 'warning') }}
        title="Smazat vozidlo?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
