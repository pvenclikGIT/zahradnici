import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  LayoutDashboard, CalendarDays, ClipboardList, CheckSquare,
  Receipt, BadgeDollarSign, Users, Bell, Settings, Plus,
  Menu, X, Leaf, TrendingUp
} from 'lucide-react'

const nav = [
  {
    group: 'Přehled',
    items: [
      { to: '/',              icon: LayoutDashboard,  label: 'Dashboard' },
      { to: '/calendar',      icon: CalendarDays,     label: 'Kalendář',  badge: '3', badgeColor: 'green' },
    ]
  },
  {
    group: 'Práce',
    items: [
      { to: '/orders',        icon: ClipboardList,    label: 'Zakázky' },
      { to: '/checklist',     icon: CheckSquare,      label: 'Checklist prací' },
    ]
  },
  {
    group: 'Finance',
    items: [
      { to: '/invoices',      icon: Receipt,          label: 'Faktury',    badge: '2', badgeColor: 'red' },
      { to: '/pricelist',     icon: BadgeDollarSign,  label: 'Ceník' },
    ]
  },
  {
    group: 'Klienti',
    items: [
      { to: '/clients',       icon: Users,            label: 'Klienti' },
      { to: '/notifications', icon: Bell,             label: 'Notifikace', badge: '3', badgeColor: 'red' },
    ]
  },
  {
    group: 'Systém',
    items: [
      { to: '/settings',      icon: Settings,         label: 'Nastavení' },
    ]
  },
]

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-100 group',
        isActive
          ? 'bg-green-50 text-green-700'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {({ isActive }) => (
        <>
          <item.icon size={16} className={cn('flex-shrink-0 transition-colors', isActive ? 'text-green-500' : 'text-muted-foreground/70 group-hover:text-foreground/70')} />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none',
              item.badgeColor === 'red'   ? 'bg-destructive' : 'bg-primary'
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function Sidebar({ onClose }) {
  return (
    <aside className="w-[248px] flex flex-col h-full bg-white border-r border-border">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={16} className="text-green-400" />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight text-foreground">ZahradaPro</div>
            <div className="text-xs text-muted-foreground">Správa zakázek</div>
          </div>
          {onClose && (
            <button onClick={onClose} className="ml-auto p-1 rounded-md text-muted-foreground hover:bg-accent lg:hidden">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {nav.map(group => (
          <div key={group.group}>
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem key={item.to} item={item} onClick={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-accent transition-colors">
          <div className="w-8 h-8 rounded-full bg-green-50 border-[1.5px] border-green-100 flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
            JN
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">Jan Novák</div>
            <div className="text-xs text-muted-foreground">Majitel</div>
          </div>
          <Settings size={14} className="text-muted-foreground/50 flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[248px] z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[248px] shadow-2xl">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-[248px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              <Menu size={18} />
            </button>
            <PageTitle />
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/notifications" className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
              <Bell size={16} />
              <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-destructive rounded-full border-[1.5px] border-white" />
            </NavLink>
            <NavLink to="/orders?new=1">
              <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-sm shadow-green-200">
                <Plus size={14} />
                Nová zakázka
              </button>
            </NavLink>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1180px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function PageTitle() {
  const location = useLocation()
  const titles = {
    '/':             'Dashboard',
    '/calendar':     'Kalendář',
    '/orders':       'Zakázky',
    '/checklist':    'Checklist prací',
    '/invoices':     'Faktury',
    '/pricelist':    'Ceník',
    '/clients':      'Klienti',
    '/notifications':'Notifikace',
    '/settings':     'Nastavení',
  }
  return <h1 className="text-[17px] font-bold tracking-tight">{titles[location.pathname] || 'ZahradaPro'}</h1>
}
