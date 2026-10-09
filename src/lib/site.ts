/** Identitas & rute dasar situs. Nilai yang bisa diubah admin ada di global "Pengaturan Situs". */

export const SITE_NAME = 'STAI Morowali'
export const SITE_FULL_NAME = 'Sekolah Tinggi Agama Islam (STAI) Morowali'
export const DEFAULT_JOURNAL_URL = 'https://jurnal.staimorowali.ac.id'
export const SITE_TIME_ZONE = 'Asia/Makassar' // WITA

/** URL publik situs tanpa garis miring di akhir (untuk SEO, sitemap, Open Graph). */
export function getServerUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/+$/, '')
}

/** Prefix URL publik untuk tiap koleksi yang punya halaman detail. */
export const COLLECTION_PATHS = {
  announcements: '/pengumuman',
  events: '/agenda',
  galleries: '/galeri',
  pages: '',
  posts: '/berita',
  programs: '/program-studi',
} as const

export type LinkableCollection = keyof typeof COLLECTION_PATHS

export function isLinkableCollection(value: string): value is LinkableCollection {
  return value in COLLECTION_PATHS
}

export function pathFor(collection: LinkableCollection, slug?: null | string): string {
  const base = COLLECTION_PATHS[collection]
  if (!slug) return base || '/'
  return `${base}/${slug}`
}

/**
 * Segmen URL yang sudah dipakai halaman bawaan. Slug koleksi "Halaman" (page builder)
 * tidak boleh memakai nama ini karena rute statis Next.js selalu menang.
 */
export const RESERVED_PAGE_SLUGS = new Set([
  'admin',
  'agenda',
  'api',
  'berita',
  'dosen-staf',
  'galeri',
  'jurnal',
  'kontak',
  'login',
  'pengumuman',
  'pmb',
  'profil',
  'program-studi',
  'robots.txt',
  'sitemap.xml',
])
