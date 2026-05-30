import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFraudStore } from '@/store/fraudStore'
import { CATEGORIES } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

export default function TransactionHistory() {
  const { transactions, fetchTransactions, isLoading } = useFraudStore()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchTransactions(true)
  }, [fetchTransactions, location.key])

  const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? id

  const filtered = transactions.filter((t) => {
    if (filter !== 'ALL' && t.status !== filter) return false
    const q = search.toLowerCase()
    return !q || String(t.id).toLowerCase().includes(q) || String(t.amount).includes(q)
  })

  return (
    <Card>
      <CardTitle>Recent Transactions</CardTitle>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => fetchTransactions(true)} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All</option>
          <option value="FRAUD">Fraud</option>
          <option value="LEGIT">Legit</option>
        </select>
      </div>

      {isLoading ? (
        <p className="mt-4 text-slate-500">Loading…</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="p-2">ID</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
                <th className="p-2">Model</th>
                <th className="p-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id || t.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 font-mono text-xs">{t.id}</td>
                  <td className="p-2">${Number(t.amount).toFixed(2)}</td>
                  <td className="p-2">{catName(t.category)}</td>
                  <td className={`p-2 font-medium ${t.status === 'FRAUD' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {t.status}
                  </td>
                  <td className="p-2 uppercase text-slate-500">{t.model_used || '—'}</td>
                  <td className="p-2">{(t.risk_score * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No transactions yet. Run a prediction first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
