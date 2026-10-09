import type { Metadata } from 'next'

import { AnnouncementItem } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { PageHeader } from '@/components/site/PageHeader'
import { Pagination, parsePage } from '@/components/site/Pagination'
import { getAnnouncements } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/pengumuman' },
  description: 'Pengumuman resmi STAI Morowali.',
  title: 'Pengumuman',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AnnouncementsPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page)
  const announcements = await getAnnouncements({ limit: 15, page })

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Pengumuman' }]}
        description="Pengumuman resmi untuk mahasiswa, dosen, dan masyarakat."
        eyebrow="Informasi"
        title="Pengumuman"
      />
      <div className="container-site py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {announcements.docs.length > 0 ? (
            <ul className="card divide-y divide-stone-100 p-2">
              {announcements.docs.map((announcement) => (
                <AnnouncementItem announcement={announcement} key={announcement.id} />
              ))}
            </ul>
          ) : (
            <EmptyState title="Belum ada pengumuman." />
          )}
          <Pagination
            basePath="/pengumuman"
            page={announcements.page ?? page}
            totalPages={announcements.totalPages}
          />
        </div>
      </div>
    </>
  )
}
