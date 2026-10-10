/**
 * Data awal website STAI Morowali.
 *
 * Jalankan: `pnpm seed` (database harus sudah berjalan).
 * Seed dilewati bila data program studi sudah ada; paksa dengan SEED_FORCE=true.
 *
 * Isi data mengikuti rancangan database terbaru (stai-db.zip: sql/seed.sql), dipetakan ke koleksi Payload.
 *
 * Teks bertanda "[Isi resmi menyusul]" dan judul berawalan "Contoh:" adalah placeholder
 * yang harus diganti/dihapus pengelola sebelum go-live (materi disediakan kampus, RAB poin 6.5).
 */
import config from '@payload-config'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import { DEFAULT_JOURNAL_URL, SITE_FULL_NAME, SITE_NAME } from '@/lib/site'
import { toSlug } from '@/lib/slug'

import { bulletList, heading, paragraph, paragraphs, richText } from './richtext'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const PLACEHOLDER = '[Isi resmi menyusul — akan diisi oleh pengelola STAI Morowali.]'

const payload = await getPayload({ config })
const log = payload.logger

const { totalDocs: existingPrograms } = await payload.count({ collection: 'programs' })
if (existingPrograms > 0 && process.env.SEED_FORCE !== 'true') {
  log.info('Database sudah berisi data. Seed dilewati (set SEED_FORCE=true untuk memaksa).')
  process.exit(0)
}

// ── Akun admin pertama ────────────────────────────────────────────────────────
const { totalDocs: existingUsers } = await payload.count({ collection: 'users' })
if (existingUsers === 0) {
  for (const account of [
    {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@staimorowali.ac.id',
      name: 'Administrator',
      password: process.env.SEED_ADMIN_PASSWORD,
      role: 'admin' as const,
      username: process.env.SEED_ADMIN_USERNAME || 'admin',
    },
  ]) {
    const password = account.password || crypto.randomBytes(12).toString('base64url')
    await payload.create({
      collection: 'users',
      data: {
        email: account.email,
        name: account.name,
        password,
        roles: [account.role],
        username: account.username,
      },
    })
    log.info(`Akun ${account.role} dibuat: ${account.username} (${account.email})`)
    if (!account.password) {
      log.warn(`Password sementara ${account.role}: ${password}  (segera ganti setelah login)`)
    }
  }
}

// ── Media ─────────────────────────────────────────────────────────────────────
const logo = await payload.create({
  collection: 'media',
  data: { alt: 'Logo STAI Morowali' },
  filePath: path.resolve(dirname, '../../public/images/logo-stai-morowali.jpg'),
})

// ── Program studi ─────────────────────────────────────────────────────────────
const programSeeds = [
  {
    code: 'PAI',
    name: 'Pendidikan Agama Islam',
    summary: 'Menyiapkan pendidik agama Islam yang profesional untuk sekolah dan madrasah.',
  },
  {
    code: 'PGMI',
    name: 'Pendidikan Guru Madrasah Ibtidaiyah',
    summary:
      'Menyiapkan guru kelas madrasah ibtidaiyah/sekolah dasar yang menguasai pedagogi dan nilai keislaman.',
  },
  {
    code: 'PIAUD',
    name: 'Pendidikan Islam Anak Usia Dini',
    summary:
      'Menyiapkan pendidik anak usia dini (RA/PAUD) yang memahami tumbuh kembang anak berlandaskan nilai Islam.',
  },
  {
    code: 'HKI',
    name: 'Hukum Keluarga Islam',
    summary:
      'Mengkaji hukum perkawinan, kewarisan, dan perwakafan dalam Islam beserta penerapannya di Indonesia.',
  },
]

const programs = []
for (const [index, item] of programSeeds.entries()) {
  programs.push(
    await payload.create({
      collection: 'programs',
      data: {
        ...item,
        degree: 'S1',
        slug: toSlug(item.code)!,
        description: paragraphs(item.summary, PLACEHOLDER),
        order: index + 1,
        vision: PLACEHOLDER,
      },
    }),
  )
}
log.info(`${programs.length} program studi dibuat.`)

