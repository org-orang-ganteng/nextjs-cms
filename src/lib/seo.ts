import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

import { asMedia, isImage } from './media'
import { SITE_NAME } from './site'

type Seo =
  | { description?: null | string; image?: Media | null | number; title?: null | string }
  | null
  | undefined

type Fallback = {
  description?: null | string
  image?: unknown
  path: string
  publishedTime?: null | string
  title: string
  type?: 'article' | 'website'
}

const DEFAULT_OG_IMAGE = '/images/og-default.jpg'

/**
 * Metadata halaman dari tab "SEO" CMS, dengan cadangan dari isi dokumen.
 * Judul dari tab SEO sudah memuat nama situs (dibuat plugin SEO), jadi dipakai apa adanya.
 */
export function metaFromSeo(seo: Seo, fallback: Fallback): Metadata {
  const description = seo?.description || fallback.description || undefined
  const image = asMedia(seo?.image) ?? asMedia(fallback.image)
  const images = isImage(image)
    ? [{ alt: image.alt, url: image.sizes?.card?.url || image.url! }]
    : [{ alt: SITE_NAME, url: DEFAULT_OG_IMAGE }]
  const ogTitle = seo?.title || fallback.title
  const common = {
    description,
    images,
    locale: 'id_ID',
    siteName: SITE_NAME,
    title: ogTitle,
    url: fallback.path,
  }

  return {
    alternates: { canonical: fallback.path },
    description,
    openGraph:
      fallback.type === 'article'
        ? { ...common, publishedTime: fallback.publishedTime ?? undefined, type: 'article' }
        : { ...common, type: 'website' },
    title: seo?.title ? { absolute: seo.title } : fallback.title,
  }
}
