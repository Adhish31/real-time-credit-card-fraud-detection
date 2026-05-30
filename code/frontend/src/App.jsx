import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { Toaster } from '@/components/ui/toaster'
import { useThemeStore } from '@/store/themeStore'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import TransactionHistory from '@/pages/TransactionHistory'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'

export default function App() {
  const initializeTheme = useThemeStore((s) => s.initializeTheme)

  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="history" element={<TransactionHistory />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