// ── Pengaturan & menu ─────────────────────────────────────────────────────────
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    address:
      'Jalan Sultan Hasanuddin, Kelurahan Matano, Kecamatan Bungku Tengah, Kabupaten Morowali, Sulawesi Tengah',
    description:
      'Website resmi Sekolah Tinggi Agama Islam (STAI) Morowali: profil kampus, program studi, informasi PMB, dan Rumah Jurnal.',
    fullName: SITE_FULL_NAME,
    journalDescription: 'Portal jurnal ilmiah STAI Morowali berbasis Open Journal Systems (OJS).',
    journalUrl: DEFAULT_JOURNAL_URL,
    logo: logo.id,
    siteName: SITE_NAME,
    tagline: 'Sekolah Tinggi Agama Islam Morowali',
  },
})

await payload.updateGlobal({
  slug: 'header',
  data: {
    cta: { label: 'Daftar PMB', url: '/pmb' },
    navItems: [
      { label: 'Beranda', url: '/' },
      {
        children: [
          { label: 'Sejarah', url: '/profil#sejarah' },
          { label: 'Visi & Misi', url: '/profil#visi-misi' },
          { label: 'Sambutan Ketua', url: '/profil#sambutan' },
          { label: 'Struktur Organisasi', url: '/profil#struktur-organisasi' },
        ],
        label: 'Profil',
        url: '/profil',
      },
      {
        children: [
          { label: 'Program Studi', url: '/program-studi' },
          { label: 'Dosen & Staf', url: '/dosen-staf' },
        ],
        label: 'Akademik',
        url: '/program-studi',
      },
      {
        children: [
          { label: 'Berita', url: '/berita' },
          { label: 'Pengumuman', url: '/pengumuman' },
          { label: 'Agenda', url: '/agenda' },
        ],
        label: 'Informasi',
        url: '/berita',
      },
      { label: 'Galeri', url: '/galeri' },
      { label: 'PMB', url: '/pmb' },
      { label: 'Rumah Jurnal', newTab: true, url: '/jurnal' },
      { label: 'Kontak', url: '/kontak' },
    ],
  },
})

await payload.updateGlobal({
  slug: 'footer',
  data: {
    about: 'Sekolah Tinggi Agama Islam (STAI) Morowali, Kabupaten Morowali, Sulawesi Tengah.',
    columns: [
      {
        links: [
          { label: 'Profil Kampus', url: '/profil' },
          { label: 'Program Studi', url: '/program-studi' },
          { label: 'Dosen & Staf', url: '/dosen-staf' },
          { label: 'Penerimaan Mahasiswa Baru', url: '/pmb' },
        ],
        title: 'Kampus',
      },
      {
        links: [
          { label: 'Berita', url: '/berita' },
          { label: 'Pengumuman', url: '/pengumuman' },
          { label: 'Agenda', url: '/agenda' },
          { label: 'Galeri', url: '/galeri' },
          { label: 'Rumah Jurnal', newTab: true, url: '/jurnal' },
        ],
        title: 'Informasi',
      },
    ],
    copyright: '© {tahun} STAI Morowali. Hak cipta dilindungi.',
  },
})

// ── Konten halaman utama ──────────────────────────────────────────────────────
await payload.updateGlobal({
  slug: 'homepage',
  data: {
    highlights: [
      {
        description: 'Empat program studi: PAI, PGMI, PIAUD, dan HKI.',
        title: 'Program Studi',
        url: '/program-studi',
      },
      {
        description:
          'Informasi jadwal, persyaratan, dan formulir pendaftaran awal calon mahasiswa.',
        title: 'Penerimaan Mahasiswa Baru',
        url: '/pmb',
      },
      {
        description: 'Publikasi ilmiah dosen dan mahasiswa melalui jurnal program studi.',
        title: 'Rumah Jurnal',
        url: '/jurnal',
      },
    ],
    slides: [
      {
        primaryButton: { label: 'Daftar Sekarang', url: '/pmb' },
        secondaryButton: { label: 'Lihat Program Studi', url: '/program-studi' },
        subtitle: 'Mencetak generasi berilmu, berakhlak, dan berkarakter Islami.',
        title: 'Selamat Datang di STAI Morowali',
      },
    ],
    stats: [{ label: 'Program Studi', value: '4' }],
  },
})

await payload.updateGlobal({
  slug: 'campus-profile',
  data: {
    goals: [{ text: PLACEHOLDER }],
    greeting: paragraphs('Assalamu’alaikum warahmatullahi wabarakatuh.', PLACEHOLDER),
    history: paragraphs(PLACEHOLDER),
    leaderName: 'Dr. H. Najamudin, S.Ag., S.Pd., M.Pd.',
    leaderTitle: 'Ketua STAI Morowali',
    missions: [{ text: PLACEHOLDER }],
    officials: [{ name: 'Dr. H. Najamudin, S.Ag., S.Pd., M.Pd.', position: 'Ketua STAI Morowali' }],
    vision: PLACEHOLDER,
  },
})

