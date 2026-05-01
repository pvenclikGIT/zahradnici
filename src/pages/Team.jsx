import { useState, useMemo } from 'react'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { absenceTypes, formatCurrency, formatDate, formatDateShort } from '../data'
import {
  Card, CardContent, Button, Input, Select, FormField, Textarea,
  Dialog, ConfirmDialog, EmptyState, toast
} from '../components/ui'
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, Users, Phone,
  CheckCircle, X, Clock, MapPin, Briefcase, Coffee, AlertCircle, Check
} from 'lucide-react'
import { cn } from '../lib/utils'

const DAYS_SHORT = ['Po','Út','St','Čt','Pá','So','Ne']
const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec']

export function Team() {
  const { workers, absences, orders, clients, addAbsence, deleteAbsence, approveAbsence, rejectAbsence } = useApp()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(new Date())
  const [view, setView]       = useState('week')   // 'week' | 'month'
  const [absModalOpen, setAbsModalOpen] = useState(false)
  const [absForm, setAbsForm] = useState({
    workerId: '', type:'vacation', dateFrom:'', dateTo:'', allDay:true,
    hourFrom:'08:00', hourTo:'17:00', note:''
  })
  const [detailDay, setDetailDay] = useState(null)        // { date, workerId? }
  const [absenceDetail, setAbsenceDetail] = useState(null) // absence id
  const [deleteAbsId, setDeleteAbsId] = useState(null)

  const isOwner = currentUser?.role === 'owner'
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  // ── Week range ──
  function getWeekStart(d) {
    const dt = new Date(d)
    dt.setDate(dt.getDate() - (dt.getDay() + 6) % 7)
    return dt
  }
  const weekStart = getWeekStart(current)
  const weekDays  = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  // ── Helpers ──
  function getWorker(id) { return workers.find(w => w.id === id) }
  function getClient(id) { return clients.find(c => c.id === id) }

  function getOrdersForWorkerOnDay(workerId, dateISO) {
    return orders.filter(o => o.workerId === workerId && o.date === dateISO)
  }

  function getAbsenceForWorkerOnDay(workerId, dateISO) {
    return absences.find(a => {
      if (a.workerId !== workerId) return false
      if (a.status === 'rejected') return false
      const d = new Date(dateISO)
      return d >= new Date(a.dateFrom) && d <= new Date(a.dateTo)
    })
  }

  function workerStatusToday(workerId) {
    const abs = getAbsenceForWorkerOnDay(workerId, todayISO)
    if (abs && abs.status === 'approved') {
      const type = absenceTypes.find(t => t.id === abs.type)
      return { status:'absent', label:type?.label || 'Volno', color:type?.color, abs }
    }
    const ord = getOrdersForWorkerOnDay(workerId, todayISO)
    if (ord.length > 0) return { status:'working', count:ord.length, orders:ord }
    return { status:'free' }
  }

  // ── Stats ──
  const pendingApprovals = absences.filter(a => a.status === 'pending')
  const upcomingAbsences = absences
    .filter(a => a.status === 'approved' && new Date(a.dateTo) >= today)
    .sort((a,b) => new Date(a.dateFrom) - new Date(b.dateFrom))

  // ── Navigation ──
  function nav(dir) {
    const d = new Date(current)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else d.setDate(d.getDate() + dir * 7)
    setCurrent(d)
  }

  // ── Absence handlers ──
  function openAbsModal(workerId = '') {
    setAbsForm({
      workerId: workerId || (currentUser?.id ? String(workers.find(w=>w.name===currentUser.name)?.id || '') : ''),
      type:'vacation', dateFrom: todayISO, dateTo: todayISO, allDay:true,
      hourFrom:'08:00', hourTo:'17:00', note:''
    })
    setAbsModalOpen(true)
  }

  function handleSaveAbsence() {
    if (!absForm.workerId) { toast('Vyberte pracovníka', 'error'); return }
    if (!absForm.dateFrom || !absForm.dateTo) { toast('Vyplňte data', 'error'); return }
    if (new Date(absForm.dateFrom) > new Date(absForm.dateTo)) { toast('Datum od musí být před datum do', 'error'); return }

    addAbsence({
      ...absForm,
      workerId: parseInt(absForm.workerId),
      status: isOwner ? 'approved' : 'pending',
      approvedBy: isOwner ? currentUser.id : null,
      approvedAt: isOwner ? todayISO : null,
    })
    toast(isOwner ? 'Absence přidána' : 'Žádost odeslána ke schválení')
    setAbsModalOpen(false)
  }

  // Click on day cell → show day detail
  function openDayDetail(workerId, dateISO) {
    setDetailDay({ workerId, date: dateISO })
  }

  return (
    <div className="space-y-5">

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {workers.filter(w => w.active).map(w => {
          const status = workerStatusToday(w.id)
          return (
            <Card key={w.id} className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"
              onClick={() => openDayDetail(w.id, todayISO)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{backgroundColor: w.color}}>
                    {w.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold tracking-tight text-sm truncate">{w.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {w.role === 'owner' ? 'Majitel' : w.role === 'worker' ? 'Zahradník' : 'Účetní'}
                    </p>
                    <div className="mt-2">
                      {status.status === 'absent' && (
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border', status.color)}>
                          {absenceTypes.find(t => t.id === status.abs.type)?.icon} {status.label}
                        </span>
                      )}
                      {status.status === 'working' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
                          <Briefcase size={10}/>{status.count} {status.count === 1 ? 'zakázka' : status.count < 5 ? 'zakázky' : 'zakázek'}
                        </span>
                      )}
                      {status.status === 'free' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                          <Coffee size={10}/>Volno
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pending approvals — only for owner */}
      {isOwner && pendingApprovals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-600"/>
                Žádosti o volno čekající na schválení ({pendingApprovals.length})
              </p>
            </div>
            <div className="space-y-2">
              {pendingApprovals.map(a => {
                const w = getWorker(a.workerId)
                const type = absenceTypes.find(t => t.id === a.type)
                if (!w) return null
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{backgroundColor: w.color}}>
                      {w.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {w.name} · {type?.icon} {type?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.dateFrom === a.dateTo ? formatDate(a.dateFrom) : `${formatDate(a.dateFrom)} — ${formatDate(a.dateTo)}`}
                        {!a.allDay && ` · ${a.hourFrom}–${a.hourTo}`}
                      </p>
                      {a.note && <p className="text-[11px] text-muted-foreground italic truncate">"{a.note}"</p>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <Button size="icon-sm" variant="primary"
                        onClick={() => { approveAbsence(a.id, currentUser.id); toast('Schváleno') }}>
                        <Check size={14}/>
                      </Button>
                      <Button size="icon-sm" variant="danger"
                        onClick={() => { rejectAbsence(a.id, currentUser.id); toast('Zamítnuto', 'warning') }}>
                        <X size={14}/>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {view === 'week'
              ? `${weekStart.getDate()}.${weekStart.getMonth()+1}. — ${weekDays[6].getDate()}.${weekDays[6].getMonth()+1}.${weekDays[6].getFullYear()}`
              : `${MONTHS[current.getMonth()]} ${current.getFullYear()}`}
          </h2>
          <p className="text-sm text-muted-foreground">Týmový rozvrh · klikněte na den pro detail</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex bg-muted rounded-xl p-1 gap-0.5">
            {['week','month'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation',
                  v === view ? 'bg-white shadow-sm font-semibold' : 'text-muted-foreground'
                )}>
                {v === 'week' ? 'Týden' : 'Měsíc'}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="icon" onClick={() => nav(-1)}><ChevronLeft size={16}/></Button>
            <Button size="sm" onClick={() => setCurrent(new Date())}>Dnes</Button>
            <Button size="icon" onClick={() => nav(1)}><ChevronRight size={16}/></Button>
          </div>
          <Button variant="primary" size="sm" onClick={() => openAbsModal()} className="gap-1">
            <Plus size={14}/>{isOwner ? 'Přidat absenci' : 'Požádat o volno'}
          </Button>
        </div>
      </div>

      {/* Week grid view */}
      {view === 'week' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{minWidth: '720px'}}>
              {/* Day headers */}
              <div className="grid border-b border-border bg-muted/30" style={{gridTemplateColumns: '120px repeat(7, 1fr)'}}>
                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pracovník</div>
                {weekDays.map((d, i) => {
                  const isToday = d.toISOString().split('T')[0] === todayISO
                  const isWeekend = i >= 5
                  return (
                    <div key={i} className={cn('p-2 text-center border-l border-border',
                      isToday && 'bg-green-50',
                      isWeekend && 'bg-muted/40'
                    )}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{DAYS_SHORT[i]}</p>
                      <p className={cn('text-base font-bold leading-none mt-0.5', isToday ? 'text-primary' : 'text-foreground')}>
                        {d.getDate()}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{MONTHS[d.getMonth()].slice(0,3).toLowerCase()}</p>
                    </div>
                  )
                })}
              </div>

              {/* Worker rows */}
              {workers.filter(w => w.active).map(w => (
                <div key={w.id} className="grid border-b border-border last:border-0" style={{gridTemplateColumns: '120px repeat(7, 1fr)'}}>
                  {/* Worker name column */}
                  <div className="p-3 flex items-center gap-2 bg-muted/10 border-r border-border">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{backgroundColor: w.color}}>
                      {w.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{w.name.split(' ')[0]}</p>
                      <p className="text-[10px] text-muted-foreground">{w.role === 'owner' ? 'Majitel' : w.role === 'worker' ? 'Zahradník' : 'Účetní'}</p>
                    </div>
                  </div>

                  {/* Day cells */}
                  {weekDays.map((d, i) => {
                    const dateISO = d.toISOString().split('T')[0]
                    const isToday = dateISO === todayISO
                    const isWeekend = i >= 5
                    const isPast = d < today && !isToday
                    const dayOrders = getOrdersForWorkerOnDay(w.id, dateISO)
                    const dayAbsence = getAbsenceForWorkerOnDay(w.id, dateISO)

                    return (
                      <div key={i}
                        onClick={() => openDayDetail(w.id, dateISO)}
                        className={cn('min-h-[80px] p-1.5 border-l border-border cursor-pointer hover:bg-green-25 transition-colors',
                          isToday && 'bg-green-50',
                          isWeekend && 'bg-muted/30',
                          isPast && !dayAbsence && dayOrders.length === 0 && 'opacity-50'
                        )}>
                        {/* Absence display */}
                        {dayAbsence && dayAbsence.status === 'approved' && (() => {
                          const type = absenceTypes.find(t => t.id === dayAbsence.type)
                          return (
                            <div className={cn('text-[10px] font-bold px-2 py-1.5 rounded-lg border text-center mb-1', type?.color || 'bg-gray-100')}
                              onClick={e => { e.stopPropagation(); setAbsenceDetail(dayAbsence.id) }}>
                              {type?.icon} {type?.label}
                              {!dayAbsence.allDay && (
                                <p className="text-[9px] font-medium opacity-80 mt-0.5">{dayAbsence.hourFrom}–{dayAbsence.hourTo}</p>
                              )}
                            </div>
                          )
                        })()}

                        {dayAbsence && dayAbsence.status === 'pending' && (
                          <div className="text-[10px] font-medium px-2 py-1 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-amber-700 text-center mb-1"
                            onClick={e => { e.stopPropagation(); setAbsenceDetail(dayAbsence.id) }}>
                            ⏳ Žádost
                          </div>
                        )}

                        {/* Orders */}
                        {!dayAbsence?.allDay && dayOrders.slice(0, 2).map(o => {
                          const c = getClient(o.clientId)
                          return (
                            <div key={o.id}
                              onClick={e => { e.stopPropagation(); navigate(`/checklist?order=${o.id}`) }}
                              className={cn('text-[10px] font-medium px-1.5 py-1 rounded-md mb-0.5 truncate cursor-pointer hover:opacity-80 border-l-2',
                                o.status === 'completed' ? 'bg-green-50 text-green-800 border-green-500' :
                                'bg-blue-50 text-blue-800 border-blue-500'
                              )}>
                              {c?.name?.split(' ').slice(-1)[0]}
                            </div>
                          )
                        })}
                        {!dayAbsence?.allDay && dayOrders.length > 2 && (
                          <p className="text-[9px] text-muted-foreground px-1">+{dayOrders.length - 2}</p>
                        )}

                        {/* Empty state */}
                        {!dayAbsence && dayOrders.length === 0 && !isPast && (
                          <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Plus size={12} className="text-muted-foreground/40"/>
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

      {/* Month grid view */}
      {view === 'month' && (() => {
        const y = current.getFullYear()
        const m = current.getMonth()
        const startDay = (new Date(y,m,1).getDay() + 6) % 7
        const lastDate = new Date(y, m+1, 0).getDate()

        return (
          <Card className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {DAYS_SHORT.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({length: startDay}).map((_, i) => (
                <div key={'e'+i} className="min-h-[88px] border-r border-b border-border bg-muted/10"/>
              ))}
              {Array.from({length: lastDate}).map((_, i) => {
                const day = i + 1
                const dateISO = `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const isToday = dateISO === todayISO
                const isPast  = new Date(dateISO) < today && !isToday

                return (
                  <div key={day} className={cn('min-h-[88px] border-r border-b border-border p-1 cursor-pointer hover:bg-green-25 transition-colors',
                    isToday && 'bg-green-50',
                    isPast && 'bg-muted/10'
                  )}
                    onClick={() => openDayDetail(null, dateISO)}>
                    <div className={cn('w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1',
                      isToday ? 'bg-primary text-white' : isPast ? 'text-muted-foreground/50' : 'text-foreground'
                    )}>{day}</div>

                    {/* Show worker indicators */}
                    <div className="space-y-0.5">
                      {workers.filter(w => w.active).map(w => {
                        const ord = getOrdersForWorkerOnDay(w.id, dateISO)
                        const ab  = getAbsenceForWorkerOnDay(w.id, dateISO)

                        if (ab && ab.status === 'approved') {
                          const type = absenceTypes.find(t => t.id === ab.type)
                          return (
                            <div key={w.id} className="flex items-center gap-1 text-[9px] truncate">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor: w.color}}/>
                              <span className="truncate">{type?.icon}{w.initials}</span>
                            </div>
                          )
                        }
                        if (ord.length > 0) {
                          return (
                            <div key={w.id} className="flex items-center gap-1 text-[9px]">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{backgroundColor: w.color}}/>
                              <span>{w.initials}: {ord.length}z</span>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })()}

      {/* Upcoming absences list */}
      {upcomingAbsences.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold tracking-tight mb-3">Nadcházející absence</h3>
          <div className="space-y-2">
            {upcomingAbsences.slice(0, 5).map(a => {
              const w = getWorker(a.workerId)
              const type = absenceTypes.find(t => t.id === a.type)
              if (!w) return null
              return (
                <Card key={a.id} className="cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"
                  onClick={() => setAbsenceDetail(a.id)}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{backgroundColor: w.color}}>
                      {w.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{w.name}</p>
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border', type?.color)}>
                          {type?.icon} {type?.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a.dateFrom === a.dateTo ? formatDate(a.dateFrom) : `${formatDate(a.dateFrom)} — ${formatDate(a.dateTo)}`}
                        {!a.allDay && ` · ${a.hourFrom}–${a.hourTo}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Day detail modal ── */}
      {detailDay && (() => {
        const date = detailDay.date
        const showAllWorkers = !detailDay.workerId
        const workersToShow = showAllWorkers ? workers.filter(w => w.active) : [getWorker(detailDay.workerId)]

        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setDetailDay(null)}>
            <div className="absolute inset-0 bg-black/50"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-lg sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border flex flex-col" style={{maxHeight:'calc(100vh - 16px)', minHeight:'200px'}}>
              <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>

              <div className="px-5 py-3 sm:py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="font-bold tracking-tight">{formatDate(date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(date).toLocaleDateString('cs-CZ', { weekday:'long' })}
                    {date === todayISO && ' · Dnes'}
                  </p>
                </div>
                <button onClick={() => setDetailDay(null)} className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center hover:bg-accent touch-manipulation"><X size={14}/></button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {workersToShow.map(w => {
                  if (!w) return null
                  const ord = getOrdersForWorkerOnDay(w.id, date)
                  const ab  = getAbsenceForWorkerOnDay(w.id, date)
                  return (
                    <div key={w.id} className="px-5 py-4 border-b border-border last:border-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{backgroundColor: w.color}}>
                          {w.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{w.name}</p>
                          <p className="text-xs text-muted-foreground">{w.phone}</p>
                        </div>
                        <a href={`tel:${w.phone}`}>
                          <Button size="icon-sm"><Phone size={12}/></Button>
                        </a>
                      </div>

                      {/* Absence */}
                      {ab && (() => {
                        const type = absenceTypes.find(t => t.id === ab.type)
                        return (
                          <div className={cn('p-3 rounded-xl border mb-3', type?.color)}>
                            <p className="font-bold text-sm">{type?.icon} {type?.label}{ab.status === 'pending' && ' (čeká na schválení)'}</p>
                            <p className="text-xs mt-1">
                              {ab.dateFrom === ab.dateTo ? formatDate(ab.dateFrom) : `${formatDate(ab.dateFrom)} — ${formatDate(ab.dateTo)}`}
                              {!ab.allDay && ` · ${ab.hourFrom}–${ab.hourTo}`}
                            </p>
                            {ab.note && <p className="text-xs mt-1 italic opacity-80">"{ab.note}"</p>}
                          </div>
                        )
                      })()}

                      {/* Orders */}
                      {ord.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Zakázky ({ord.length})
                          </p>
                          {ord.map(o => {
                            const c = getClient(o.clientId)
                            return (
                              <div key={o.id}
                                onClick={() => { setDetailDay(null); navigate(`/checklist?order=${o.id}`) }}
                                className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors">
                                <div className={cn('w-2 h-10 rounded-full flex-shrink-0',
                                  o.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                )}/>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{c?.name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                    <MapPin size={10}/>{c?.address}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {o.services.slice(0,2).join(', ')}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-bold">{formatCurrency(o.totalPrice)}</p>
                                  <p className="text-[10px] text-muted-foreground">{o.duration || 90} min</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : !ab ? (
                        <p className="text-sm text-muted-foreground text-center py-3 bg-muted/30 rounded-xl">Žádné zakázky · volný den</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>

              <div className="px-5 py-3 sm:py-4 border-t border-border flex gap-2 flex-shrink-0 bg-white" style={{paddingBottom:'max(12px, env(safe-area-inset-bottom))'}}>
                <Button className="flex-1" onClick={() => setDetailDay(null)}>Zavřít</Button>
                <Button variant="primary" className="flex-1 gap-1" onClick={() => { setDetailDay(null); openAbsModal() }}>
                  <Plus size={12}/>Přidat absenci
                </Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Absence detail modal ── */}
      {absenceDetail && (() => {
        const ab = absences.find(x => x.id === absenceDetail)
        if (!ab) return null
        const w = getWorker(ab.workerId)
        const type = absenceTypes.find(t => t.id === ab.type)
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={() => setAbsenceDetail(null)}>
            <div className="absolute inset-0 bg-black/50"/>
            <div onClick={e => e.stopPropagation()} className="relative bg-white w-full sm:max-w-sm sm:m-4 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-border p-5" style={{paddingBottom:'max(20px, env(safe-area-inset-bottom))'}}>
              <div className="sm:hidden flex justify-center -mt-2 mb-3"><div className="w-10 h-1.5 rounded-full bg-gray-300"/></div>

              <div className="text-center mb-4">
                <div className={cn('w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl mx-auto mb-3', type?.color)}>
                  {type?.icon}
                </div>
                <h3 className="font-bold text-lg">{type?.label}</h3>
                <p className="text-sm text-muted-foreground">{w?.name}</p>
              </div>

              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-sm py-2 border-b border-border">
                  <span className="text-muted-foreground">Datum</span>
                  <span className="font-medium">
                    {ab.dateFrom === ab.dateTo ? formatDate(ab.dateFrom) : `${formatDate(ab.dateFrom)} — ${formatDate(ab.dateTo)}`}
                  </span>
                </div>
                {!ab.allDay && (
                  <div className="flex justify-between text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground">Čas</span>
                    <span className="font-medium">{ab.hourFrom}–{ab.hourTo}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm py-2 border-b border-border">
                  <span className="text-muted-foreground">Stav</span>
                  <span className={cn('font-bold',
                    ab.status === 'approved' ? 'text-green-600' :
                    ab.status === 'pending' ? 'text-amber-600' : 'text-destructive'
                  )}>
                    {ab.status === 'approved' ? '✓ Schváleno' : ab.status === 'pending' ? '⏳ Čeká' : '✗ Zamítnuto'}
                  </span>
                </div>
                {ab.note && (
                  <div className="bg-muted/40 rounded-xl p-3 text-sm italic">"{ab.note}"</div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {isOwner && ab.status === 'pending' && (
                  <>
                    <Button variant="primary" className="flex-1 gap-1" onClick={() => { approveAbsence(ab.id, currentUser.id); setAbsenceDetail(null); toast('Schváleno') }}>
                      <Check size={14}/>Schválit
                    </Button>
                    <Button variant="danger" className="flex-1 gap-1" onClick={() => { rejectAbsence(ab.id, currentUser.id); setAbsenceDetail(null); toast('Zamítnuto', 'warning') }}>
                      <X size={14}/>Zamítnout
                    </Button>
                  </>
                )}
                {(isOwner || ab.status === 'pending') && (
                  <Button variant="danger" size="sm" onClick={() => { setDeleteAbsId(ab.id); setAbsenceDetail(null) }}>Smazat</Button>
                )}
                <Button className="flex-1" onClick={() => setAbsenceDetail(null)}>Zavřít</Button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Add absence modal ── */}
      <Dialog open={absModalOpen} onClose={() => setAbsModalOpen(false)}
        title={isOwner ? 'Přidat absenci' : 'Požádat o volno'}
        footer={<><Button onClick={() => setAbsModalOpen(false)}>Zrušit</Button><Button variant="primary" onClick={handleSaveAbsence}>{isOwner ? 'Uložit' : 'Odeslat žádost'}</Button></>}>

        <FormField label="Pracovník *">
          <Select value={absForm.workerId} onChange={e => setAbsForm(f => ({...f, workerId:e.target.value}))} disabled={!isOwner}>
            <option value="">— Vyberte —</option>
            {workers.filter(w => w.active).map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Typ absence *">
          <div className="grid grid-cols-2 gap-2">
            {absenceTypes.map(t => (
              <button key={t.id} type="button"
                onClick={() => setAbsForm(f => ({...f, type:t.id}))}
                className={cn('flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left touch-manipulation',
                  absForm.type === t.id ? 'border-primary bg-green-50' : 'border-border hover:border-green-300'
                )}>
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Od *">
            <Input type="date" value={absForm.dateFrom} onChange={e => setAbsForm(f => ({...f, dateFrom:e.target.value}))}/>
          </FormField>
          <FormField label="Do *">
            <Input type="date" value={absForm.dateTo} onChange={e => setAbsForm(f => ({...f, dateTo:e.target.value}))}/>
          </FormField>
        </div>

        <FormField label="">
          <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
            <input type="checkbox" className="w-5 h-5 accent-primary"
              checked={absForm.allDay}
              onChange={e => setAbsForm(f => ({...f, allDay:e.target.checked}))}
            />
            <span className="text-sm font-medium">Celý den</span>
          </label>
        </FormField>

        {!absForm.allDay && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Od (čas)">
              <Input type="time" value={absForm.hourFrom} onChange={e => setAbsForm(f => ({...f, hourFrom:e.target.value}))}/>
            </FormField>
            <FormField label="Do (čas)">
              <Input type="time" value={absForm.hourTo} onChange={e => setAbsForm(f => ({...f, hourTo:e.target.value}))}/>
            </FormField>
          </div>
        )}

        <FormField label="Poznámka">
          <Textarea value={absForm.note} onChange={e => setAbsForm(f => ({...f, note:e.target.value}))} placeholder="Rodinná dovolená u moře..."/>
        </FormField>

        {!isOwner && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            <p className="font-semibold">Žádost o volno</p>
            <p className="text-xs mt-1">Žádost bude odeslána Janovi ke schválení. Po schválení se zobrazí v kalendáři.</p>
          </div>
        )}
      </Dialog>

      <ConfirmDialog open={!!deleteAbsId} onClose={() => setDeleteAbsId(null)}
        onConfirm={() => { deleteAbsence(deleteAbsId); toast('Absence odstraněna', 'warning') }}
        title="Smazat absenci?" description="Tato akce je nevratná." confirmLabel="Smazat" variant="danger"/>
    </div>
  )
}
