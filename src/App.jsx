import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './hooks/useApp'
import Layout from './components/Layout'
import { ToastProvider } from './components/ui'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import { Orders } from './pages/Orders'
import { Checklist } from './pages/Checklist'
import { Invoices } from './pages/Invoices'
import { Calendar, Pricelist, Notifications, Settings } from './pages/Other'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/clients"       element={<Clients />} />
            <Route path="/orders"        element={<Orders />} />
            <Route path="/checklist"     element={<Checklist />} />
            <Route path="/invoices"      element={<Invoices />} />
            <Route path="/calendar"      element={<Calendar />} />
            <Route path="/pricelist"     element={<Pricelist />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings"      element={<Settings />} />
          </Routes>
        </Layout>
        <ToastProvider />
      </HashRouter>
    </AppProvider>
  )
}
