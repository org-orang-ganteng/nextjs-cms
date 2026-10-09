import { cn } from '@/lib/cn'

type Props = {
  action?: React.ReactNode
  className?: string
  description?: string
  eyebrow?: string
  title: string
}

/** Judul bagian dengan aksen garis emas. */
export function SectionHeading({ action, className, description, eyebrow, title }: Props) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold text-brand-950 md:text-3xl">{title}</h2>
        <span aria-hidden className="mt-3 block h-1 w-14 rounded-full bg-gold-400" />
        {description && <p className="mt-4 text-stone-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}
