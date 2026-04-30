import { useState } from 'react'
import { useApp } from '../hooks/useApp'
import { formatCurrency } from '../data'
import { cn } from '../lib/utils'
import { MapPin, X, Phone, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

// SVG map of Praha Vychod area — simplified dot map
// We place client dots relative to a bounding box
const BOUNDS = { 
  minLat: 49.90, maxLat: 50.22,
  minLng: 14.42, maxLng: 14.77
}

function latLngToPercent(lat, lng) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100
  return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) }
}

const tagColors = {
  'vip':        '#f59e0b',
  'firemní':    '#3b82f6',
  'pravidelný': '#22c55e',
  'nový':       '#0ea5e9',
  'jednorázový':'#94a3b8',
}

export function ClientMap({ onClose }) {
  const { clients, orders } = useApp()
  const [selected, setSelected] = useState(null)

  const activeClients = clients.filter(c => c.status === 'active' && c.lat && c.lng)

  function ClientPopup({ c }) {
    const clientOrders = orders.filter(o => o.clientId === c.id)
    const revenue = clientOrders.filter(o=>o.paid).reduce((s,o)=>s+o.totalPrice,0)
    return (
      <div className="absolute z-10 bg-white rounded-2xl shadow-2xl border border-border p-4 w-56"
        style={{ bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-bold text-sm leading-tight">{c.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.city}</p>
          </div>
          <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-accent flex-shrink-0">
            <X size={13} className="text-muted-foreground"/>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted rounded-lg p-2 text-center">
            <p className="font-bold text-sm">{clientOrders.length}</p>
            <p className="text-[10px] text-muted-foreground">Zakazek</p>
          </div>
          <div className="bg-muted rounded-lg p-2 text-center">
            <p className="font-bold text-xs">{formatCurrency(revenue)}</p>
            <p className="text-[10px] text-muted-foreground">Trzby</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${c.phone}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-1.5 h-8 bg-muted rounded-lg text-xs font-semibold hover:bg-accent transition-colors">
              <Phone size={12}/>Volat
            </button>
          </a>
          <Link to={`/orders?client=${c.id}&new=1`} className="flex-1" onClick={onClose}>
            <button className="w-full flex items-center justify-center gap-1.5 h-8 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
              <Plus size={12}/>Zakazka
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-2xl sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100dvh - 16px)', minHeight:'200px'}}>
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-bold tracking-tight">Mapa klientu</h2>
            <p className="text-xs text-muted-foreground">Praha Vychod · {activeClients.length} aktivnich klientu</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center hover:bg-accent touch-manipulation">
            <X size={15}/>
          </button>
        </div>

        {/* Legend */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{WebkitOverflowScrolling:'touch'}}>
        <div className="flex flex-wrap gap-3 px-5 py-2.5 border-b border-border bg-muted/30">
          {Object.entries(tagColors).map(([tag, color]) => (
            <div key={tag} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{backgroundColor:color}}/>
              <span className="text-[11px] text-muted-foreground font-medium capitalize">{tag}</span>
            </div>
          ))}
        </div>

        {/* Map area */}
        <div className="relative bg-gradient-to-br from-green-50 to-blue-50" style={{height:'min(50vh, 400px)'}}>
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
            {[20,40,60,80].map(p => (<>
              <line key={'h'+p} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#64748b" strokeWidth="1"/>
              <line key={'v'+p} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#64748b" strokeWidth="1"/>
            </>))}
          </svg>

          {/* City label */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 uppercase tracking-wider">Praha Vychod</div>

          {/* Client dots */}
          {activeClients.map(c => {
            const { x, y } = latLngToPercent(c.lat, c.lng)
            const color = tagColors[c.tags?.[0]] || '#22c55e'
            const isSelected = selected === c.id
            const clientOrders = orders.filter(o=>o.clientId===c.id)
            const hasScheduled = clientOrders.some(o=>o.status==='scheduled')
            return (
              <div key={c.id}
                style={{ position:'absolute', left:`${x}%`, top:`${y}%`, transform:'translate(-50%,-50%)', zIndex: isSelected ? 20 : 10 }}
                onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : c.id) }}
              >
                {/* Pulse ring for scheduled */}
                {hasScheduled && (
                  <div className="absolute inset-0 -m-1.5 rounded-full animate-ping opacity-40" style={{backgroundColor:color}}/>
                )}
                <div
                  className="w-9 h-9 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform touch-manipulation"
                  style={{backgroundColor:color}}
                >
                  <span className="text-[10px] font-bold text-white leading-none">
                    {c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </span>
                </div>
                {isSelected && <ClientPopup c={c}/>}
              </div>
            )
          })}

          {/* Click to close popup */}
          <div className="absolute inset-0" onClick={() => setSelected(null)}/>
        </div>

        {/* Client list below map */}
        <div className="overflow-y-auto" style={{maxHeight:'200px'}}>
          <div className="divide-y divide-border">
            {activeClients.map(c => {
              const co = orders.filter(o=>o.clientId===c.id)
              const color = tagColors[c.tags?.[0]] || '#22c55e'
              return (
                <div key={c.id} onClick={() => setSelected(selected===c.id?null:c.id)}
                  className={cn('flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-accent/50 transition-colors touch-manipulation', selected===c.id && 'bg-accent/50')}>
                  <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white" style={{backgroundColor:color}}>
                    {c.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.city}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{co.length} zak.</span>
                    <MapPin size={13} className="text-muted-foreground"/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
