import { cn } from '../../lib/utils'
import { getInitials, TAG_STYLES, STATUS_STYLES } from '../../data'
import { useState, useEffect, forwardRef, useRef } from 'react'
import { X, Check, AlertTriangle, Info, ChevronDown, Leaf } from 'lucide-react'

// ── Button ────────────────────────────────────
const bv = {
  primary:   'bg-primary text-white border-green-700 shadow-sm shadow-green-200 hover:bg-green-600 active:scale-95',
  secondary: 'bg-white text-foreground border-border shadow-xs hover:bg-accent active:scale-95',
  ghost:     'text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95',
  danger:    'bg-destructive text-white border-red-700 hover:bg-red-700 active:scale-95',
  outline:   'border border-border bg-transparent hover:bg-accent active:scale-95',
  success:   'bg-green-500 text-white border-green-600 hover:bg-green-600 active:scale-95',
}
const bs = {
  sm:       'h-8 px-3 text-xs rounded-md gap-1.5 min-h-[32px]',
  md:       'h-9 px-4 text-sm rounded-lg gap-2 min-h-[36px]',
  lg:       'h-11 px-6 text-base rounded-xl gap-2 min-h-[44px]',
  xl:       'h-14 px-8 text-base rounded-2xl gap-2 min-h-[56px]',
  icon:     'h-9 w-9 rounded-lg min-h-[44px] min-w-[44px]',
  'icon-sm':'h-7 w-7 rounded-md min-h-[36px] min-w-[36px]',
}
export function Button({ variant='secondary', size='md', className, children, ...props }) {
  return (
    <button className={cn('inline-flex items-center justify-center font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none select-none border touch-manipulation', bv[variant], bs[size], className)} {...props}>
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────
export const Input = forwardRef(({ className, icon, ...props }, ref) => (
  <div className={cn('relative', icon && 'relative')}>
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex pointer-events-none">{icon}</span>}
    <input ref={ref} className={cn('flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors touch-manipulation', icon && 'pl-9', className)} {...props} />
  </div>
))
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────
export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('flex min-h-[80px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-y focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors', className)} {...props} />
))
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────
export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn('flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors cursor-pointer touch-manipulation', "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23787870' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_12px_center] pr-8", className)} {...props}>{children}</select>
))
Select.displayName = 'Select'

