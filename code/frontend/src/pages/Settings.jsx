import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'
import { useThemeStore } from '@/store/themeStore'

export default function Settings() {
  const {
    riskThreshold,
    modelType,
    autoBlockEnabled,
    setRiskThreshold,
    setModelType,
    setAutoBlockEnabled,
    resetSettings,
  } = useSettingsStore()
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardTitle>Detection settings</CardTitle>
        <label className="mt-4 block text-sm">
          Fraud threshold ({riskThreshold})
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={riskThreshold}
            onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
            className="mt-2 w-full"
          />
        </label>

        <label className="mt-4 block text-sm">
          Model type
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
          >
            <option value="lstm">LSTM</option>
            <option value="gru">GRU</option>
          </select>
        </label>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoBlockEnabled}
            onChange={(e) => setAutoBlockEnabled(e.target.checked)}
          />
          Auto-block high-risk (future)
        </label>

        <Button className="mt-4" variant="outline" onClick={resetSettings}>
          Reset to defaults
        </Button>
      </Card>

      <Card>
        <CardTitle>Theme</CardTitle>
        <select
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Card>
    </div>
  )
}
