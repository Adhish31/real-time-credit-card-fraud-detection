import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      riskThreshold: 0.3,
      modelType: 'lstm',
      autoBlockEnabled: false,
      setRiskThreshold: (riskThreshold) => set({ riskThreshold }),
      setModelType: (modelType) => set({ modelType }),
      setAutoBlockEnabled: (autoBlockEnabled) => set({ autoBlockEnabled }),
      resetSettings: () =>
        set({ riskThreshold: 0.3, modelType: 'lstm', autoBlockEnabled: false }),
    }),
    { name: 'fraudguard-settings' },
  ),
)
