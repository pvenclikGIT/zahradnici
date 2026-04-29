import { createContext, useContext, useState, useCallback } from 'react'
import { defaultClients, defaultOrders, defaultInvoices, defaultServices } from '../data'

const KEY = 'zp3_'
const load = (k, fb) => { try { const d = localStorage.getItem(KEY+k); return d ? JSON.parse(d) : fb } catch { return fb } }
const save = (k, v)  => { try { localStorage.setItem(KEY+k, JSON.stringify(v)) } catch {} }

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [clients,  setClientsRaw]  = useState(() => load('clients',  defaultClients))
  const [orders,   setOrdersRaw]   = useState(() => load('orders',   defaultOrders))
  const [invoices, setInvoicesRaw] = useState(() => load('invoices', defaultInvoices))
  const [services, setServicesRaw] = useState(() => load('services', defaultServices))

  const set = (fn, key) => v => { fn(v); save(key, v) }
  const setClients  = useCallback(set(setClientsRaw,  'clients'),  [])
  const setOrders   = useCallback(set(setOrdersRaw,   'orders'),   [])
  const setInvoices = useCallback(set(setInvoicesRaw, 'invoices'), [])
  const setServices = useCallback(set(setServicesRaw, 'services'), [])

  const getClient = useCallback(id => clients.find(c => c.id === id),  [clients])
  const getOrder  = useCallback(id => orders.find(o => o.id === id),   [orders])

  // Clients
  const addClient    = useCallback(c => setClients([{ ...c, id: Date.now() }, ...clients]), [clients, setClients])
  const updateClient = useCallback(c => setClients(clients.map(x => x.id === c.id ? c : x)), [clients, setClients])
  const deleteClient = useCallback(id => setClients(clients.filter(c => c.id !== id)), [clients, setClients])

  // Orders
  const addOrder    = useCallback(o => setOrders([{ ...o, id: Date.now() }, ...orders]), [orders, setOrders])
  const updateOrder = useCallback(o => setOrders(orders.map(x => x.id === o.id ? o : x)), [orders, setOrders])
  const deleteOrder = useCallback(id => setOrders(orders.filter(o => o.id !== id)), [orders, setOrders])

  // Invoices
  const addInvoice      = useCallback(i => setInvoices([i, ...invoices]), [invoices, setInvoices])
  const markInvoicePaid = useCallback(id => setInvoices(invoices.map(i =>
    i.id === id ? { ...i, paid: true, paidDate: new Date().toISOString().split('T')[0] } : i
  )), [invoices, setInvoices])
  const deleteInvoice   = useCallback(id => setInvoices(invoices.filter(i => i.id !== id)), [invoices, setInvoices])

  // Services
  const addService    = useCallback(s => setServices([...services, { ...s, id: 'svc-'+Date.now() }]), [services, setServices])
  const updateService = useCallback(s => setServices(services.map(x => x.id === s.id ? s : x)), [services, setServices])
  const deleteService = useCallback(id => setServices(services.filter(s => s.id !== id)), [services, setServices])

  const nextInvoiceNum = useCallback(() => {
    const y = new Date().getFullYear()
    const n = invoices.filter(i => i.id.startsWith(String(y))).length + 1
    return `${y}${String(n).padStart(3,'0')}`
  }, [invoices])

  // Reset to demo data
  const resetDemo = useCallback(() => {
    setClients(defaultClients)
    setOrders(defaultOrders)
    setInvoices(defaultInvoices)
    setServices(defaultServices)
  }, [])

  return (
    <AppContext.Provider value={{
      clients, orders, invoices, services,
      getClient, getOrder,
      addClient, updateClient, deleteClient,
      addOrder, updateOrder, deleteOrder,
      addInvoice, markInvoicePaid, deleteInvoice,
      addService, updateService, deleteService,
      nextInvoiceNum, resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
