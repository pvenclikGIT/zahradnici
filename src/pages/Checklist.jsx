import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency } from '../data'
import { Card, CardContent, CardHeader, CardTitle, Button, Select, toast } from '../components/ui'
import { Play, Pause, RotateCcw, Camera, AlertTriangle, CheckSquare, Minus, Plus } from 'lucide-react'
import { cn } from '../lib/utils'

export function Checklist() {
  const { clients, orders, services, addOrder } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('order') ? parseInt(searchParams.get('order')) : null
  const preOrder = orderId ? orders.find(o => o.id === orderId) : null
  const preClient = preOrder ? clients.find(c => c.id === preOrder.clientId) : null

  const [clientId, setClientId] = useState(preClient?.id || '')
  const [checked, setChecked] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState([])
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
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
    if (running) { timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000) }
    else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [running])

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const toggle = id => {
    setChecked(c => ({ ...c, [id]: !c[id] }))
    if (!quantities[id]) setQuantities(q => ({ ...q, [id]: 100 }))
  }
  const changeQty = (id, delta) => setQuantities(q => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }))

  const selected = services.filter(s => checked[s.id])
  const total = selected.reduce((s, svc) => s + (quantities[svc.id] || 0) * svc.pricePerUnit, 0)
  const activeClient = clients.find(c => c.id === parseInt(clientId))

  function complete() {
    if (!clientId) { toast('Vyberte klienta', 'error'); return }
    if (!selected.length) { toast('Vyberte alespoň jednu práci', 'error'); return }
    addOrder({ clientId: parseInt(clientId), date: new Date().toISOString().split('T')[0], status: 'completed', services: selected.map(s => s.name), duration: Math.round(seconds/60), totalPrice: total, paid: false, notes, photos, worker: 'Jan Novák' })
    toast('Zakázka dokončena! Přesměrování na fakturace…', 'success')
    setTimeout(() => navigate('/invoices'), 1500)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Client selector */}
      <Card>
        <CardContent className="p-6">
          {preClient ? (
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-lg font-bold text-green-700">
                {preClient.name.split(' ').map(n => n[0]).join('').slice(0,2)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Aktivní zakázka</p>
                <p className="text-xl font-bold tracking-tight">{preClient.name}</p>
                <p className="text-sm text-muted-foreground">{preClient.address}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Vyberte klienta pro dnešní zakázku</p>
              <Select value={clientId} onChange={e => setClientId(e.target.value)} className="max-w-sm">
                <option value="">— Vyberte klienta —</option>
                {clients.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.id}>{c.name} · {c.address}</option>)}
              </Select>
            </div>
          )}
          {activeClient?.notes && (
            <div className="flex gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900">{activeClient.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer */}
      <Card>
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Čas na zakázce</p>
            <p className="text-4xl font-bold tracking-tight font-mono text-primary">{fmt(seconds)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant={running ? 'secondary' : 'primary'} onClick={() => setRunning(r => !r)} className="gap-2">
              {running ? <><Pause size={14} />Pauza</> : <><Play size={14} />Start</>}
            </Button>
            <Button onClick={() => { setRunning(false); setSeconds(0) }} className="gap-2"><RotateCcw size={14} />Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Provedené práce</CardTitle>
          <span className="text-xs text-muted-foreground">{selected.length} vybráno</span>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map(s => (
              <div
                key={s.id}
                onClick={() => toggle(s.id)}
                className={cn(
                  'relative p-4 rounded-xl border-2 cursor-pointer transition-all select-none',
                  checked[s.id] ? 'border-primary bg-green-50' : 'border-border hover:border-green-200 hover:bg-green-25'
                )}
              >
                {checked[s.id] && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckSquare size={11} className="text-white" />
                  </span>
                )}
                <p className="font-semibold text-sm mb-0.5">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.pricePerUnit} Kč / {s.unit}</p>
                {checked[s.id] && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-green-200" onClick={e => e.stopPropagation()}>
                    <button onClick={() => changeQty(s.id, -10)} className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Minus size={12} /></button>
                    <input
                      type="number"
                      value={quantities[s.id] || 0}
                      onChange={e => setQuantities(q => ({ ...q, [s.id]: parseInt(e.target.value) || 0 }))}
                      className="w-16 text-center border border-input rounded-lg py-1 text-sm font-bold focus:outline-none focus:border-primary"
                    />
                    <span className="text-xs text-muted-foreground">{s.unit}</span>
                    <button onClick={() => changeQty(s.id, 10)} className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Plus size={12} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">Poznámky k zakázce</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Popis provedené práce, co je třeba příště udělat…"
            className="w-full min-h-[80px] border border-input rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary resize-y"
          />
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-3">Fotodokumentace</p>
          <div className="grid grid-cols-2 gap-3">
            {['before', 'after'].map(type => (
              <button key={type} onClick={() => { setPhotos(p => [...p, { type, time: new Date().toLocaleTimeString('cs-CZ', { hour:'2-digit', minute:'2-digit' }) }]); toast(`Foto ${type === 'before' ? 'PŘED' : 'PO'} přidáno`) }}
                className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-green-25 transition-all">
                <Camera size={20} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">{type === 'before' ? 'Foto PŘED' : 'Foto PO'}</span>
              </button>
            ))}
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {photos.map((p, i) => (
                <div key={i} className="px-3 py-1.5 bg-muted rounded-lg text-xs font-medium">
                  {p.type === 'before' ? 'PŘED' : 'PO'} · {p.time}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {selected.length > 0 && (
        <Card className="bg-gray-900 border-gray-900 text-white">
          <CardContent className="p-6">
            <p className="text-sm font-semibold text-white/70 mb-4">Souhrn zakázky</p>
            <div className="space-y-2 mb-4">
              {selected.map(s => {
                const qty = quantities[s.id] || 0
                return (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span className="text-white/70">{s.name} · {qty} {s.unit}</span>
                    <span className="font-semibold">{formatCurrency(qty * s.pricePerUnit)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mb-5">
              <span className="font-semibold text-white/80">CELKEM</span>
              <span className="text-2xl font-bold text-green-400 tracking-tight">{formatCurrency(total)}</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="primary" size="lg" onClick={complete} className="flex-1 bg-green-500 hover:bg-green-400 border-green-400 gap-2">
                <CheckSquare size={16} /> Dokončit zakázku
              </Button>
              <Button size="sm" onClick={() => navigate('/invoices')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2">
                Jen faktura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
