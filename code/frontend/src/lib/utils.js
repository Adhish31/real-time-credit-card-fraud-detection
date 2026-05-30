import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const CATEGORIES = [
  { id: 0, name: 'Retail' },
  { id: 1, name: 'Travel' },
  { id: 2, name: 'Gaming' },
  { id: 3, name: 'Crypto' },
  { id: 4, name: 'Utilities' },
]

export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}
