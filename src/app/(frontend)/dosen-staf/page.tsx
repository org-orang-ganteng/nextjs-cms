import type { Metadata } from 'next'
import Link from 'next/link'

import { StaffCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { PageHeader } from '@/components/site/PageHeader'
import { cn } from '@/lib/cn'
import { STAFF_TYPES } from '@/lib/options'
import { getPrograms, getStaff } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/dosen-staf' },
  description: 'Direktori dosen dan tenaga kependidikan STAI Morowali.',
  title: 'Dosen & Staf',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

export default async function StaffPage({ searchParams }: Props) {
  const params = await searchParams
  const typeParam = single(params.tipe)
  const type = STAFF_TYPES.some((option) => option.value === typeParam) ? typeParam : undefined
  const programs = await getPrograms()
  const program = programs.find((item) => item.slug === single(params.prodi))
  const staff = await getStaff({ program: program?.id, type })

  const tabHref = (value?: string) => {
    const search = new URLSearchParams()
    if (value) search.set('tipe', value)
    if (program) search.set('prodi', program.slug)
    const query = search.toString()
    return query ? `/dosen-staf?${query}` : '/dosen-staf'
  }

  const tabs = [{ label: 'Semua', value: undefined }, ...STAFF_TYPES]

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Dosen & Staf' }]}
        description="Tenaga pendidik dan tenaga kependidikan STAI Morowali."
        eyebrow="Akademik"
        title="Dosen & Staf"
      />
      <div className="container-site py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <nav aria-label="Kategori" className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                aria-current={tab.value === type ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold',
                  tab.value === type
                    ? 'bg-brand-700 text-white'
                    : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-brand-50',
                )}
                href={tabHref(tab.value)}
                key={tab.label}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <form action="/dosen-staf" className="flex items-center gap-2">
            {type && <input name="tipe" type="hidden" value={type} />}
            <label className="sr-only" htmlFor="filter-prodi">
              Program studi
            </label>
            <select
              className="form-input w-auto"
              defaultValue={program?.slug ?? ''}
              id="filter-prodi"
              name="prodi"
            >
              <option value="">Semua program studi</option>
              {programs.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit">
              Terapkan
            </button>
          </form>
        </div>

        {staff.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((person) => (
              <StaffCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada data dosen atau staf untuk filter ini." />
        )}
      </div>
    </>
  )
}
