import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, Select, toast } from '../components/ui'
import { Play, Pause, RotateCcw, Camera, AlertTriangle, CheckSquare, Minus, Plus, ArrowRight, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

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
  const timerRef = useRef(null)

  useEffect(() => {
    if (preOrder) {
      const init = {}; const qinit = {}
      preOrder.services.forEach(name => {
        const svc = services.find(s => s.name === name)
        if (svc) { init[svc.id] = true; qinit[svc.id] = 100 }
      })
      setChecked(init); setQuantities(qinit)
    }
  }, [])

  useEffect(() => {
    if (running) timerRef.current = setInterval(() => setSeconds(s => s+1), 1000)
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
  const total = selected.reduce((s, svc) => s + (quantities[svc.id]||0) * svc.pricePerUnit, 0)
  const activeClient = clients.find(c => c.id === parseInt(clientId))

  function complete() {
    if (!clientId) { toast('Vyberte klienta', 'error'); return }
    if (!selected.length) { toast('Vyberte alespoň jednu práci', 'error'); return }

    const newOrder = {
      clientId: parseInt(clientId),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      services: selected.map(s => s.name),
      serviceDetails: selected.map(s => ({ name: s.name, qty: quantities[s.id]||0, unit: s.unit, pricePerUnit: s.pricePerUnit, total: (quantities[s.id]||0)*s.pricePerUnit })),
      duration: Math.round(seconds/60),
      totalPrice: total,
      paid: false,
      notes,
      photos,
      worker: 'Jan Novák'
    }
    addOrder(newOrder)

    // Auto-create invoice
    const invId = nextInvoiceNum()
    const today = new Date().toISOString().split('T')[0]
    const dueDate = new Date(Date.now() + 14*24*3600*1000).toISOString().split('T')[0]
    addInvoice({
      id: invId,
      orderId: newOrder.id,
      clientId: parseInt(clientId),
      date: today,
      dueDate,
      amount: total,
      paid: false,
      paidDate: null,
      serviceDetails: newOrder.serviceDetails,
    })

    clearInterval(timerRef.current)
    setCompleted(true)
    toast(`✓ Zakázka dokončena! Faktura #${invId} vystavena automaticky.`, 'success')
    setTimeout(() => navigate(`/invoices`), 2000)
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckSquare size={36} className="text-green-600"/>
        </div>
        <h2 className="text-2xl font-bold mb-2">Zakázka dokončena!</h2>
        <p className="text-muted-foreground mb-2">Faktura byla automaticky vystavena.</p>
        <p className="text-3xl font-bold text-primary mb-6">{formatCurrency(total)}</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/invoices')}>Zobrazit fakturu <ArrowRight size={16}/></Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-safe">

      {/* Client selector */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {preClient ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-lg font-bold text-green-700 flex-shrink-0">
                {preClient.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">Aktivní zakázka</p>
                <p className="text-lg sm:text-xl font-bold tracking-tight truncate">{preClient.name}</p>
                <p className="text-sm text-muted-foreground truncate">{preClient.address}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Vyberte klienta</p>
              <Select value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">— Vyberte klienta —</option>
                {clients.filter(c=>c.status==='active').map(c => <option key={c.id} value={c.id}>{c.name} · {c.address}</option>)}
              </Select>
            </div>
          )}
          {activeClient?.notes && (
            <div className="flex gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0"/>
              <p className="text-sm text-amber-900">{activeClient.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer */}
      <Card>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><Clock size={10}/>Čas na zakázce</p>
            <p className={cn('text-3xl sm:text-4xl font-bold tracking-tight font-mono', running ? 'text-primary' : 'text-foreground')}>{fmt(seconds)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={running?'secondary':'primary'} size="lg" onClick={() => setRunning(r=>!r)} className="gap-2 min-w-[110px]">
              {running ? <><Pause size={16}/>Pauza</> : <><Play size={16}/>Start</>}
            </Button>
            <Button size="icon" onClick={() => { setRunning(false); setSeconds(0) }}><RotateCcw size={16}/></Button>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Provedené práce</CardTitle>
          <span className="text-sm text-muted-foreground font-medium">{selected.length} vybráno · {formatCurrency(total)}</span>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {services.map(s => (
              <div key={s.id} onClick={() => toggle(s.id)}
                className={cn('relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all select-none touch-manipulation active:scale-[0.98]',
                  checked[s.id] ? 'border-primary bg-green-50' : 'border-border hover:border-green-200 hover:bg-green-25'
                )}
              >
                {checked[s.id] && (
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-white"/>
                  </span>
                )}
                <p className="font-semibold text-sm mb-0.5 pr-6">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.pricePerUnit} Kč / {s.unit}</p>
                {checked[s.id] && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-200" onClick={e => e.stopPropagation()}>
                    <button onClick={() => changeQty(s.id,-10)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors touch-manipulation"><Minus size={13}/></button>
                    <input type="number" value={quantities[s.id]||0}
                      onChange={e => setQuantities(q => ({...q,[s.id]:parseInt(e.target.value)||0}))}
                      className="w-16 text-center border border-input rounded-lg py-1 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">{s.unit}</span>
                    <button onClick={() => changeQty(s.id,10)} className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors touch-manipulation"><Plus size={13}/></button>
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
            className="w-full min-h-[80px] border border-input rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary resize-y"
          />
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <p className="text-sm font-semibold mb-3">Fotodokumentace</p>
          <div className="grid grid-cols-2 gap-3">
            {['before','after'].map(type => (
              <button key={type} onClick={() => { setPhotos(p => [...p,{type,time:new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit'})}]); toast(`Foto ${type==='before'?'PŘED':'PO'} přidáno`) }}
                className="flex flex-col items-center gap-2 py-5 sm:py-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-green-25 transition-all touch-manipulation active:scale-[0.98]">
                <Camera size={20} className="text-muted-foreground"/>
                <span className="text-xs font-semibold text-muted-foreground">Foto {type==='before'?'PŘED':'PO'}</span>
                {photos.filter(p=>p.type===type).length>0 && (
                  <span className="text-[10px] text-primary font-bold">{photos.filter(p=>p.type===type).length}× přidáno</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary & Complete */}
      {selected.length > 0 && (
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-semibold text-white/60 mb-4">Souhrn zakázky</p>
            <div className="space-y-2 mb-4">
              {selected.map(s => {
                const qty = quantities[s.id]||0
                return (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{s.name} · {qty} {s.unit}</span>
                    <span className="font-semibold text-white">{formatCurrency(qty*s.pricePerUnit)}</span>
                  </div>
                )
              })}
              {seconds > 0 && <div className="flex justify-between text-sm"><span className="text-white/60">Čas</span><span className="text-white/60">{fmt(seconds)}</span></div>}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mb-5">
              <span className="font-semibold text-white/80 text-sm">CELKEM</span>
              <span className="text-2xl sm:text-3xl font-bold text-green-400 tracking-tight">{formatCurrency(total)}</span>
            </div>
            <Button variant="primary" size="xl" onClick={complete} className="w-full bg-green-500 hover:bg-green-400 border-green-400 gap-2">
              <CheckSquare size={18}/> Dokončit a vystavit fakturu
            </Button>
            <p className="text-center text-xs text-white/40 mt-3">Faktura se vystaví automaticky</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Check({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 6l3 3 5-5"/>
    </svg>
  )
}
