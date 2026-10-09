import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/site/EmptyState'
import { MediaImage } from '@/components/site/MediaImage'
import { PageHeader } from '@/components/site/PageHeader'
import { formatDate } from '@/lib/format'
import { asDocs, isImage } from '@/lib/media'
import { getGalleryBySlug } from '@/lib/queries'
import { metaFromSeo } from '@/lib/seo'
import { pathFor } from '@/lib/site'
import { getYouTubeEmbedUrl } from '@/lib/youtube'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gallery = await getGalleryBySlug((await params).slug)
  if (!gallery) return {}
  return metaFromSeo(null, {
    description: gallery.description,
    image: gallery.coverImage,
    path: pathFor('galleries', gallery.slug),
    title: `Galeri: ${gallery.title}`,
  })
}

export default async function GalleryPage({ params }: Props) {
  const gallery = await getGalleryBySlug((await params).slug)
  if (!gallery) notFound()

  const photos = asDocs<Media>(gallery.photos).filter((photo) => isImage(photo))
  const videos = (gallery.videos ?? []).flatMap((video) => {
    const src = getYouTubeEmbedUrl(video.url)
    return src ? [{ ...video, src }] : []
  })

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: '/galeri', label: 'Galeri' }, { label: gallery.title }]}
        description={gallery.description}
        title={gallery.title}
      >
        {gallery.date && (
          <p className="mt-5 flex items-center gap-1.5 text-sm text-brand-100">
            <CalendarDays aria-hidden className="size-4" />
            {formatDate(gallery.date)}
          </p>
        )}
      </PageHeader>

      <div className="container-site space-y-12 py-12 md:py-16">
        {photos.length > 0 && (
          <section aria-label="Foto">
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <li key={photo.id}>
                  <a
                    className="group relative block aspect-square overflow-hidden rounded-xl bg-stone-100"
                    href={photo.url!}
                    rel="noopener"
                    target="_blank"
                  >
                    <MediaImage
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      resource={photo}
                      size="card"
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    />
                    <span className="sr-only">Buka foto {photo.alt} ukuran penuh</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {videos.length > 0 && (
          <section aria-labelledby="judul-video">
            <h2 className="mb-6 text-2xl font-extrabold text-brand-950" id="judul-video">
              Video
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((video, index) => (
                <figure key={video.id ?? index}>
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-stone-900">
                    <iframe
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                      loading="lazy"
                      src={video.src}
                      title={video.title || `Video ${index + 1}`}
                    />
                  </div>
                  {video.title && (
                    <figcaption className="mt-2 text-sm font-medium text-stone-700">
                      {video.title}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {photos.length === 0 && videos.length === 0 && (
          <EmptyState title="Album ini belum berisi foto atau video." />
        )}
      </div>
    </>
  )
}
