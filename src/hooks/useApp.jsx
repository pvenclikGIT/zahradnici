import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { defaultClients, defaultOrders, defaultInvoices, defaultServices, defaultProducts, defaultSuppliers, defaultReceipts, defaultWorkers, defaultAbsences, defaultQuotes, defaultContracts, defaultComplaints, defaultVehicles, defaultTrips, defaultRefuels } from '../data'
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
  const [receipts, setReceiptsRaw]  = useState(() => load('receipts', defaultReceipts))
  const [workers,  setWorkersRaw]   = useState(() => load('workers',  defaultWorkers))
  const [absences, setAbsencesRaw]  = useState(() => load('absences', defaultAbsences))
  const [quotes,    setQuotesRaw]    = useState(() => load('quotes',    defaultQuotes))
  const [contracts, setContractsRaw] = useState(() => load('contracts', defaultContracts))
  const [complaints,setComplaintsRaw]= useState(() => load('complaints',defaultComplaints))
  const [vehicles,  setVehiclesRaw]  = useState(() => load('vehicles',  defaultVehicles))
  const [trips,     setTripsRaw]     = useState(() => load('trips',     defaultTrips))
  const [refuels,   setRefuelsRaw]   = useState(() => load('refuels',   defaultRefuels))
  // Manual read state overlay
  const [readIds, setReadIds] = useState(() => load('readNotifIds', []))

  const mk = (raw, key) => useCallback(v => { raw(v); save(key, v) }, [])
  const setClients   = mk(setClientsRaw,   'clients')
  const setOrders    = mk(setOrdersRaw,    'orders')
  const setInvoices  = mk(setInvoicesRaw,  'invoices')
  const setServices  = mk(setServicesRaw,  'services')
  const setProducts  = mk(setProductsRaw,  'products')
  const setSuppliers = mk(setSuppliersRaw, 'suppliers')
  const setReceipts  = mk(setReceiptsRaw,  'receipts')
  const setWorkers   = mk(setWorkersRaw,   'workers')
  const setAbsences  = mk(setAbsencesRaw,  'absences')
  const setQuotes    = mk(setQuotesRaw,    'quotes')
  const setContracts = mk(setContractsRaw, 'contracts')
  const setComplaints= mk(setComplaintsRaw,'complaints')
  const setVehicles  = mk(setVehiclesRaw,  'vehicles')
  const setTrips     = mk(setTripsRaw,     'trips')
  const setRefuels   = mk(setRefuelsRaw,   'refuels')

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
    setReceipts(defaultReceipts)
    setWorkers(defaultWorkers)
    setAbsences(defaultAbsences)
    setQuotes(defaultQuotes); setContracts(defaultContracts); setComplaints(defaultComplaints)
    setVehicles(defaultVehicles); setTrips(defaultTrips); setRefuels(defaultRefuels)
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


  // ── Receipts CRUD ──
  const addReceipt = useCallback(r => {
    setReceipts([...receipts, { ...r, id: Date.now() }])
  }, [receipts, setReceipts])

  const updateReceipt = useCallback(r => {
    setReceipts(receipts.map(x => x.id === r.id ? r : x))
  }, [receipts, setReceipts])

  const deleteReceipt = useCallback(id => {
    setReceipts(receipts.filter(r => r.id !== id))
  }, [receipts, setReceipts])


  // ── Absences CRUD ──
  const addAbsence = useCallback(a => {
    setAbsences([...absences, { ...a, id: Date.now(), requestedAt: new Date().toISOString().split('T')[0] }])
  }, [absences, setAbsences])

  const updateAbsence = useCallback(a => {
    setAbsences(absences.map(x => x.id === a.id ? a : x))
  }, [absences, setAbsences])

  const deleteAbsence = useCallback(id => {
    setAbsences(absences.filter(a => a.id !== id))
  }, [absences, setAbsences])

  const approveAbsence = useCallback((id, approverId) => {
    setAbsences(absences.map(a => a.id === id ? { ...a, status:'approved', approvedBy:approverId, approvedAt: new Date().toISOString().split('T')[0] } : a))
  }, [absences, setAbsences])

  const rejectAbsence = useCallback((id, approverId) => {
    setAbsences(absences.map(a => a.id === id ? { ...a, status:'rejected', approvedBy:approverId, approvedAt: new Date().toISOString().split('T')[0] } : a))
  }, [absences, setAbsences])


  // ── Quotes CRUD ──
  const addQuote = useCallback(q => setQuotes([...quotes, { ...q, id: Date.now() }]), [quotes, setQuotes])
  const updateQuote = useCallback(q => setQuotes(quotes.map(x => x.id === q.id ? q : x)), [quotes, setQuotes])
  const deleteQuote = useCallback(id => setQuotes(quotes.filter(q => q.id !== id)), [quotes, setQuotes])

  // ── Contracts CRUD ──
  const addContract = useCallback(c => setContracts([...contracts, { ...c, id: Date.now() }]), [contracts, setContracts])
  const updateContract = useCallback(c => setContracts(contracts.map(x => x.id === c.id ? c : x)), [contracts, setContracts])
  const deleteContract = useCallback(id => setContracts(contracts.filter(c => c.id !== id)), [contracts, setContracts])

  // ── Complaints CRUD ──
  const addComplaint = useCallback(c => setComplaints([...complaints, { ...c, id: Date.now() }]), [complaints, setComplaints])
  const updateComplaint = useCallback(c => setComplaints(complaints.map(x => x.id === c.id ? c : x)), [complaints, setComplaints])
  const deleteComplaint = useCallback(id => setComplaints(complaints.filter(c => c.id !== id)), [complaints, setComplaints])

  // ── Vehicles + Trips + Refuels CRUD ──
  const addVehicle = useCallback(v => setVehicles([...vehicles, { ...v, id: Date.now() }]), [vehicles, setVehicles])
  const updateVehicle = useCallback(v => setVehicles(vehicles.map(x => x.id === v.id ? v : x)), [vehicles, setVehicles])
  const deleteVehicle = useCallback(id => setVehicles(vehicles.filter(v => v.id !== id)), [vehicles, setVehicles])
  const addTrip = useCallback(t => setTrips([...trips, { ...t, id: Date.now() }]), [trips, setTrips])
  const deleteTrip = useCallback(id => setTrips(trips.filter(t => t.id !== id)), [trips, setTrips])
  const addRefuel = useCallback(r => setRefuels([...refuels, { ...r, id: Date.now() }]), [refuels, setRefuels])
  const deleteRefuel = useCallback(id => setRefuels(refuels.filter(r => r.id !== id)), [refuels, setRefuels])

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
      receipts, addReceipt, updateReceipt, deleteReceipt,
      workers, absences,
      addAbsence, updateAbsence, deleteAbsence, approveAbsence, rejectAbsence,
      quotes, addQuote, updateQuote, deleteQuote,
      contracts, addContract, updateContract, deleteContract,
      complaints, addComplaint, updateComplaint, deleteComplaint,
      vehicles, trips, refuels,
      addVehicle, updateVehicle, deleteVehicle,
      addTrip, deleteTrip, addRefuel, deleteRefuel,
      markNotifRead, markAllNotifsRead,
      nextInvoiceNum, resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
