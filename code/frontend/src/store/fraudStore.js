import { create } from 'zustand'
import { fetchAnalytics, fetchPredictTrain, fetchTransactions } from '@/lib/api'

const CACHE_MS = 60_000

export const useFraudStore = create((set, get) => ({
  transactions: [],
  analytics: null,
  predictions: [],
  currentPrediction: null,
  isLoading: false,
  predictionLoading: false,
  error: null,
  lastFetched: { transactions: null, analytics: null },

  clearError: () => set({ error: null }),
  clearCurrentPrediction: () => set({ currentPrediction: null }),

  fetchTransactions: async (forceRefresh = false) => {
    const { lastFetched } = get()
    if (!forceRefresh && lastFetched.transactions && Date.now() - lastFetched.transactions < CACHE_MS) {
      return get().transactions
    }
    set({ isLoading: true, error: null })
    try {
      const res = await fetchTransactions(50)
      set({
        transactions: res.data,
        isLoading: false,
        lastFetched: { ...get().lastFetched, transactions: Date.now() },
      })
      return res.data
    } catch (e) {
      set({ isLoading: false, error: e.message })
      throw e
    }
  },

  fetchAnalytics: async (forceRefresh = false) => {
    const { lastFetched } = get()
    if (!forceRefresh && lastFetched.analytics && Date.now() - lastFetched.analytics < CACHE_MS) {
      return get().analytics
    }
    set({ isLoading: true, error: null })
    try {
      const res = await fetchAnalytics()
      set({
        analytics: res.data,
        isLoading: false,
        lastFetched: { ...get().lastFetched, analytics: Date.now() },
      })
      return res.data
    } catch (e) {
      set({ isLoading: false, error: e.message })
      throw e
    }
  },

  addPredictionToHistory: (transactions, result) => {
    const avgAmount =
      transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length
    const entry = {
      id: `PRED-${result.prediction_id.slice(0, 8).toUpperCase()}`,
      amount: Math.round(avgAmount * 100) / 100,
      category: transactions[transactions.length - 1].category,
      status: result.status,
      risk_score: result.probability,
      prediction_id: result.prediction_id,
      model_used: result.model_used,
      sequence_size: transactions.length,
      timestamp: Date.now() / 1000,
    }
    set((s) => {
      const withoutDup = s.transactions.filter((t) => t.id !== entry.id)
      return { transactions: [entry, ...withoutDup] }
    })
  },

  predictTransaction: async (transactions, modelType = 'lstm', fineTune = true, fraudLabel = null) => {
    set({ predictionLoading: true, error: null })
    try {
      const res = await fetchPredictTrain({
        transactions,
        model_type: modelType,
        fine_tune: fineTune,
        fraud_label: fraudLabel,
      })
      const result = res.data
      get().addPredictionToHistory(transactions, result)
      set((s) => ({
        currentPrediction: result,
        predictions: [result, ...s.predictions].slice(0, 50),
        predictionLoading: false,
        lastFetched: { ...s.lastFetched, transactions: null, analytics: null },
      }))
      await get().fetchTransactions(true)
      await get().fetchAnalytics(true)
      return result
    } catch (e) {
      set({ predictionLoading: false, error: e.message })
      throw e
    }
  },
}))
