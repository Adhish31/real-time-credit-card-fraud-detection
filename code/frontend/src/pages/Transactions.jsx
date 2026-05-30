import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PredictionResultCard } from '@/components/PredictionResultCard'
import { useFraudStore } from '@/store/fraudStore'
import { useSettingsStore } from '@/store/settingsStore'
import { CATEGORIES } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import { Plus, Trash2, Sparkles } from 'lucide-react'

const emptyTxn = () => ({ amount: '100', category: 0 })

function sampleSequence() {
  return Array.from({ length: 20 }, (_, i) => ({
    amount: String(50 + Math.random() * 400),
    category: i % 5,
  }))
}

export default function Transactions() {
  const [txns, setTxns] = useState(() => Array.from({ length: 20 }, emptyTxn))
  const { predictTransaction, predictionLoading, currentPrediction } = useFraudStore()
  const { modelType, riskThreshold } = useSettingsStore()

  const update = (i, field, value) => {
    setTxns((prev) => prev.map((t, j) => (j === i ? { ...t, [field]: value } : t)))
  }

  const handlePredict = async () => {
    const parsed = txns.map((t) => ({
      amount: parseFloat(t.amount),
      category: parseInt(t.category, 10),
    }))
    if (parsed.some((t) => !t.amount || t.amount <= 0)) {
      toast({ title: 'Invalid amount', description: 'All amounts must be positive.', variant: 'destructive' })
      return
    }
    if (parsed.length !== 20) {
      toast({ title: 'Invalid sequence', description: 'Need exactly 20 transactions.', variant: 'destructive' })
      return
    }
    try {
      await predictTransaction(parsed, modelType, true, null)
      toast({ title: 'Prediction complete', description: 'Saved to History. Open History to view.' })
    } catch {
      /* interceptor handles toast */
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle>20-Transaction Sequence</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTxns(sampleSequence())}>
              <Sparkles className="mr-2 h-4 w-4" /> Random sample
            </Button>
            <Button onClick={handlePredict} disabled={predictionLoading}>
              {predictionLoading ? 'Predicting…' : 'Run prediction'}
            </Button>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Model: <strong>{modelType.toUpperCase()}</strong> · Threshold: <strong>{riskThreshold}</strong>
        </p>

        <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
          {txns.map((t, i) => (
            <div key={i} className="grid grid-cols-[2rem_1fr_1fr_auto] items-center gap-2">
              <span className="text-xs text-slate-400">{i + 1}</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={t.amount}
                onChange={(e) => update(i, 'amount', e.target.value)}
                placeholder="Amount"
              />
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={t.category}
                onChange={(e) => update(i, 'category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button variant="ghost" onClick={() => setTxns((p) => p.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {txns.length < 20 && (
          <Button className="mt-4" variant="outline" onClick={() => setTxns((p) => [...p, emptyTxn()])}>
            <Plus className="mr-2 h-4 w-4" /> Add row
          </Button>
        )}
      </Card>

      <PredictionResultCard prediction={currentPrediction} />
    </div>
  )
}
