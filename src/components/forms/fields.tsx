import { CircleAlert } from 'lucide-react'

import { cn } from '@/lib/cn'

type FieldProps = {
  children: React.ReactNode
  className?: string
  error?: string[]
  hint?: string
  htmlFor: string
  label: string
  optional?: boolean
}

/** Label + kontrol + pesan bantuan/galat yang terhubung lewat aria-describedby. */
export function Field({ children, className, error, hint, htmlFor, label, optional }: FieldProps) {
  return (
    <div className={className}>
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {optional && <span className="ml-1 font-normal text-stone-400">(opsional)</span>}
      </label>
      {children}
      {hint && !error?.length && (
        <p className="mt-1.5 text-xs text-stone-500" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      )}
      {error?.length ? (
        <p className="form-error" id={`${htmlFor}-error`}>
          {error[0]}
        </p>
      ) : null}
    </div>
  )
}

/** Atribut aksesibilitas untuk input yang punya pesan galat/bantuan. */
export function describedBy(name: string, error?: string[], hint?: boolean) {
  const ids = [
    error?.length ? `${name}-error` : null,
    hint && !error?.length ? `${name}-hint` : null,
  ].filter(Boolean)
  return {
    'aria-describedby': ids.length ? ids.join(' ') : undefined,
    'aria-invalid': error?.length ? true : undefined,
  }
}

/** Field jebakan bot: tersembunyi dari manusia dan pembaca layar. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Jangan diisi</label>
      <input autoComplete="off" id="website" name="website" tabIndex={-1} type="text" />
    </div>
  )
}

export function FormAlert({
  children,
  tone = 'error',
}: {
  children: React.ReactNode
  tone?: 'error' | 'info'
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        tone === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-brand-200 bg-brand-50 text-brand-900',
      )}
      role={tone === 'error' ? 'alert' : 'status'}
      tabIndex={tone === 'error' ? -1 : undefined}
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
