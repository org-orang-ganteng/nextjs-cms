import { CalendarDays, Download, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/site/PageHeader'
import { RichText } from '@/components/site/RichText'
import { formatDate } from '@/lib/format'
import { asDocs, formatFileSize } from '@/lib/media'
import { getAnnouncementBySlug } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { metaFromSeo } from '@/lib/seo'
import { pathFor } from '@/lib/site'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const announcement = await getAnnouncementBySlug((await params).slug)
  if (!announcement) return {}
  return metaFromSeo(announcement.meta, {
    description: richTextToPlain(announcement.content, 160),
    path: pathFor('announcements', announcement.slug),
    publishedTime: announcement.publishedAt,
    title: announcement.title,
    type: 'article',
  })
}

export default async function AnnouncementPage({ params }: Props) {
  const announcement = await getAnnouncementBySlug((await params).slug)
  if (!announcement) notFound()

  const attachments = asDocs<Media>(announcement.attachments).filter((file) => file.url)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: '/pengumuman', label: 'Pengumuman' }, { label: announcement.title }]}
        title={announcement.title}
      >
        {announcement.publishedAt && (
          <p className="mt-5 flex items-center gap-1.5 text-sm text-brand-100">
            <CalendarDays aria-hidden className="size-4" />
            <time dateTime={announcement.publishedAt}>{formatDate(announcement.publishedAt)}</time>
          </p>
        )}
      </PageHeader>

      <article className="container-site py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <RichText data={announcement.content} />

          {attachments.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-stone-900">Lampiran</h2>
              <ul className="space-y-3">
                {attachments.map((file) => (
                  <li key={file.id}>
                    <a
                      className="card flex items-center gap-4 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
                      download
                      href={file.url!}
                    >
                      <FileText aria-hidden className="size-6 shrink-0 text-brand-700" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-stone-900">
                          {file.alt || file.filename}
                        </span>
                        <span className="text-xs text-stone-500">
                          {formatFileSize(file.filesize)}
                        </span>
                      </span>
                      <Download aria-hidden className="size-5 text-stone-400" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </>
  )
}
