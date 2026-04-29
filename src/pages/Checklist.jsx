import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, orderTemplates } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, Select, toast, Dialog } from '../components/ui'
import { Play, Pause, RotateCcw, Camera, AlertTriangle, CheckSquare, Minus, Plus, Clock, ArrowRight, Layers, MapPin } from 'lucide-react'
import { cn } from '../lib/utils'

function CheckIcon({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5"/>
    </svg>
  )
}

export function Checklist() {
  const { clients, orders, services, addOrder, addInvoice, nextInvoiceNum } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('order') ? parseInt(searchParams.get('order')) : null
  const preOrder = orderId ? orders.find(o => o.id === orderId) : null
  const preClient = preOrder ? clients.find(c => c.id === preOrder.clientId) : null

  const [clientId, setClientId] = useState(preClient?.id || '')
  const [checked, setChecked] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState(preOrder?.notes || '')
  const [photos, setPhotos] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const timerRef = useRef()

  const activeClient = clients.find(c => c.id === parseInt(clientId))

  // Pre-fill from order
  useEffect(() => {
    if (preOrder) {
      const init = {}, qinit = {}
      preOrder.services.forEach(name => {
        const svc = services.find(s => s.name === name)
        if (svc) { init[svc.id] = true; qinit[svc.id] = 100 }
      })
      setChecked(init); setQuantities(qinit)
    }
  }, [])

  // Predict services from client history when client selected
  useEffect(() => {
    if (!clientId || preOrder) return
    const clientOrders = orders.filter(o => o.clientId === parseInt(clientId))
    if (!clientOrders.length) return
    // Count most used services
    const counts = {}
    clientOrders.forEach(o => o.services.forEach(s => { counts[s] = (counts[s]||0)+1 }))
    const topServices = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([s])=>s)
    if (topServices.length) {
      const init = {}, qinit = {}
      topServices.forEach(name => {
        const svc = services.find(s=>s.name===name)
        if (svc) { init[svc.id]=true; qinit[svc.id]=100 }
      })
      setChecked(init); setQuantities(qinit)
      toast('Predikce: předvyplněny nejčastější služby klienta', 'info')
    }
  }, [clientId])

  // Timer
  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setSeconds(s=>s+1), 1000)
    else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [running])

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const toggle = id => {
    setChecked(c => ({ ...c, [id]: !c[id] }))
    if (!quantities[id]) setQuantities(q => ({ ...q, [id]: 100 }))
  }
  const changeQty = (id, delta) => setQuantities(q => ({ ...q, [id]: Math.max(0, (q[id]||0)+delta) }))

  const selected = services.filter(s => checked[s.id])
  const total = selected.reduce((s, svc) => s + (quantities[svc.id]||0)*svc.pricePerUnit, 0)

  function applyTemplate(tmpl) {
    const init = {}, qinit = {}
    tmpl.services.forEach(name => {
      const svc = services.find(s => s.name === name)
      if (svc) { init[svc.id]=true; qinit[svc.id]=100 }
    })
    setChecked(init); setQuantities(qinit)
    setShowTemplates(false)
    toast(`Šablona "${tmpl.name}" aplikována`)
  }

  function complete() {
    if (!clientId) { toast('Vyberte klienta', 'error'); return }
    if (!selected.length) { toast('Vyberte alespoň jednu práci', 'error'); return }
    clearInterval(timerRef.current)

    const newOrder = {
      clientId: parseInt(clientId),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      services: selected.map(s=>s.name),
      serviceDetails: selected.map(s=>({ name:s.name, qty:quantities[s.id]||0, unit:s.unit, pricePerUnit:s.pricePerUnit, total:(quantities[s.id]||0)*s.pricePerUnit })),
      duration: Math.round(seconds/60),
      totalPrice: total, paid:false, notes, photos, worker:'Jan Novák'
    }
    addOrder(newOrder)

    const invId = nextInvoiceNum()
    addInvoice({
      id: invId, orderId: newOrder.id, clientId: parseInt(clientId),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now()+14*24*3600*1000).toISOString().split('T')[0],
      amount: total, paid:false, paidDate:null,
      serviceDetails: newOrder.serviceDetails,
    })
    setCompleted(true)
    toast(`Zakázka dokončena! Faktura #${invId} vystavena.`, 'success')
    setTimeout(() => navigate('/invoices'), 2000)
  }

  const [repeatWeeks, setRepeatWeeks] = useState(null) // null = not decided

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckSquare size={36} className="text-green-600"/>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-1">Zakázka dokončena</h2>
        <p className="text-muted-foreground mb-1">Faktura byla automaticky vystavena.</p>
        <p className="text-3xl font-bold text-primary mb-6">{formatCurrency(total)}</p>

        {repeatWeeks === null && (
          <div className="w-full bg-muted/50 border border-border rounded-2xl p-5 mb-5 text-left">
            <p className="font-semibold text-sm mb-1">Přidat opakování?</p>
            <p className="text-xs text-muted-foreground mb-4">Chcete přidat stejnou zakázku pro příšte?</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[['14','Za 2 týdny'],['7','Za týden'],['21','Za 3 týdny'],['28','Za měsíc']].map(([w,l]) => (
                <button key={w} onClick={() => setRepeatWeeks(w)}
                  className="px-3 py-2 rounded-xl border-2 border-border hover:border-primary hover:bg-green-50 text-sm font-medium transition-all touch-manipulation text-center">
                  {l}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setRepeatWeeks('no')}>Ne, děkuji</Button>
          </div>
        )}

        {repeatWeeks && repeatWeeks !== 'no' && (
          <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 mb-5 text-sm text-green-800">
            Zakázka přidána za {repeatWeeks} dní do kalendáře.
          </div>
        )}

        <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/invoices')}>
          Zobrazit fakturu <ArrowRight size={16}/>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* Client */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          {preClient ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-base font-bold text-green-700 flex-shrink-0">
                {preClient.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Aktivní zakázka</p>
                <p className="text-lg font-bold tracking-tight truncate">{preClient.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 truncate"><MapPin size={11}/>{preClient.address}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Vyberte klienta</p>
                <Button size="sm" variant="ghost" onClick={() => setShowTemplates(true)} className="gap-1.5">
                  <Layers size={13}/>Šablona
                </Button>
              </div>
              <Select value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">— Vyberte klienta —</option>
                {clients.filter(c=>c.status==='active').map(c => (
                  <option key={c.id} value={c.id}>{c.name} · {c.city || c.address.split(',').pop()?.trim()}</option>
                ))}
              </Select>
              {activeClient && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={11}/>{activeClient.address}
                </div>
              )}
            </div>
          )}
          {activeClient?.notes && (
            <div className="flex gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0"/>
              <p className="text-sm text-amber-900 leading-snug">{activeClient.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template selector */}
      {showTemplates && (
        <Card>
          <CardHeader>
            <CardTitle>Vyberte šablonu prací</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowTemplates(false)}>Zavřít</Button>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orderTemplates.map(tmpl => (
                <button key={tmpl.id} onClick={() => applyTemplate(tmpl)}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary hover:bg-green-50 transition-all text-left touch-manipulation active:scale-[0.98]">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Layers size={14} className="text-green-700"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{tmpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tmpl.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer */}
      <Card>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
              <Clock size={10}/>Čas na zakázce
            </p>
            <p className={cn('text-3xl sm:text-4xl font-bold tracking-tight tabular-nums', running ? 'text-primary' : 'text-foreground')}>
              {fmt(seconds)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant={running ? 'secondary' : 'primary'} size="lg" onClick={() => setRunning(r=>!r)} className="gap-2 min-w-[110px]">
              {running ? <><Pause size={16}/>Pauza</> : <><Play size={16}/>Start</>}
            </Button>
            <Button size="icon" onClick={() => { setRunning(false); setSeconds(0) }}>
              <RotateCcw size={16}/>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Provedené práce</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{selected.length} vybráno</span>
            <Button size="sm" variant="ghost" onClick={() => setShowTemplates(!showTemplates)} className="gap-1.5">
              <Layers size={13}/>Šablona
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {services.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)}
                className={cn('relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all select-none touch-manipulation active:scale-[0.98]',
                  checked[s.id] ? 'border-primary bg-green-50' : 'border-border hover:border-green-300 bg-white'
                )}
              >
                {checked[s.id] && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckIcon size={10}/>
                  </span>
                )}
                <p className="font-semibold text-sm pr-7">{s.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.pricePerUnit} Kč / {s.unit}</p>
                {checked[s.id] && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-green-200" onClick={e=>e.stopPropagation()}>
                    <button onClick={() => changeQty(s.id,-10)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors touch-manipulation flex-shrink-0">
                      <Minus size={13}/>
                    </button>
                    <input type="number" value={quantities[s.id]||0}
                      onChange={e => setQuantities(q=>({...q,[s.id]:Math.max(0,parseInt(e.target.value)||0)}))}
                      className="w-16 text-center border border-input rounded-lg py-1.5 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">{s.unit}</span>
                    <button onClick={() => changeQty(s.id,10)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors touch-manipulation flex-shrink-0">
                      <Plus size={13}/>
                    </button>
                    <span className="ml-auto text-xs font-bold text-primary">{formatCurrency((quantities[s.id]||0)*s.pricePerUnit)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm font-semibold mb-3">Poznámky k zakázce</p>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)}
            placeholder="Popis provedené práce, co je třeba příště udělat…"
            className="w-full min-h-[80px] border border-input rounded-xl px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary resize-y leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm font-semibold mb-3">Fotodokumentace</p>
          <div className="grid grid-cols-2 gap-3">
            {['before','after'].map(type => (
              <button key={type}
                onClick={() => { setPhotos(p=>[...p,{type,time:new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}]); toast(`Foto ${type==='before'?'PRED':'PO'} pridano`) }}
                className="flex flex-col items-center gap-2 py-5 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-green-25 transition-all touch-manipulation active:scale-[0.98]">
                <Camera size={20} className="text-muted-foreground"/>
                <span className="text-xs font-semibold text-muted-foreground">{type==='before'?'Foto PRED':'Foto PO'}</span>
                {photos.filter(p=>p.type===type).length > 0 && (
                  <span className="text-[10px] font-bold text-primary">{photos.filter(p=>p.type===type).length}x pridano</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {selected.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Souhrn zakázky</p>
            <div className="space-y-2 mb-5">
              {selected.map(s => {
                const qty = quantities[s.id]||0
                return (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{s.name} · {qty} {s.unit}</span>
                    <span className="font-semibold text-white">{formatCurrency(qty*s.pricePerUnit)}</span>
                  </div>
                )
              })}
              {seconds > 0 && (
                <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                  <span className="text-white/50">Odpracovany cas</span>
                  <span className="text-white/50">{fmt(seconds)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mb-5">
              <span className="font-semibold text-white/80 text-sm uppercase tracking-wide">Celkem</span>
              <span className="text-2xl sm:text-3xl font-bold text-green-400 tracking-tight">{formatCurrency(total)}</span>
            </div>
            <Button variant="primary" size="xl" onClick={complete}
              className="w-full bg-green-500 hover:bg-green-400 border-green-400 shadow-lg shadow-green-900/30 gap-2">
              <CheckSquare size={18}/>Dokoncit a vystavit fakturu
            </Button>
            <p className="text-center text-xs text-white/30 mt-3">Faktura se vystavi automaticky</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
