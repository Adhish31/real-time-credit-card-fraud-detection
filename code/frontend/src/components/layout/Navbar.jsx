import { Moon, Sun, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store/themeStore'
import { useFraudStore } from '@/store/fraudStore'

export function Navbar({ title }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const fetchAnalytics = useFraudStore((s) => s.fetchAnalytics)
  const fetchTransactions = useFraudStore((s) => s.fetchTransactions)

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const refresh = () => {
    fetchAnalytics(true)
    fetchTransactions(true)
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={refresh} title="Refresh data">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
