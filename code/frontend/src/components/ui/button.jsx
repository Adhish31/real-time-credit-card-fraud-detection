import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-700',
  outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({ className, variant = 'default', disabled, children, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50',
        variants[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
