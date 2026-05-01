import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { defaultClients, defaultOrders, defaultInvoices, defaultServices, defaultProducts, defaultSuppliers } from '../data'
import { useAutoNotifications } from './useNotifications'
import { useRecurring } from './useRecurring'

const KEY = 'zp3_'
const load = (k, fb) => { try { const d=localStorage.getItem(KEY+k); return d?JSON.parse(d):fb } catch { return fb } }
const save = (k, v) => { try { localStorage.setItem(KEY+k,JSON.stringify(v)) } catch {} }

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [clients,  setClientsRaw]   = useState(() => load('clients',  defaultClients))
  const [orders,   setOrdersRaw]    = useState(() => load('orders',   defaultOrders))
  const [invoices, setInvoicesRaw]  = useState(() => load('invoices', defaultInvoices))
  const [services, setServicesRaw]  = useState(() => load('services', defaultServices))
  const [products, setProductsRaw]  = useState(() => load('products', defaultProducts))
  const [suppliers,setSuppliersRaw] = useState(() => load('suppliers',defaultSuppliers))
  // Manual read state overlay
  const [readIds, setReadIds] = useState(() => load('readNotifIds', []))

  const mk = (raw, key) => useCallback(v => { raw(v); save(key, v) }, [])
  const setClients   = mk(setClientsRaw,   'clients')
  const setOrders    = mk(setOrdersRaw,    'orders')
  const setInvoices  = mk(setInvoicesRaw,  'invoices')
  const setServices  = mk(setServicesRaw,  'services')
  const setProducts  = mk(setProductsRaw,  'products')
  const setSuppliers = mk(setSuppliersRaw, 'suppliers')

  // Live generated notifications
  const rawNotifications = useAutoNotifications(clients, orders, invoices)
  const notifications = useMemo(() =>
    rawNotifications.map(n => ({ ...n, read: readIds.includes(n.id) || n.read }))
  , [rawNotifications, readIds])
  const unreadCount = notifications.filter(n => !n.read).length

  const markNotifRead    = useCallback(id => { const next=[...readIds,id]; setReadIds(next); save('readNotifIds',next) }, [readIds])
  const markAllNotifsRead = useCallback(() => { const next=notifications.map(n=>n.id); setReadIds(next); save('readNotifIds',next) }, [notifications])

  const getClient = useCallback(id => clients.find(c=>c.id===id), [clients])
  const getOrder  = useCallback(id => orders.find(o=>o.id===id),  [orders])

  const addClient    = useCallback(c => setClients([{...c,id:Date.now()},...clients]), [clients,setClients])
  const updateClient = useCallback(c => setClients(clients.map(x=>x.id===c.id?c:x)), [clients,setClients])
  const deleteClient = useCallback(id => setClients(clients.filter(c=>c.id!==id)), [clients,setClients])

  const addOrder    = useCallback(o => setOrders([{...o,id:Date.now()},...orders]), [orders,setOrders])
  const updateOrder = useCallback(o => setOrders(orders.map(x=>x.id===o.id?o:x)), [orders,setOrders])
  const deleteOrder = useCallback(id => setOrders(orders.filter(o=>o.id!==id)), [orders,setOrders])

  const addInvoice      = useCallback(i => setInvoices([i,...invoices]), [invoices,setInvoices])
  const markInvoicePaid = useCallback(id => setInvoices(invoices.map(i=>i.id===id?{...i,paid:true,paidDate:new Date().toISOString().split('T')[0]}:i)), [invoices,setInvoices])
  const deleteInvoice   = useCallback(id => setInvoices(invoices.filter(i=>i.id!==id)), [invoices,setInvoices])

  const addService    = useCallback(s => setServices([...services,{...s,id:'svc-'+Date.now()}]), [services,setServices])
  const updateService = useCallback(s => setServices(services.map(x=>x.id===s.id?s:x)), [services,setServices])
  const deleteService = useCallback(id => setServices(services.filter(s=>s.id!==id)), [services,setServices])

  // Auto-create recurring orders
  useRecurring(orders, addOrder)

  const nextInvoiceNum = useCallback(() => {
    const y = new Date().getFullYear()
    const n = invoices.filter(i=>i.id.startsWith(String(y))).length+1
    return `${y}${String(n).padStart(3,'0')}`
  }, [invoices])

  const resetDemo = useCallback(() => {
    setClients(defaultClients); setOrders(defaultOrders)
    setInvoices(defaultInvoices); setServices(defaultServices)
    setProducts(defaultProducts); setSuppliers(defaultSuppliers)
    setReadIds([]); save('readNotifIds',[])
  }, [])


  // ── Products CRUD ──
  const addProduct = useCallback(p => {
    setProducts([...products, { ...p, id: Date.now() }])
  }, [products, setProducts])

  const updateProduct = useCallback(p => {
    setProducts(products.map(x => x.id === p.id ? p : x))
  }, [products, setProducts])

  const deleteProduct = useCallback(id => {
    setProducts(products.filter(p => p.id !== id))
  }, [products, setProducts])


  // ── Suppliers CRUD ──
  const addSupplier = useCallback(s => {
    setSuppliers([...suppliers, { ...s, id: Date.now() }])
  }, [suppliers, setSuppliers])

  const updateSupplier = useCallback(s => {
    setSuppliers(suppliers.map(x => x.id === s.id ? s : x))
  }, [suppliers, setSuppliers])

  const deleteSupplier = useCallback(id => {
    setSuppliers(suppliers.filter(s => s.id !== id))
  }, [suppliers, setSuppliers])

  const toggleSupplierFavorite = useCallback(id => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s))
  }, [suppliers, setSuppliers])

  return (
    <AppContext.Provider value={{
      clients, orders, invoices, services,
      products, suppliers,
      notifications, unreadCount,
      getClient, getOrder,
      addClient, updateClient, deleteClient,
      addOrder, updateOrder, deleteOrder,
      addInvoice, markInvoicePaid, deleteInvoice,
      addService, updateService, deleteService,
      addProduct, updateProduct, deleteProduct,
      addSupplier, updateSupplier, deleteSupplier, toggleSupplierFavorite,
      markNotifRead, markAllNotifsRead,
      nextInvoiceNum, resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
