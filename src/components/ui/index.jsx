import { cn } from '../../lib/utils'
import { getInitials, TAG_STYLES, STATUS_STYLES } from '../../data'
import { useState, useEffect, useCallback, forwardRef } from 'react'
import { X, Check, AlertTriangle, Info } from 'lucide-react'

// ── Button ────────────────────────────────────
const buttonVariants = {
  primary:   'bg-primary text-primary-foreground hover:bg-green-600 shadow-sm shadow-green-200 active:shadow-none',
  secondary: 'bg-white text-foreground border border-border hover:bg-accent shadow-xs',
  ghost:     'text-muted-foreground hover:bg-accent hover:text-foreground',
  danger:    'bg-destructive text-destructive-foreground hover:bg-red-700',
  outline:   'border border-border bg-transparent hover:bg-accent text-foreground',
}
const buttonSizes = {
  sm:   'h-8 px-3 text-xs rounded-md gap-1.5',
  md:   'h-9 px-4 text-sm rounded-lg gap-2',
  lg:   'h-11 px-6 text-base rounded-xl gap-2',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-7 w-7 rounded-md',
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none select-none',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────
export const Input = forwardRef(({ className, icon, ...props }, ref) => (
  <div className={cn('relative', icon && 'relative')}>
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex">{icon}</span>}
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60',
        'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors',
        icon && 'pl-9',
        className
      )}
      {...props}
    />
  </div>
))
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────
export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-vertical',
      'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors',
      className
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

// ── Select ────────────────────────────────────
export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors cursor-pointer',
      'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' fill=\'none\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%23787870\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-8',
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

// ── Label ─────────────────────────────────────
export function Label({ className, children, ...props }) {
  return (
    <label className={cn('text-sm font-medium text-foreground/80 leading-none', className)} {...props}>
      {children}
    </label>
  )
}

// ── FormField ─────────────────────────────────
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
export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-card rounded-xl border border-border shadow-sm', className)} {...props}>
      {children}
    </div>
  )
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
export function StatCard({ label, value, sub, subVariant, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          {Icon && <span className="text-muted-foreground/40"><Icon size={16} /></span>}
        </div>
        <p className="mt-2 text-[1.75rem] font-bold tracking-tight leading-none">{value}</p>
        {sub && (
          <p className={cn('mt-2 text-xs flex items-center gap-1',
            subVariant === 'up'   && 'text-green-600',
            subVariant === 'down' && 'text-destructive',
            !subVariant           && 'text-muted-foreground'
          )}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Badge ─────────────────────────────────────
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default:   'bg-gray-100 text-gray-600 border-gray-200',
    green:     'bg-green-50 text-green-700 border-green-200',
    amber:     'bg-amber-50 text-amber-700 border-amber-200',
    red:       'bg-red-50 text-red-700 border-red-200',
    blue:      'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── StatusBadge ───────────────────────────────
export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.cancelled
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border', s.pill)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

// ── TagBadge ──────────────────────────────────
export function TagBadge({ tag }) {
  const style = TAG_STYLES[tag] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', style)}>
      {tag}
    </span>
  )
}

// ── Avatar ────────────────────────────────────
export function Avatar({ name, size = 'md' }) {
  const sizes = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base',
  }
  return (
    <div className={cn('rounded-full bg-green-50 text-green-700 font-bold border-[1.5px] border-green-100 flex items-center justify-center flex-shrink-0', sizes[size])}>
      {getInitials(name)}
    </div>
  )
}

// ── Empty State ───────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {Icon && <Icon size={20} />}
      </div>
      <h3 className="text-sm font-semibold tracking-tight mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-5">{description}</p>}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white rounded-2xl border border-border shadow-2xl w-full flex flex-col max-h-[90vh] sm:max-h-[85vh]',
        wide ? 'max-w-2xl' : 'max-w-lg',
        'sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl fixed bottom-0 sm:relative sm:bottom-auto'
      )}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-border flex gap-3 justify-end bg-white rounded-b-2xl sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────
const toastListeners = []
export function toast(message, type = 'success') {
  toastListeners.forEach(fn => fn({ message, type, id: Date.now() }))
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    const fn = t => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    }
    toastListeners.push(fn)
    return () => { const i = toastListeners.indexOf(fn); if (i > -1) toastListeners.splice(i, 1) }
  }, [])

  const icons = {
    success: <Check size={10} />,
    error:   <X size={10} />,
    warning: <AlertTriangle size={10} />,
    info:    <Info size={10} />,
  }
  const colors = {
    success: 'bg-green-500',
    error:   'bg-destructive',
    warning: 'bg-amber-500',
    info:    'bg-blue-500',
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-2xl pointer-events-auto max-w-xs animate-in slide-in-from-right-5 fade-in duration-200">
          <span className={cn('w-[18px] h-[18px] rounded-full flex items-center justify-center text-white flex-shrink-0', colors[t.type])}>
            {icons[t.type]}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── Separator ─────────────────────────────────
export function Separator({ className }) {
  return <div className={cn('h-px bg-border', className)} />
}

// ── Pill Tabs ─────────────────────────────────
export function PillTabs({ tabs, active, onChange }) {
  return (
    <div className="flex bg-muted rounded-xl p-1 gap-0.5">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            active === tab.value
              ? 'bg-white text-foreground shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Section Header ─────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {action}
    </div>
  )
}