// ── Label & FormField ─────────────────────────
export function Label({ className, children, ...props }) {
  return <label className={cn('text-sm font-medium text-foreground/80 leading-none', className)} {...props}>{children}</label>
}
export function FormField({ label, hint, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ── Card ──────────────────────────────────────
export function Card({ className, children, onClick, ...props }) {
  return <div className={cn('bg-card rounded-xl border border-border shadow-sm', onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-px transition-all active:scale-[0.99]', className)} onClick={onClick} {...props}>{children}</div>
}
export function CardHeader({ className, children }) {
  return <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)}>{children}</div>
}
export function CardTitle({ className, children }) {
  return <h3 className={cn('text-sm font-semibold tracking-tight text-foreground', className)}>{children}</h3>
}
export function CardContent({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

// ── StatCard ──────────────────────────────────
export function StatCard({ label, value, sub, subVariant, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          {Icon && <span className="text-muted-foreground/40 flex-shrink-0"><Icon size={16}/></span>}
        </div>
        <p className={cn('mt-2 text-2xl sm:text-[1.75rem] font-bold tracking-tight leading-none', color)}>{value}</p>
        {sub && <p className={cn('mt-2 text-xs flex items-center gap-1', subVariant==='up'&&'text-green-600', subVariant==='down'&&'text-destructive', !subVariant&&'text-muted-foreground')}>{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ── Badge ─────────────────────────────────────
export function Badge({ children, variant='default', className }) {
  const vs = { default:'bg-gray-100 text-gray-600 border-gray-200', green:'bg-green-50 text-green-700 border-green-200', amber:'bg-amber-50 text-amber-700 border-amber-200', red:'bg-red-50 text-red-700 border-red-200', blue:'bg-blue-50 text-blue-700 border-blue-200' }
  return <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', vs[variant], className)}>{children}</span>
}

// ── StatusBadge & TagBadge ────────────────────
export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.cancelled
  return <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border', s.pill)}><span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', s.dot)}/>{s.label}</span>
}
export function TagBadge({ tag }) {
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', TAG_STYLES[tag]||'bg-gray-100 text-gray-600 border-gray-200')}>{tag}</span>
}

// ── Avatar ────────────────────────────────────
export function Avatar({ name, size='md', className }) {
  const sizes = { sm:'w-6 h-6 text-[9px]', md:'w-8 h-8 text-xs', lg:'w-10 h-10 text-sm', xl:'w-14 h-14 text-base' }
  return <div className={cn('rounded-full bg-green-50 text-green-700 font-bold border-[1.5px] border-green-100 flex items-center justify-center flex-shrink-0', sizes[size], className)}>{getInitials(name)}</div>
}

// ── Empty State ───────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">{Icon && <Icon size={20}/>}</div>
      <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ── Dialog / Modal ────────────────────────────
export function Dialog({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose}/>
      <div className={cn('relative bg-white w-full flex flex-col max-h-[92vh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-border sticky top-0 bg-white z-10 rounded-t-2xl">
          {/* Mobile drag indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gray-200 sm:hidden"/>
          <h2 className="text-base sm:text-lg font-bold tracking-tight mt-1 sm:mt-0">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors touch-manipulation"><X size={14}/></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 scroll-smooth">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 border-t border-border flex gap-3 justify-end bg-white rounded-b-2xl sticky bottom-0 safe-bottom">{footer}</div>}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────
const toastListeners = []
export function toast(message, type='success') {
  toastListeners.forEach(fn => fn({ message, type, id: Date.now() + Math.random() }))
}
export function ToastProvider() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    const fn = t => {
      setToasts(prev => [...prev.slice(-3), t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    toastListeners.push(fn)
    return () => { const i = toastListeners.indexOf(fn); if(i>-1) toastListeners.splice(i,1) }
  }, [])
  const icons = { success:<Check size={10}/>, error:<X size={10}/>, warning:<AlertTriangle size={10}/>, info:<Info size={10}/> }
  const colors = { success:'bg-green-500', error:'bg-destructive', warning:'bg-amber-500', info:'bg-blue-500' }
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-2xl pointer-events-auto max-w-sm mx-auto sm:mx-0 w-full sm:w-auto animate-in slide-in-from-bottom-3 fade-in duration-200">
          <span className={cn('w-[18px] h-[18px] rounded-full flex items-center justify-center text-white flex-shrink-0', colors[t.type])}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── Separator ─────────────────────────────────
export function Separator({ className }) {
  return <div className={cn('h-px bg-border', className)}/>
}

// ── Pill Tabs ─────────────────────────────────
export function PillTabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex bg-muted rounded-xl p-1 gap-0.5 overflow-x-auto scroll-smooth', className)}>
      {tabs.map(tab => (
        <button key={tab.value} onClick={() => onChange(tab.value)}
          className={cn('px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation flex-shrink-0',
            active===tab.value ? 'bg-white text-foreground shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
          )}>
          {tab.label}{tab.count !== undefined && <span className="ml-1.5 text-[10px] opacity-60">({tab.count})</span>}
        </button>
      ))}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {action}
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel='Potvrdit', variant='danger' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-base mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={onClose}>Zrušit</Button>
          <Button variant={variant} className="flex-1" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

// ── Onboarding Tour ───────────────────────────
const tourSteps = [
  { title:'Vítejte v ZahradaPro', desc:'Toto je demo verze aplikace pro správu zahradnické firmy. Pojďme si ukázat co vše umí.', icon:'' },
  { title:'Dashboard', desc:'Přehled příjmů, dnešní zakázky, top klienti a aktivity. Vše na jednom místě.', icon:'' },
  { title:'Klienti', desc:'Kompletní CRM — přidávejte klienty, sledujte historii zakázek, ukládejte poznámky (pes, kód branky…).', icon:'' },
  { title:'Checklist prací', desc:'Terénní formulář pro zahradníka — výběr prací s množstvím, automatický výpočet ceny a timer.', icon:'' },
  { title:'Faktury', desc:'Automatické vystavení faktury po dokončení zakázky. Náhled, tisk, nebo odeslání emailem.', icon:'' },
  { title:'Jste připraveni!', desc:'Vyzkoušejte si přidat klienta, vytvořit zakázku a projít celý flow. Data se dají kdykoliv resetovat.', icon:'' },
]

export function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = tourSteps[step]
  const isLast = step === tourSteps.length - 1

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <div className="relative bg-white rounded-2xl border border-border shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4"><Leaf size={20} className="text-green-600"/></div>
          <h3 className="font-bold text-lg mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
        </div>
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-5">
          {tourSteps.map((_,i) => (
            <div key={i} className={cn('h-1.5 rounded-full transition-all', i===step ? 'w-6 bg-primary' : 'w-1.5 bg-gray-200')}/>
          ))}
        </div>
        <div className="flex gap-3">
          {step > 0 && <Button className="flex-1" onClick={() => setStep(s=>s-1)}>← Zpět</Button>}
          <Button variant="primary" className="flex-1" onClick={() => isLast ? onComplete() : setStep(s=>s+1)}>
            {isLast ? 'Začít používat' : 'Další →'}
          </Button>
        </div>
        <button onClick={onComplete} className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground text-center py-1">Přeskočit průvodce</button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-gray-100 rounded-lg', className)}/>
}
export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0"/>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3"/>
            <Skeleton className="h-3 w-1/2"/>
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full"/>
          <Skeleton className="h-3 w-4/5"/>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Dark mode toggle ──────────────────────────
export function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('zp3_dark')==='1')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('zp3_dark', dark ? '1' : '0')
  }, [dark])
  return (
    <label className="relative w-10 h-[22px] flex-shrink-0 cursor-pointer touch-manipulation">
      <input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} className="sr-only peer"/>
      <div className="absolute inset-0 rounded-full bg-gray-200 peer-checked:bg-primary transition-colors"/>
      <div className="absolute w-4 h-4 bg-white rounded-full top-[3px] left-[3px] shadow-sm transition-transform peer-checked:translate-x-[18px]"/>
    </label>
  )
}
