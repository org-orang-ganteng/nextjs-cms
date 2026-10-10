import { getPayload, type Where } from 'payload'
import config from '../../src/payload.config.js'
import { MARKER, TEST_EMAIL_DOMAIN } from './markers'

export { MARKER, TEST_EMAIL_DOMAIN }

export const editorUser = {
  email: `editor@${TEST_EMAIL_DOMAIN}`,
  name: `${MARKER} Editor`,
  password: 'editor-uji-123',
  roles: ['editor' as const],
  username: 'editor-uji-e2e',
}

const byTitle: Where = { title: { contains: MARKER } }

const targets: Record<string, Where> = {
  announcements: byTitle,
  events: byTitle,
  galleries: byTitle,
  media: { alt: { contains: MARKER } },
  messages: {
    or: [{ email: { contains: `@${TEST_EMAIL_DOMAIN}` } }, { subject: { contains: MARKER } }],
  },
  pages: byTitle,
  'pmb-registrations': { fullName: { contains: MARKER } },
  posts: byTitle,
  users: {
    or: [
      { email: { contains: `@${TEST_EMAIL_DOMAIN}` } },
      { email: { equals: 'dev@payloadcms.com' } },
    ],
  },
}

/** Menghapus semua dokumen berpenanda uji; mengembalikan jumlah yang dihapus per koleksi. */
export async function cleanupTestData(): Promise<Record<string, number>> {
  const payload = await getPayload({ config })
  const summary: Record<string, number> = {}

  for (const [collection, where] of Object.entries(targets)) {
    const result = await payload.delete({
      collection: collection as 'posts',
      where,
    })
    summary[collection] = result.docs.length
  }
  return summary
}

export async function seedEditorUser(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({ collection: 'users', where: { email: { equals: editorUser.email } } })
  await payload.create({ collection: 'users', data: editorUser })
}

/** Membuka formulir PMB sementara; fungsi kembalian memulihkan status semula. */
export async function openPmbTemporarily(): Promise<() => Promise<void>> {
  const payload = await getPayload({ config })
  const { isOpen } = await payload.findGlobal({ slug: 'pmb-info', depth: 0 })
  if (isOpen) return async () => {}

  await payload.updateGlobal({ slug: 'pmb-info', data: { isOpen: true } })
  return async () => {
    await payload.updateGlobal({ slug: 'pmb-info', data: { isOpen: false } })
  }
}

/** Menambah satu slide uji di beranda; fungsi kembalian memulihkan daftar slide semula. */
export async function addTemporarySlide(): Promise<() => Promise<void>> {
  const payload = await getPayload({ config })
  const original = (await payload.findGlobal({ slug: 'homepage', depth: 0 })).slides ?? []

  await payload.updateGlobal({
    slug: 'homepage',
    data: { slides: [...original, { title: `${MARKER} Slide Uji` }] },
  })
  return async () => {
    await payload.updateGlobal({ slug: 'homepage', data: { slides: original } })
  }
}
