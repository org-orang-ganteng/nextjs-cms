import type { Metadata } from 'next'

import { EventCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { PageHeader } from '@/components/site/PageHeader'
import { Pagination, parsePage } from '@/components/site/Pagination'
import { getEvents } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/agenda' },
  description: 'Agenda kegiatan akademik dan kemahasiswaan STAI Morowali.',
  title: 'Agenda',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function EventsPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page)
  const [upcoming, past] = await Promise.all([
    getEvents({ limit: 50, when: 'upcoming' }),
    getEvents({ limit: 9, page, when: 'past' }),
  ])

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Agenda' }]}
        description="Jadwal kegiatan kampus yang akan datang dan arsip kegiatan sebelumnya."
        eyebrow="Informasi"
        title="Agenda Kegiatan"
      />
      <div className="container-site space-y-14 py-12 md:py-16">
        <section aria-labelledby="agenda-mendatang">
          <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="agenda-mendatang">
            Akan Datang
          </h2>
          {upcoming.docs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.docs.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada agenda mendatang." />
          )}
        </section>

        {past.docs.length > 0 && (
          <section aria-labelledby="agenda-lalu">
            <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="agenda-lalu">
              Kegiatan Sebelumnya
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {past.docs.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
            <Pagination basePath="/agenda" page={past.page ?? page} totalPages={past.totalPages} />
          </section>
        )}
      </div>
    </>
  )
}
