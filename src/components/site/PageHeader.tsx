import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Crumb = { href?: string; label: string }

type Props = {
  breadcrumbs?: Crumb[]
  children?: React.ReactNode
  description?: null | string
  eyebrow?: string
  title: string
}

/** Pita judul halaman berlatar hijau dengan motif bintang delapan. */
export function PageHeader({ breadcrumbs = [], children, description, eyebrow, title }: Props) {
  return (
    <section className="bg-pattern relative overflow-hidden bg-brand-800 text-white">
      <div className="container-site py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-brand-100">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link className="hover:text-white" href="/">
                Beranda
              </Link>
            </li>
            {breadcrumbs.map((crumb) => (
              <li className="flex items-center gap-1.5" key={crumb.label}>
                <ChevronRight aria-hidden className="size-3.5 opacity-60" />
                {crumb.href ? (
                  <Link className="hover:text-white" href={crumb.href}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold tracking-wide text-gold-300">{eyebrow}</p>
        )}
        <h1 className="max-w-4xl text-3xl leading-tight font-extrabold md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base text-brand-100 md:text-lg">{description}</p>
        )}
        {children}
      </div>
      <div aria-hidden className="h-1 bg-gradient-to-r from-gold-400 via-gold-300 to-transparent" />
    </section>
  )
}
