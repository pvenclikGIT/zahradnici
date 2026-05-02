import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { GlobalSearch } from './GlobalSearch'
import { FAB } from './FAB'
import { OfflineIndicator } from './OfflineIndicator'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import {
  LayoutDashboard, CalendarDays, ClipboardList, CheckSquare,
  Receipt, BadgeDollarSign, Users, Bell, Settings,
  Plus, Menu, X, Leaf, Search, LogOut, UserCircle, Package, Building2, Receipt as ReceiptIconLucide, Users2, FileEdit, FileSignature, AlertTriangle, Truck, ChevronDown, BookOpen, Wrench
} from 'lucide-react'

const VERSION = 'v2.7.0'

const pageTitles = {
  '/':'Dashboard', '/calendar':'Kalendář', '/orders':'Zakázky',
  '/checklist':'Checklist prací', '/invoices':'Faktury',
  '/pricelist':'Ceník',
  '/products':'Produkty a sklad',
  '/suppliers':'Dodavatelé',
  '/receipts':'Účtenky a výdaje', '/clients':'Klienti',
  '/notifications':'Notifikace', '/settings':'Nastavení',
  '/profiles':'Profily a přístupy',
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen]  = useState(false)
  const [searchOpen, setSearchOpen]  = useState(false)
  const [openGroups, setOpenGroups]  = useState(() => {
    try {
      const saved = localStorage.getItem('zp_sidebarGroups')
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const location  = useLocation()
  const { unreadCount } = useApp()
  const { currentUser, can, logout } = useAuth()
  const { pulling, progress } = usePullToRefresh(() => window.location.reload())

  useKeyboardShortcuts(() => setSearchOpen(true))

  useEffect(() => {
    try { localStorage.setItem('zp_sidebarGroups', JSON.stringify(openGroups)) } catch {}
  }, [openGroups])

  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navGroups = [
    { group:'Denní práce', defaultOpen: true, items:[
      { to:'/',          icon:LayoutDashboard, label:'Dashboard',  perm:'dashboard'  },
      { to:'/calendar',  icon:CalendarDays,    label:'Kalendář',   perm:'calendar'   },
      { to:'/team',      icon:Users2,          label:'Tým',        perm:'calendar'   },
      { to:'/orders',    icon:ClipboardList,   label:'Zakázky',    perm:'orders'     },
      { to:'/checklist', icon:CheckSquare,     label:'Checklist',  perm:'checklist'  },
      { to:'/equipment', icon:Wrench,          label:'Vybavení',   perm:'orders'     },
    ]},
    { group:'Obchod', defaultOpen: true, items:[
      { to:'/clients',       icon:Users,                  label:'Klienti',      perm:'clients'       },
      { to:'/quotes',        icon:FileEdit,               label:'Nabídky',      perm:'invoices'      },
      { to:'/contracts',     icon:FileSignature,          label:'Smlouvy',      perm:'invoices'      },
      { to:'/invoices',      icon:Receipt,                label:'Faktury',      perm:'invoices'      },
      { to:'/receipts',      icon:ReceiptIconLucide,      label:'Účtenky',      perm:'invoices'      },
      { to:'/complaints',    icon:AlertTriangle,          label:'Reklamace',    perm:'clients'       },
      { to:'/notifications', icon:Bell,                   label:'Notifikace',   perm:'notifications', badge: unreadCount },
    ]},
    { group:'Katalog', defaultOpen: false, items:[
      { to:'/pricelist', icon:BadgeDollarSign, label:'Ceník služeb', perm:'pricelist' },
      { to:'/products',  icon:Package,         label:'Produkty',     perm:'pricelist' },
      { to:'/suppliers', icon:Building2,       label:'Dodavatelé',   perm:'pricelist' },
    ]},
    { group:'Provoz', defaultOpen: false, items:[
      { to:'/vehicles',  icon:Truck,           label:'Vozidla',      perm:'orders'    },
    ]},
    { group:'Systém', defaultOpen: false, items:[
      { to:'/help',     icon:BookOpen,    label:'Nápověda',  perm:null       },
      { to:'/settings', icon:Settings,    label:'Nastavení', perm:'settings' },
      { to:'/profiles', icon:UserCircle,  label:'Profily',   perm:null       },
    ]},
  ]

  function SidebarContent({ onNavClick }) {
    return (<>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf size={15} className="text-green-400" strokeWidth={2}/>
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight leading-none">ZahradaPro</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Správa zakázek</div>
          </div>
        </div>
        <button onClick={() => { onNavClick?.(); setSearchOpen(true) }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-accent transition-colors text-left touch-manipulation">
          <Search size={13} className="text-muted-foreground flex-shrink-0"/>
          <span className="text-sm text-muted-foreground flex-1">Hledat…</span>
          <kbd className="text-[10px] text-muted-foreground/50 hidden sm:block">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => !item.perm || can(item.perm))
          if (!visibleItems.length) return null
          const isSystem = group.group === 'Systém'
          const isOpen = openGroups[group.group] ?? group.defaultOpen ?? true
          // Auto-open if any item in group is active
          const hasActive = visibleItems.some(item =>
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          )
          const shouldShow = isOpen || hasActive
          // Sum of badges in group (for collapsed state indicator)
          const groupBadge = visibleItems.reduce((s, i) => s + (i.badge || 0), 0)

          return (
            <div key={group.group} className={cn(isSystem && 'mt-auto pt-3 border-t border-border')}>
              <button
                onClick={() => setOpenGroups(g => ({...g, [group.group]: !shouldShow}))}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors group touch-manipulation">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-muted-foreground">
                  {group.group}
                </span>
                <span className="flex items-center gap-1.5">
                  {!shouldShow && groupBadge > 0 && (
                    <span className="min-w-[16px] h-4 px-1 inline-flex items-center justify-center text-[9px] font-bold rounded-full text-white bg-destructive">
                      {groupBadge > 9 ? '9+' : groupBadge}
                    </span>
                  )}
                  <ChevronDown size={12} className={cn('text-muted-foreground/50 transition-transform', !shouldShow && '-rotate-90')}/>
                </span>
              </button>
              {shouldShow && (
                <div className="space-y-0.5 mt-1">
                  {visibleItems.map(item => (
                    <NavLink key={item.to} to={item.to} end={item.to==='/'} onClick={onNavClick}
                      className={({ isActive }) => cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group touch-manipulation active:scale-[0.97]',
                        isActive ? 'bg-green-50 text-green-700' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}>
                      {({ isActive }) => (<>
                        <item.icon size={16} className={cn('flex-shrink-0', isActive?'text-green-600':'text-muted-foreground/70 group-hover:text-foreground/70')}/>
                        <span className="flex-1 truncate">{item.label}</span>
                        {(item.badge||0)>0 && <span className="min-w-[20px] h-5 px-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full text-white bg-destructive">{item.badge>9?'9+':item.badge}</span>}
                      </>)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-border space-y-1">
        <NavLink to="/profiles" onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors touch-manipulation">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0', currentUser?.color||'bg-green-600')}>
            {currentUser?.initials||'?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{currentUser?.name||'—'}</div>
            <div className="text-xs text-muted-foreground">{currentUser?.roleLabel||'—'}</div>
          </div>
          <Settings size={13} className="text-muted-foreground/40 flex-shrink-0"/>
        </NavLink>
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[10px] text-muted-foreground/40">{VERSION}</span>
          <button onClick={logout} className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-manipulation">
            <LogOut size={10}/>Odhlásit
          </button>
        </div>
      </div>
    </>)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)}/>}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[260px] z-30 bg-white border-r border-border">
        <SidebarContent onNavClick={null}/>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 " onClick={() => setMobileOpen(false)}/>
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-accent touch-manipulation"><X size={16}/></button>
            </div>
            <SidebarContent onNavClick={() => setMobileOpen(false)}/>
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 bg-white/95  border-b border-border flex items-center justify-between px-4 lg:px-6 gap-3 min-w-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent touch-manipulation">
              <Menu size={18}/>
            </button>
            <h1 className="text-base font-bold tracking-tight">{pageTitles[location.pathname]||'ZahradaPro'}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)} className="lg:hidden p-2.5 rounded-xl text-muted-foreground hover:bg-accent touch-manipulation">
              <Search size={18}/>
            </button>
            {can('notifications') && (
              <NavLink to="/notifications" className="relative p-2.5 rounded-xl text-muted-foreground hover:bg-accent transition-colors touch-manipulation">
                <Bell size={18}/>
                {unreadCount>0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount>9?'9+':unreadCount}
                  </span>
                )}
              </NavLink>
            )}
            {can('orders') && (
              <NavLink to="/orders?new=1" className="flex items-center gap-1.5 h-9 px-3 sm:px-4 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all shadow-sm shadow-green-200 active:scale-95 touch-manipulation">
                <Plus size={15}/><span className="hidden sm:inline">Nová zakázka</span><span className="sm:hidden">Nová</span>
              </NavLink>
            )}
          </div>
        </header>

        <OfflineIndicator/>
        {pulling && (
          <div className="fixed top-14 left-0 right-0 z-30 flex justify-center pt-2 pointer-events-none lg:hidden">
            <div className="bg-white border border-border rounded-full px-3 py-1.5 shadow-md flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent" style={{animation:'spin 0.8s linear infinite', animationPlayState:progress>=100?'running':'paused'}}/>
              <span className="text-xs font-medium text-muted-foreground">{progress>=100?'Uvolněte pro obnovení':'Táhněte dolů...'}</span>
            </div>
          </div>
        )}
        <FAB/>

        <main className="flex-1 p-4 sm:p-5 lg:p-8 max-w-[1200px] w-full mx-auto pb-24 lg:pb-8 overflow-x-hidden">
          {children}
        </main>

        {/* Mobile bottom nav — filtered by permissions */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95  border-t border-border z-20" style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
          <div className="flex items-center">
            {[
              { to:'/', icon:LayoutDashboard, label:'Přehled',   perm:'dashboard'  },
              { to:'/orders',    icon:ClipboardList, label:'Zakázky',   perm:'orders'     },
              { to:'/checklist', icon:CheckSquare,   label:'Checklist', perm:'checklist'  },
              { to:'/clients',   icon:Users,         label:'Klienti',   perm:'clients'    },
              { to:'/invoices',  icon:Receipt,       label:'Faktury',   perm:'invoices'   },
            ].filter(i => can(i.perm)).slice(0,5).map(item => (
              <NavLink key={item.to} to={item.to} end={item.to==='/'}
                className={({ isActive }) => cn('flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors touch-manipulation relative select-none', isActive?'text-primary':'text-muted-foreground')}>
                {({ isActive }) => (<>
                  <span className="relative">
                    <item.icon size={21} strokeWidth={isActive?2.5:1.75}/>
                    {item.to==='/notifications' && unreadCount>0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-destructive rounded-full border-[1.5px] border-white flex items-center justify-center text-[8px] font-bold text-white">{unreadCount>9?'9+':unreadCount}</span>
                    )}
                  </span>
                  <span className={cn('text-[10px] leading-none mt-0.5', isActive?'font-bold':'font-medium')}>{item.label}</span>
                  {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full"/>}
                </>)}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
