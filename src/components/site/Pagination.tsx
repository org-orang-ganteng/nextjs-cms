import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/cn'

type Props = {
  /** Path dasar, misalnya "/berita". */
  basePath: string
  page: number
  /** Parameter query lain yang dipertahankan (mis. kategori). */
  params?: Record<string, string | undefined>
  totalPages: number
}

export function Pagination({ basePath, page, params = {}, totalPages }: Props) {
  if (totalPages <= 1) return null

  const hrefFor = (target: number) => {
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value)
    if (target > 1) search.set('page', String(target))
    const query = search.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (target) => target === 1 || target === totalPages || Math.abs(target - page) <= 1,
  )

  return (
    <nav aria-label="Navigasi halaman" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          aria-label="Halaman sebelumnya"
          className="btn btn-outline px-3"
          href={hrefFor(page - 1)}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      )}
      {pages.map((target, index) => (
        <span className="flex items-center gap-1.5" key={target}>
          {index > 0 && target - pages[index - 1]! > 1 && (
            <span className="px-1 text-stone-400">…</span>
          )}
          <Link
            aria-current={target === page ? 'page' : undefined}
            className={cn(
              'flex size-10 items-center justify-center rounded-lg text-sm font-semibold',
              target === page ? 'bg-brand-700 text-white' : 'text-stone-700 hover:bg-brand-50',
            )}
            href={hrefFor(target)}
          >
            {target}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link
          aria-label="Halaman berikutnya"
          className="btn btn-outline px-3"
          href={hrefFor(page + 1)}
        >
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      )}
    </nav>
  )
}

/** Membaca ?page= dengan aman (minimal 1). */
export function parsePage(value: string | string[] | undefined): number {
  const page = Number.parseInt(Array.isArray(value) ? (value[0] ?? '') : (value ?? ''), 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}
