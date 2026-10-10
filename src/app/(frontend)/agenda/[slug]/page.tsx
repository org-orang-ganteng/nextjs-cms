import { CalendarDays, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/site/MediaImage'
import { PageHeader } from '@/components/site/PageHeader'
import { RichText } from '@/components/site/RichText'
import { formatEventRange } from '@/lib/format'
import { getEventBySlug } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { metaFromSeo } from '@/lib/seo'
import { pathFor } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug)
  if (!event) return {}
  return metaFromSeo(event.meta, {
    description: event.summary || richTextToPlain(event.content, 160),
    image: event.coverImage,
    path: pathFor('events', event.slug),
    title: event.title,
  })
}

export default async function EventPage({ params }: Props) {
  const event = await getEventBySlug((await params).slug)
  if (!event) notFound()

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: '/agenda', label: 'Agenda' }, { label: event.title }]}
        title={event.title}
      >
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-100">
          <p className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4" />
            {formatEventRange(event.startDate, event.endDate)}
          </p>
          {event.location && (
            <p className="flex items-center gap-1.5">
              <MapPin aria-hidden className="size-4" />
              {event.location}
            </p>
          )}
        </div>
      </PageHeader>

      <article className="container-site py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          {event.coverImage && (
            <div className="relative mb-10 aspect-video overflow-hidden rounded-2xl">
              <MediaImage
                className="object-cover"
                fill
                preload
                resource={event.coverImage}
                size="hero"
                sizes="(min-width: 768px) 48rem, 100vw"
              />
            </div>
          )}
          {event.summary && <p className="mb-6 text-lg text-stone-700">{event.summary}</p>}
          {event.content && <RichText data={event.content} />}
        </div>
      </article>
    </>
  )
}
