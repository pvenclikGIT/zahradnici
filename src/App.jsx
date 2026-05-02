import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './hooks/useApp'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import { ToastProvider, OnboardingTour } from './components/ui'
import { PageTransition } from './components/PageTransition'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import { Orders } from './pages/Orders'
import { Checklist } from './pages/Checklist'
import { Invoices } from './pages/Invoices'
import { Calendar } from './pages/Calendar'
import { Pricelist, Notifications, Settings } from './pages/Other'
import { Products } from './pages/Products'
import { Suppliers } from './pages/Suppliers'
import { Receipts } from './pages/Receipts'
import { Team } from './pages/Team'
import { Quotes } from './pages/Quotes'
import { Contracts } from './pages/Contracts'
import { Complaints } from './pages/Complaints'
import { Vehicles } from './pages/Vehicles'
import { Help } from './pages/Help'
import { Equipment } from './pages/Equipment'
import { Login } from './pages/Login'
import { Profiles } from './pages/Profiles'
import { Portal } from './pages/Portal'
import { useState, useEffect } from 'react'

function ProtectedRoute({ children, permission }) {
  const { can } = useAuth()
  if (permission && !can(permission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="text-lg font-bold mb-1">Přístup zamítnut</h2>
        <p className="text-sm text-muted-foreground">Nemáte oprávnění k této sekci.</p>
        <p className="text-xs text-muted-foreground mt-1">Kontaktujte majitele pro změnu přístupu.</p>
      </div>
    )
  }
  return children
}

function AppRoutes() {
  const { locked, currentUser } = useAuth()
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (!locked && !localStorage.getItem('zp3_tour_seen')) {
      setTimeout(() => setShowTour(true), 1000)
    }
  }, [locked])

  if (locked) return <Login/>

  return (
    <>
      {showTour && <OnboardingTour onComplete={() => { setShowTour(false); localStorage.setItem('zp3_tour_seen','1') }}/>}
      <Layout>
        <PageTransition>
          <Routes>
            <Route path="/"              element={<ProtectedRoute permission="dashboard"><Dashboard/></ProtectedRoute>}/>
            <Route path="/calendar"      element={<ProtectedRoute permission="calendar"><Calendar/></ProtectedRoute>}/>
            <Route path="/team"          element={<ProtectedRoute permission="calendar"><Team/></ProtectedRoute>}/>
            <Route path="/quotes"        element={<ProtectedRoute permission="invoices"><Quotes/></ProtectedRoute>}/>
            <Route path="/contracts"     element={<ProtectedRoute permission="invoices"><Contracts/></ProtectedRoute>}/>
            <Route path="/complaints"    element={<ProtectedRoute permission="clients"><Complaints/></ProtectedRoute>}/>
            <Route path="/vehicles"      element={<ProtectedRoute permission="orders"><Vehicles/></ProtectedRoute>}/>
            <Route path="/help"          element={<Help/>}/>
            <Route path="/equipment"     element={<ProtectedRoute permission="orders"><Equipment/></ProtectedRoute>}/>
            <Route path="/orders"        element={<ProtectedRoute permission="orders"><Orders/></ProtectedRoute>}/>
            <Route path="/checklist"     element={<ProtectedRoute permission="checklist"><Checklist/></ProtectedRoute>}/>
            <Route path="/invoices"      element={<ProtectedRoute permission="invoices"><Invoices/></ProtectedRoute>}/>
            <Route path="/pricelist"     element={<ProtectedRoute permission="pricelist"><Pricelist/></ProtectedRoute>}/>
            <Route path="/products"      element={<ProtectedRoute permission="pricelist"><Products/></ProtectedRoute>}/>
            <Route path="/suppliers"     element={<ProtectedRoute permission="pricelist"><Suppliers/></ProtectedRoute>}/>
            <Route path="/receipts"      element={<ProtectedRoute permission="invoices"><Receipts/></ProtectedRoute>}/>
            <Route path="/clients"       element={<ProtectedRoute permission="clients"><Clients/></ProtectedRoute>}/>
            <Route path="/notifications" element={<ProtectedRoute permission="notifications"><Notifications/></ProtectedRoute>}/>
            <Route path="/settings"      element={<ProtectedRoute permission="settings"><Settings/></ProtectedRoute>}/>
            <Route path="/profiles"      element={<Profiles/>}/>
            <Route path="/portal/:id"    element={<Portal/>}/>
            <Route path="*"              element={<Navigate to="/" replace/>}/>
          </Routes>
        </PageTransition>
      </Layout>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <AppRoutes/>
          <ToastProvider/>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  )
}
