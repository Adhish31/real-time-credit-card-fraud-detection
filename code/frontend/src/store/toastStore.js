import { create } from 'zustand'

let idCounter = 0

export const useToastStore = create((set, get) => ({
  toasts: [],
  toast: ({ title, description, variant = 'default', duration = 5000 }) => {
    const id = String(++idCounter)
    set({ toasts: [...get().toasts, { id, title, description, variant, duration }] })
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration)
    }
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))

export const toast = (opts) => useToastStore.getState().toast(opts)
