import type { Metadata } from 'next'

import { GalleryCard } from '@/components/site/cards'
import { EmptyState } from '@/components/site/EmptyState'
import { PageHeader } from '@/components/site/PageHeader'
import { Pagination, parsePage } from '@/components/site/Pagination'
import { getGalleries } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/galeri' },
  description: 'Dokumentasi foto dan video kegiatan STAI Morowali.',
  title: 'Galeri',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function GalleriesPage({ searchParams }: Props) {
  const page = parsePage((await searchParams).page)
  const galleries = await getGalleries({ page })

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Galeri' }]}
        description="Dokumentasi kegiatan akademik dan kemahasiswaan."
        eyebrow="Dokumentasi"
        title="Galeri"
      />
      <div className="container-site py-12 md:py-16">
        {galleries.docs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.docs.map((gallery) => (
              <GalleryCard gallery={gallery} key={gallery.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada album galeri." />
        )}
        <Pagination
          basePath="/galeri"
          page={galleries.page ?? page}
          totalPages={galleries.totalPages}
        />
      </div>
    </>
  )
}
