import { useEffect } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { useFraudStore } from '@/store/fraudStore'
import { useSettingsStore } from '@/store/settingsStore'

export default function Analytics() {
  const { analytics, fetchAnalytics } = useFraudStore()
  const { modelType, riskThreshold } = useSettingsStore()

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>Model Configuration</CardTitle>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Active model</dt>
            <dd className="font-semibold">{modelType.toUpperCase()}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Fraud threshold</dt>
            <dd className="font-semibold">{riskThreshold}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Sequence length</dt>
            <dd className="font-semibold">20 transactions</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Features</dt>
            <dd className="font-semibold">amount (scaled), category (0–4)</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardTitle>Training reference (dl_hcl.py)</CardTitle>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>LSTM & GRU: 64 units, Dropout 0.2, Dense(32) + Sigmoid output</li>
          <li>Colab uses MinMaxScaler on amounts and LabelEncoder on categories</li>
          <li>API scales amount as amount / 5000 (must match your export pipeline)</li>
          <li>Export models from Colab: lstm_model.keras, gru_model.keras → project root</li>
        </ul>
      </Card>

      {analytics && (
        <Card>
          <CardTitle>Live stats from API</CardTitle>
          <pre className="mt-4 overflow-auto rounded-lg bg-slate-100 p-4 text-xs dark:bg-slate-800">
            {JSON.stringify(analytics.stats, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
