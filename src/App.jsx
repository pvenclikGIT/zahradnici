import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './hooks/useApp'
import Layout from './components/Layout'
import { ToastProvider, OnboardingTour } from './components/ui'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import { Orders } from './pages/Orders'
import { Checklist } from './pages/Checklist'
import { Invoices } from './pages/Invoices'
import { Calendar, Pricelist, Notifications, Settings } from './pages/Other'
import { useState, useEffect } from 'react'

function AppRoutes() {
  const [showTour, setShowTour] = useState(false)
  useEffect(() => {
    const seen = localStorage.getItem('zp3_tour_seen')
    if (!seen) setTimeout(() => setShowTour(true), 800)
  }, [])
  function completeTour() {
    setShowTour(false)
    localStorage.setItem('zp3_tour_seen', '1')
  }
  return (
    <>
      {showTour && <OnboardingTour onComplete={completeTour}/>}
      <Layout>
        <Routes>
          <Route path="/"              element={<Dashboard/>}/>
          <Route path="/clients"       element={<Clients/>}/>
          <Route path="/orders"        element={<Orders/>}/>
          <Route path="/checklist"     element={<Checklist/>}/>
          <Route path="/invoices"      element={<Invoices/>}/>
          <Route path="/calendar"      element={<Calendar/>}/>
          <Route path="/pricelist"     element={<Pricelist/>}/>
          <Route path="/notifications" element={<Notifications/>}/>
          <Route path="/settings"      element={<Settings/>}/>
        </Routes>
      </Layout>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes/>
        <ToastProvider/>
      </HashRouter>
    </AppProvider>
  )
}