await payload.updateGlobal({
  slug: 'pmb-info',
  data: {
    academicYear: '2026/2027',
    guide: richText(
      heading('Alur pendaftaran awal'),
      bulletList([
        'Isi formulir pendaftaran awal di website.',
        'Simpan nomor pendaftaran yang muncul setelah formulir terkirim.',
        'Panitia PMB menghubungi Anda melalui WhatsApp untuk verifikasi dan tahap berikutnya.',
      ]),
      paragraph(PLACEHOLDER),
    ),
    intro: paragraphs(
      'Penerimaan Mahasiswa Baru (PMB) STAI Morowali dibuka untuk lulusan SMA/MA/SMK atau sederajat.',
      'Informasi biaya akan diumumkan oleh panitia PMB.',
    ),
    isOpen: true,
    requirements: [{ text: PLACEHOLDER }],
    schedule: [{ date: '15 Oktober – 31 Desember 2026', stage: 'Pendaftaran Gelombang 1' }],
    wave: 'Gelombang 1',
  },
})

// ── Contoh konten (hapus sebelum go-live) ─────────────────────────────────────
const now = Date.now()
const day = 24 * 60 * 60 * 1000

for (const [index, item] of [
  {
    category: 'umum' as const,
    excerpt: 'STAI Morowali meluncurkan website resmi sebagai sarana informasi akademik.',
    title: 'Website Resmi STAI Morowali Diluncurkan',
  },
  {
    category: 'akademik' as const,
    excerpt: 'Pendaftaran mahasiswa baru STAI Morowali telah dibuka untuk 4 program studi.',
    title: 'Pembukaan Penerimaan Mahasiswa Baru 2026/2027',
  },
].entries()) {
  await payload.create({
    collection: 'posts',
    data: {
      ...item,
      _status: 'published',
      content: paragraphs(item.excerpt, PLACEHOLDER),
      slug: toSlug(item.title)!,
      publishedAt: new Date(now - index * day).toISOString(),
    },
  })
}

await payload.create({
  collection: 'announcements',
  data: {
    _status: 'published',
    content: paragraphs(
      'Pendaftaran gelombang 1 dibuka. Informasi lengkap tersedia di halaman PMB.',
    ),
    pinned: true,
    publishedAt: new Date(now).toISOString(),
    slug: 'pengumuman-pendaftaran-mahasiswa-baru',
    title: 'Pengumuman Pendaftaran Mahasiswa Baru',
  },
})

await payload.create({
  collection: 'events',
  data: {
    _status: 'published',
    location: 'Kampus STAI Morowali',
    startDate: new Date(now + 14 * day).toISOString(),
    slug: 'contoh-agenda-kegiatan-kampus',
    summary: 'Contoh agenda mendatang.',
    title: 'Contoh: Agenda Kegiatan Kampus',
  },
})

await payload.create({
  collection: 'pages',
  data: {
    _status: 'published',
    layout: [
      {
        blockType: 'hero',
        subtitle: 'Halaman ini menunjukkan blok-blok yang tersedia di page builder.',
        title: 'Contoh Halaman',
      },
      {
        blockType: 'content',
        content: paragraphs(
          'Blok teks dapat berisi paragraf, judul, daftar, tautan, dan gambar.',
          'Hapus halaman ini sebelum website diluncurkan.',
        ),
      },
      { blockType: 'programList', title: 'Program Studi' },
      {
        blockType: 'faq',
        items: [
          {
            answer: 'Melalui menu Halaman di panel admin (/admin).',
            question: 'Bagaimana cara membuat halaman baru?',
          },
        ],
        title: 'Tanya Jawab',
      },
      {
        blockType: 'callToAction',
        button: { label: 'Kunjungi Halaman PMB', url: '/pmb' },
        text: 'Contoh blok ajakan dengan tombol.',
        title: 'Siap bergabung dengan STAI Morowali?',
      },
    ],
    slug: 'contoh-halaman',
    title: 'Contoh Halaman',
  },
})

log.info('Seed selesai. Buka /admin untuk mulai mengelola konten.')
process.exit(0)
