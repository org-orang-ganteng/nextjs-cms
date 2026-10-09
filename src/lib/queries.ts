import 'server-only'

import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

/**
 * Akses data untuk halaman publik.
 * Semua query memakai `overrideAccess: false` sehingga aturan akses koleksi berlaku
 * (pengunjung hanya melihat dokumen yang sudah terbit).
 */
export const getPayloadClient = () => getPayload({ config: configPromise })

const PUBLISHED: Where = { _status: { equals: 'published' } }

const bySlug = (slug: string): Where => ({ and: [PUBLISHED, { slug: { equals: slug } }] })

// ── Global ────────────────────────────────────────────────────────────────────

export const getSiteSettings = cache(async () =>
  (await getPayloadClient()).findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: false }),
)

export const getHeader = cache(async () =>
  (await getPayloadClient()).findGlobal({ slug: 'header', depth: 0, overrideAccess: false }),
)

export const getFooter = cache(async () =>
  (await getPayloadClient()).findGlobal({ slug: 'footer', depth: 0, overrideAccess: false }),
)

export const getHomepage = cache(async () =>
  (await getPayloadClient()).findGlobal({ slug: 'homepage', depth: 1, overrideAccess: false }),
)

export const getCampusProfile = cache(async () =>
  (await getPayloadClient()).findGlobal({
    slug: 'campus-profile',
    depth: 1,
    overrideAccess: false,
  }),
)

export const getPmbInfo = cache(async () =>
  (await getPayloadClient()).findGlobal({ slug: 'pmb-info', depth: 1, overrideAccess: false }),
)

// ── Berita ────────────────────────────────────────────────────────────────────

export async function getPosts({
  category,
  limit = 9,
  page = 1,
}: { category?: string; limit?: number; page?: number } = {}) {
  return (await getPayloadClient()).find({
    collection: 'posts',
    depth: 1,
    limit,
    overrideAccess: false,
    page,
    sort: '-publishedAt',
    where: category ? { and: [PUBLISHED, { category: { equals: category } }] } : PUBLISHED,
  })
}

export const getPostBySlug = cache(async (slug: string) => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'posts',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: bySlug(slug),
  })
  return docs[0] ?? null
})

// ── Pengumuman ────────────────────────────────────────────────────────────────

export async function getAnnouncements({
  limit = 10,
  page = 1,
}: { limit?: number; page?: number } = {}) {
  return (await getPayloadClient()).find({
    collection: 'announcements',
    depth: 0,
    limit,
    overrideAccess: false,
    page,
    sort: ['-pinned', '-publishedAt'],
    where: {
      and: [
        PUBLISHED,
        {
          or: [
            { expiresAt: { exists: false } },
            { expiresAt: { greater_than: new Date().toISOString() } },
          ],
        },
      ],
    },
  })
}

export const getAnnouncementBySlug = cache(async (slug: string) => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'announcements',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: bySlug(slug),
  })
  return docs[0] ?? null
})

// ── Agenda ────────────────────────────────────────────────────────────────────

export async function getEvents({
  limit = 9,
  page = 1,
  when,
}: {
  limit?: number
  page?: number
  when: 'past' | 'upcoming'
}) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const now = new Date().toISOString()
  const today = startOfToday.toISOString()

  const timeFilter: Where =
    when === 'upcoming'
      ? {
          or: [
            { startDate: { greater_than_equal: today } },
            { endDate: { greater_than_equal: now } },
          ],
        }
      : {
          and: [
            { startDate: { less_than: today } },
            { or: [{ endDate: { exists: false } }, { endDate: { less_than: now } }] },
          ],
        }

  return (await getPayloadClient()).find({
    collection: 'events',
    depth: 1,
    limit,
    overrideAccess: false,
    page,
    sort: when === 'upcoming' ? 'startDate' : '-startDate',
    where: { and: [PUBLISHED, timeFilter] },
  })
}

export const getEventBySlug = cache(async (slug: string) => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'events',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: bySlug(slug),
  })
  return docs[0] ?? null
})

// ── Galeri ────────────────────────────────────────────────────────────────────

export async function getGalleries({
  limit = 12,
  page = 1,
}: { limit?: number; page?: number } = {}) {
  return (await getPayloadClient()).find({
    collection: 'galleries',
    depth: 1,
    limit,
    overrideAccess: false,
    page,
    sort: '-date',
    where: PUBLISHED,
  })
}

export const getGalleryBySlug = cache(async (slug: string) => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'galleries',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: bySlug(slug),
  })
  return docs[0] ?? null
})

// ── Program studi, dosen & staf ───────────────────────────────────────────────

export const getPrograms = cache(async () => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'programs',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    sort: ['order', 'name'],
  })
  return docs
})

export const getProgramBySlug = cache(async (slug: string) => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'programs',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return docs[0] ?? null
})

export async function getStaff({ program, type }: { program?: number; type?: string } = {}) {
  const conditions: Where[] = [{ active: { equals: true } }]
  if (type) conditions.push({ type: { equals: type } })
  if (program) conditions.push({ program: { equals: program } })

  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'staff',
    depth: 1,
    limit: 300,
    overrideAccess: false,
    sort: ['order', 'name'],
    where: { and: conditions },
  })
  return docs
}

// ── Halaman (page builder) ────────────────────────────────────────────────────

export const getPageBySlug = cache(async (slug: string) => {
  const { docs } = await (
    await getPayloadClient()
  ).find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    where: bySlug(slug),
  })
  return docs[0] ?? null
})
