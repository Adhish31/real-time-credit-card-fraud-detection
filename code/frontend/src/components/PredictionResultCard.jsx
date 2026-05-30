import { Card, CardTitle } from '@/components/ui/card'
import { formatPercent } from '@/lib/utils'
import { useSettingsStore } from '@/store/settingsStore'
import { motion } from 'framer-motion'

export function PredictionResultCard({ prediction }) {
  const threshold = useSettingsStore((s) => s.riskThreshold)
  if (!prediction) return null

  const isFraud = prediction.probability > threshold
  const pct = prediction.probability * 100

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={isFraud ? 'border-red-400' : 'border-emerald-400'}>
        <CardTitle>Prediction Result</CardTitle>
        <div className="mt-4 flex items-center gap-6">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full text-xl font-bold ${
              isFraud ? 'bg-red-100 text-red-700 dark:bg-red-900' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900'
            }`}
          >
            {pct.toFixed(0)}%
          </div>
          <div>
            <p className={`text-2xl font-bold ${isFraud ? 'text-red-600' : 'text-emerald-600'}`}>
              {prediction.status}
            </p>
            <p className="text-sm text-slate-500">
              Risk: {formatPercent(prediction.probability)} · Model: {prediction.model_used?.toUpperCase()}
            </p>
            <p className="text-xs text-slate-400">ID: {prediction.prediction_id}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
