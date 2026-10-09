import { Inbox } from 'lucide-react'

export function EmptyState({ children, title }: { children?: React.ReactNode; title: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Inbox aria-hidden className="size-6" />
      </span>
      <p className="font-semibold text-stone-800">{title}</p>
      {children && <div className="mt-2 max-w-md text-sm text-stone-600">{children}</div>}
    </div>
  )
}
