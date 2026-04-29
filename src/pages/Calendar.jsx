import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { formatCurrency, formatDate } from '../data'
import { Card, CardContent, Button, FormField, Input, Select, toast } from '../components/ui'
import { ChevronLeft, ChevronRight, Plus, ArrowRight, MapPin, Clock, GripVertical } from 'lucide-react'
import { cn } from '../lib/utils'

const MONTHS    = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']
const DAYS_SHORT = ['Po','Út','St','Čt','Pá','So','Ne']
const HOURS      = [7,8,9,10,11,12,13,14,15,16,17,18]

export function Calendar() {
  const { clients, orders, services, addOrder, updateOrder } = useApp()
  const navigate = useNavigate()
  const [current, setCurrent]   = useState(new Date())
  const [view, setView]         = useState('month')
  const [dayModal, setDayModal] = useState(null)
  const [dragId, setDragId]     = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [quickForm, setQuickForm] = useState({ clientId:'', services:[], totalPrice:'' })

  const today    = new Date()
  const todayISO = today.toISOString().split('T')[0]

  const getClient        = id => clients.find(c => c.id === id)
  const getOrdersForDate = ds => orders.filter(o => o.date === ds)

  function getDayCapacity(ds) {
    const mins = getOrdersForDate(ds).reduce((s,o) => s+(o.duration||90), 0)
    return Math.min(100, Math.round((mins / 480) * 100))
  }

  function nav(dir) {
    const d = new Date(current)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCurrent(d)
  }

  // ── Drag & Drop ─────────────────────────────
  function handleDragStart(e, orderId) {
    setDragId(orderId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(orderId))
  }
  function handleDragOver(e, ds) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(ds)
  }
  function handleDrop(e, ds) {
    e.preventDefault()
    if (!dragId) return
    const order = orders.find(o => o.id === dragId)
    if (!order || order.date === ds) { setDragId(null); setDragOver(null); return }
    updateOrder({ ...order, date: ds })
    const c = getClient(order.clientId)
    toast(`${c?.name} přesunuto na ${new Date(ds).toLocaleDateString('cs-CZ',{day:'numeric',month:'numeric'})}`)
    setDragId(null)
    setDragOver(null)
  }
  function handleDragEnd() { setDragId(null); setDragOver(null) }

  // ── Quick add ───────────────────────────────
  function quickAdd() {
    if (!quickForm.clientId || !quickForm.services.length) { toast('Vyberte klienta a práce','error'); return }
    addOrder({
      clientId: parseInt(quickForm.clientId),
      date: dayModal.date,
      status: 'scheduled',
      services: quickForm.services,
      totalPrice: parseInt(quickForm.totalPrice) || 0,
      duration: 90, notes: '', paid: false, worker: 'Jan Novák',
    })
    toast('Zakázka přidána')
    setDayModal(null)
    setQuickForm({ clientId:'', services:[], totalPrice:'' })
  }

  const y = current.getFullYear(), m = current.getMonth()
  const startDay = (new Date(y,m,1).getDay()+6)%7
  const lastDate = new Date(y,m+1,0).getDate()
  const upcoming = orders.filter(o => o.status==='scheduled' && o.date>=todayISO)
    .sort((a,b) => new Date(a.date)-new Date(b.date)).slice(0,6)

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    completed:  'bg-green-100 text-green-800 border-green-200',
    cancelled:  'bg-gray-100 text-gray-500 border-gray-200',
    inprogress: 'bg-amber-100 text-amber-800 border-amber-200',
  }

  // Week view
  function getWeekStart(d) {
    const dt = new Date(d)
    dt.setDate(dt.getDate() - (dt.getDay()+6)%7)
    return dt
  }
  const weekStart = getWeekStart(current)
  const weekDays  = Array.from({length:7}, (_,i) => { const d=new Date(weekStart); d.setDate(d.getDate()+i); return d })

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {view==='month' ? `${MONTHS[m]} ${y}` : `${weekStart.getDate()}.${weekStart.getMonth()+1}. — ${weekDays[6].getDate()}.${weekDays[6].getMonth()+1}.`}
          </h2>
          <p className="text-sm text-muted-foreground">{upcoming.length} nadcházejících · přetáhnutím přesunete zakázku</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-muted rounded-xl p-1 gap-0.5">
            {['month','week'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation',
                  v===view ? 'bg-white shadow-sm font-semibold' : 'text-muted-foreground')}>
                {v==='month' ? 'Měsíc' : 'Týden'}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="icon" onClick={() => nav(-1)}><ChevronLeft size={16}/></Button>
            <Button size="sm" onClick={() => setCurrent(new Date())}>Dnes</Button>
            <Button size="icon" onClick={() => nav(1)}><ChevronRight size={16}/></Button>
          </div>
          <Link to="/orders?new=1"><Button variant="primary" size="sm"><Plus size={14}/>Nová</Button></Link>
        </div>
      </div>

      {/* ── MONTH VIEW ── */}
      {view==='month' && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS_SHORT.map(d => (
              <div key={d} className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({length:startDay}).map((_,i) => (
              <div key={'e'+i} className="min-h-[60px] sm:min-h-[96px] border-r border-b border-border bg-muted/10"/>
            ))}
            {Array.from({length:lastDate}).map((_,i) => {
              const day = i+1
              const ds  = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dos = getOrdersForDate(ds)
              const isToday   = ds===todayISO
              const isPast    = new Date(ds)<today && !isToday
              const cap       = getDayCapacity(ds)
              const isDragTgt = dragOver===ds
              return (
                <div key={day}
                  onDragOver={e => handleDragOver(e, ds)}
                  onDrop={e => handleDrop(e, ds)}
                  onClick={() => setDayModal({ date:ds, orders:dos })}
                  className={cn('min-h-[60px] sm:min-h-[96px] border-r border-b border-border p-1 sm:p-1.5 cursor-pointer transition-colors group',
                    isToday   && 'bg-green-50',
                    isPast    && 'bg-muted/10',
                    isDragTgt && 'bg-blue-50 ring-2 ring-inset ring-blue-300',
                    !isDragTgt && !isToday && !isPast && 'hover:bg-green-25'
                  )}>
                  {/* Day number + capacity */}
                  <div className="flex items-center justify-between mb-1">
                    <div className={cn('w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
                      isToday ? 'bg-primary text-white' : isPast ? 'text-muted-foreground/50' : 'text-foreground'
                    )}>{day}</div>
                    {dos.length>0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        <div className="w-8 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full',
                            cap>=80 ? 'bg-red-400' : cap>=50 ? 'bg-amber-400' : 'bg-green-400'
                          )} style={{width:`${cap}%`}}/>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Orders — desktop draggable */}
                  <div className="hidden sm:block space-y-0.5">
                    {dos.slice(0,2).map(o => {
                      const cl = getClient(o.clientId)
                      return (
                        <div key={o.id}
                          draggable
                          onDragStart={e => { e.stopPropagation(); handleDragStart(e, o.id) }}
                          onDragEnd={handleDragEnd}
                          onClick={e => { e.stopPropagation(); navigate(`/checklist?order=${o.id}`) }}
                          className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate cursor-grab active:cursor-grabbing border flex items-center gap-0.5 hover:opacity-80 transition-opacity',
                            statusColors[o.status]||'bg-gray-100 text-gray-600 border-gray-200',
                            dragId===o.id && 'opacity-40'
                          )}>
                          <GripVertical size={8} className="flex-shrink-0 opacity-50"/>
                          <span className="truncate">{cl?.name?.split(' ').slice(-1)[0]}</span>
                        </div>
                      )
                    })}
                    {dos.length>2 && <div className="text-[10px] text-muted-foreground pl-1">+{dos.length-2} další</div>}
                  </div>
                  {/* Mobile dots */}
                  <div className="sm:hidden flex flex-wrap gap-0.5 mt-1">
                    {dos.slice(0,4).map(o => (
                      <div key={o.id} className={cn('w-1.5 h-1.5 rounded-full',
                        o.status==='completed'?'bg-green-500':o.status==='scheduled'?'bg-blue-500':'bg-gray-400'
                      )}/>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── WEEK VIEW ── */}
      {view==='week' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{minWidth:'560px'}}>
              {/* Header */}
              <div className="grid border-b border-border" style={{gridTemplateColumns:'48px repeat(7,1fr)'}}>
                <div className="bg-muted/30 border-r border-border"/>
                {weekDays.map((d,i) => {
                  const ds    = d.toISOString().split('T')[0]
                  const isToday = ds===todayISO
                  const count   = getOrdersForDate(ds).length
                  return (
                    <div key={i} className={cn('py-3 text-center border-r border-border last:border-0', isToday&&'bg-green-50')}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{DAYS_SHORT[i]}</p>
                      <p className={cn('text-lg font-bold leading-none mt-0.5', isToday?'text-primary':'text-foreground')}>{d.getDate()}</p>
                      {count>0 && <div className="flex justify-center gap-0.5 mt-1">{Array.from({length:Math.min(count,3)}).map((_,j)=><div key={j} className="w-1 h-1 rounded-full bg-primary"/>)}</div>}
                    </div>
                  )
                })}
              </div>
              {/* Hour rows */}
              {HOURS.map(hour => (
                <div key={hour} className="grid border-b border-border last:border-0" style={{gridTemplateColumns:'48px repeat(7,1fr)'}}>
                  <div className="py-3 text-center text-[11px] font-medium text-muted-foreground border-r border-border bg-muted/20">
                    {String(hour).padStart(2,'0')}
                  </div>
                  {weekDays.map((d,i) => {
                    const ds = d.toISOString().split('T')[0]
                    const isToday   = ds===todayISO
                    const isDragTgt = dragOver===ds
                    const o         = getOrdersForDate(ds)[hour-7]
                    return (
                      <div key={i}
                        onDragOver={e => handleDragOver(e, ds)}
                        onDrop={e => handleDrop(e, ds)}
                        onClick={() => !o && setDayModal({ date:ds, orders:getOrdersForDate(ds) })}
                        className={cn('min-h-[52px] border-r border-border last:border-0 p-1 transition-colors',
                          isToday   && 'bg-green-50/50',
                          isDragTgt && 'bg-blue-50 ring-1 ring-inset ring-blue-300',
                          !o        && 'cursor-pointer hover:bg-green-25'
                        )}>
                        {o && (
                          <div
                            draggable
                            onDragStart={e => { e.stopPropagation(); handleDragStart(e, o.id) }}
                            onDragEnd={handleDragEnd}
                            onClick={e => { e.stopPropagation(); navigate(`/checklist?order=${o.id}`) }}
                            className={cn('text-[10px] font-semibold px-1.5 py-1 rounded-md cursor-grab active:cursor-grabbing hover:opacity-80',
                              statusColors[o.status]||'bg-gray-100 text-gray-600 border border-gray-200',
                              dragId===o.id && 'opacity-40'
                            )}>
                            <div className="truncate">{getClient(o.clientId)?.name?.split(' ').slice(-1)[0]}</div>
                            <div className="text-[9px] opacity-60 mt-0.5">{formatCurrency(o.totalPrice)}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── UPCOMING LIST ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold tracking-tight">Nadcházející zakázky</h3>
          <Link to="/orders"><Button variant="ghost" size="sm">Všechny <ArrowRight size={12}/></Button></Link>
        </div>
        {upcoming.length===0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">Žádné naplánované zakázky</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((o,i) => {
              const c  = getClient(o.clientId)
              const dt = new Date(o.date)
              const isToday    = o.date===todayISO
              const isTomorrow = o.date===new Date(Date.now()+86400000).toISOString().split('T')[0]
              const hrs        = [8,9,10,11,13,14]
              return (
                <Card key={o.id}>
                  <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                    <div className={cn('text-center w-12 rounded-xl py-2 flex-shrink-0 border',
                      isToday ? 'bg-primary border-primary' : 'bg-green-50 border-green-100'
                    )}>
                      <p className={cn('text-base font-bold leading-none', isToday?'text-white':'text-primary')}>{dt.getDate()}</p>
                      <p className={cn('text-[10px] uppercase tracking-wider mt-0.5', isToday?'text-white/70':'text-muted-foreground')}>
                        {['led','úno','bře','dub','kvě','čer','čvc','srp','zář','říj','lis','pro'][dt.getMonth()]}
                      </p>
                      <p className={cn('text-[10px] font-semibold mt-0.5', isToday?'text-white':'text-primary')}>{hrs[i%6]}:00</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm">{c?.name}</p>
                        {isToday    && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-white">Dnes</span>}
                        {isTomorrow && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Zítra</span>}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5"><MapPin size={10}/>{c?.city||c?.address}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {o.services.slice(0,2).map(s=><span key={s} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{s}</span>)}
                        {o.services.length>2 && <span className="text-[10px] text-muted-foreground">+{o.services.length-2}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{formatCurrency(o.totalPrice)}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-0.5"><Clock size={10}/>{o.duration||90} min</p>
                      <Link to={`/checklist?order=${o.id}`}>
                        <Button variant="primary" size="sm" className="mt-1.5">Zahájit</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ── DAY MODAL ── */}
      {dayModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={() => setDayModal(null)}/>
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[88vh]">
            <div className="px-5 py-4 border-b border-border flex-shrink-0">
              <div className="w-8 h-1 rounded-full bg-gray-200 mx-auto mb-3 sm:hidden"/>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold tracking-tight">{formatDate(dayModal.date)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(dayModal.date).toLocaleDateString('cs-CZ',{weekday:'long'})}
                    {dayModal.date===todayISO && ' · Dnes'}
                  </p>
                </div>
                <button onClick={() => setDayModal(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-accent touch-manipulation text-muted-foreground">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* Existing orders */}
              {dayModal.orders.length>0 && (
                <div className="p-4 space-y-2 border-b border-border">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Zakázky ({dayModal.orders.length})</p>
                  {dayModal.orders.map(o => {
                    const c = getClient(o.clientId)
                    return (
                      <div key={o.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                        <div className={cn('w-2 h-8 rounded-full flex-shrink-0',
                          o.status==='completed'?'bg-green-400':o.status==='scheduled'?'bg-blue-400':'bg-gray-300'
                        )}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{c?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{o.services.slice(0,2).join(', ')}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold">{formatCurrency(o.totalPrice)}</p>
                          {o.status==='scheduled' && (
                            <Link to={`/checklist?order=${o.id}`} onClick={() => setDayModal(null)}>
                              <Button variant="primary" size="sm" className="mt-1 text-xs">Zahájit</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {/* Capacity bar */}
                  <div className="p-3 bg-muted/30 rounded-xl mt-1">
                    <div className="flex justify-between mb-1.5">
                      <p className="text-xs font-medium">Kapacita dne</p>
                      <p className={cn('text-xs font-bold', getDayCapacity(dayModal.date)>=80?'text-red-500':getDayCapacity(dayModal.date)>=50?'text-amber-500':'text-green-600')}>
                        {getDayCapacity(dayModal.date)} %
                      </p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all',
                        getDayCapacity(dayModal.date)>=80?'bg-red-400':getDayCapacity(dayModal.date)>=50?'bg-amber-400':'bg-green-400'
                      )} style={{width:`${getDayCapacity(dayModal.date)}%`}}/>
                    </div>
                  </div>
                </div>
              )}
              {/* Quick add form */}
              <div className="p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Přidat zakázku na tento den</p>
                <FormField label="Klient *">
                  <Select value={quickForm.clientId} onChange={e=>setQuickForm(f=>({...f,clientId:e.target.value}))}>
                    <option value="">— Vyberte klienta —</option>
                    {clients.filter(c=>c.status==='active').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Práce *">
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-input rounded-xl p-2.5">
                    {services.map(s=>(
                      <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer py-1 touch-manipulation">
                        <input type="checkbox" className="w-4 h-4 accent-primary"
                          checked={quickForm.services.includes(s.name)}
                          onChange={e=>setQuickForm(f=>({...f,services:e.target.checked?[...f.services,s.name]:f.services.filter(x=>x!==s.name)}))}
                        />{s.name}
                      </label>
                    ))}
                  </div>
                </FormField>
                <FormField label="Cena (Kč)">
                  <Input type="number" value={quickForm.totalPrice} onChange={e=>setQuickForm(f=>({...f,totalPrice:e.target.value}))} placeholder="2500"/>
                </FormField>
              </div>
            </div>
            <div className="px-4 py-4 border-t border-border flex gap-3 flex-shrink-0">
              <Button className="flex-1" onClick={() => setDayModal(null)}>Zavřít</Button>
              <Button variant="primary" className="flex-1" onClick={quickAdd}><Plus size={14}/>Přidat zakázku</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
