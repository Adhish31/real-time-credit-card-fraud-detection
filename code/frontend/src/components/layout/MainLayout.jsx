import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

const titles = {
  '/': 'Dashboard',
  '/transactions': 'Fraud Prediction',
  '/history': 'Transaction History',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function MainLayout() {
  const { pathname } = useLocation()
  const title = titles[pathname] || 'FraudGuard'

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
