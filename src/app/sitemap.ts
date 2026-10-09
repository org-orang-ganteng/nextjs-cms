import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/queries'
import { getServerUrl, type LinkableCollection, pathFor } from '@/lib/site'

export const dynamic = 'force-dynamic'

const STATIC_ROUTES = [
  '/',
  '/profil',
  '/program-studi',
  '/dosen-staf',
  '/berita',
  '/pengumuman',
  '/agenda',
  '/galeri',
  '/pmb',
  '/kontak',
]

const PUBLISHABLE: LinkableCollection[] = ['posts', 'announcements', 'events', 'galleries', 'pages']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getServerUrl()
  const payload = await getPayloadClient()

  const dynamicEntries = await Promise.all(
    [...PUBLISHABLE, 'programs' as const].map(async (collection) => {
      const { docs } = await payload.find({
        collection,
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: { slug: true, updatedAt: true },
        where: collection === 'programs' ? undefined : { _status: { equals: 'published' } },
      })
      return docs.map((doc) => ({
        lastModified: doc.updatedAt,
        url: `${baseUrl}${pathFor(collection, doc.slug)}`,
      }))
    }),
  )

  return [
    ...STATIC_ROUTES.map((route) => ({ url: `${baseUrl}${route === '/' ? '' : route}` })),
    ...dynamicEntries.flat(),
  ]
}
