import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardTitle } from '@/components/ui/card'
import { useFraudStore } from '@/store/fraudStore'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const COLORS = ['#10b981', '#ef4444']

export default function Dashboard() {
  const { analytics, fetchAnalytics, fetchTransactions, isLoading } = useFraudStore()
  const location = useLocation()

  useEffect(() => {
    fetchTransactions(true)
    fetchAnalytics(true)
  }, [fetchAnalytics, fetchTransactions, location.key])

  if (isLoading && !analytics) {
    return <p className="text-slate-500">Loading dashboard…</p>
  }

  const stats = analytics?.stats || []
  const pie = analytics?.pieChart || []
  const line = analytics?.lineChart || []
  const bar = analytics?.barChart || []
  const hasData = stats.some((s) => s.title === 'Total Transactions' && s.value !== '0')

  return (
    <div className="space-y-6">
      {!hasData && !isLoading && (
        <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-600">
          No predictions yet. Run one on the Predict page — stats and charts will update from History.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <p className="text-sm text-slate-500">{s.title}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Fraud vs Legit</CardTitle>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle>Hourly Activity</CardTitle>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={line}>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="fraud" stroke="#ef4444" />
              <Line type="monotone" dataKey="legit" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardTitle>Fraud by Category</CardTitle>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bar}>
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="fraud" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
