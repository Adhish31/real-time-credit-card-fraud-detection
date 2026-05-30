import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'min-w-[280px] rounded-lg border p-4 shadow-lg',
            t.variant === 'destructive'
              ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
              : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
          )}
        >
          {t.title && <p className="font-semibold">{t.title}</p>}
          {t.description && <p className="text-sm opacity-80">{t.description}</p>}
          <button className="mt-2 text-xs underline" onClick={() => dismiss(t.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}
