import { cn } from '@/lib/utils'

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>
}
