import axios from 'axios'
import { toast } from '@/store/toastStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.detail ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Request failed'
    toast({
      title: 'API Error',
      description: Array.isArray(message) ? message.map((m) => m.msg || m).join(', ') : String(message),
      variant: 'destructive',
    })
    return Promise.reject(error)
  },
)

export const fetchPredictTrain = (payload) => api.post('/predict-train', payload)
export const fetchTransactions = (limit = 50) => api.get('/transactions', { params: { limit } })
export const fetchAnalytics = () => api.get('/analytics')

export default api
