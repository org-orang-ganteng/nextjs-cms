/**
 * Impor konten dari folder content/ ke database. Bagian yang tidak tersedia di sumber diisi teks
 * pengganti dan data fiktif (email memakai domain example.com).
 *
 * Jalankan: `pnpm seed:content` (database berjalan dan migrasi sudah diterapkan).
 *
 * Sifat skrip:
 * - Idempoten: dokumen dicocokkan dengan slug/kode/nama lalu diperbarui, tidak diduplikasi.
 * - Foto diunggah sekali ke Media (dicocokkan berdasarkan nama berkas); baris duplikat di index.csv dilewati.
 * - Berita tanpa field `tanggal` disimpan sebagai draf; admin mengisi tanggal lalu menerbitkan.
 * - Contoh bawaan seed (berita, pengumuman, agenda, halaman) dihapus.
 */
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

import { toSlug } from '@/lib/slug'
import { DEFAULT_JOURNAL_URL, SITE_FULL_NAME, SITE_NAME } from '@/lib/site'

import { bulletList, heading, paragraph, paragraphs, richText } from './richtext'

type RichNode = Parameters<typeof richText>[number]
type PhotoPage = 'profil' | 'program-studi' | 'pkm-penelitian' | 'kegiatan-mahasiswa' | 'berita'
type PostCategory = 'akademik' | 'kegiatan' | 'kemahasiswaan'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '../..')
const CONTENT = path.join(ROOT, 'content')

const payload = await getPayload({ config })
const log = payload.logger

// ── Utilitas ─────────────────────────────────────────────────────────────────

const readContent = (relativePath: string) =>
  fs.readFileSync(path.join(CONTENT, relativePath), 'utf8')

const stripFrontmatter = (md: string) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')

const normalize = (value: string) =>
  value.replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase()

/** Nilai dari sumber; bila kosong, memakai teks pengganti. */
const orFallback = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** Parser CSV yang mendukung field berkutip dan baris baru di dalam kutipan. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows.filter((cells) => cells.some((cell) => cell.trim()))
  if (!header) return []
  return body.map((cells) =>
    Object.fromEntries(header.map((key, index) => [key.trim(), (cells[index] ?? '').trim()])),
  )
}

/**
 * Mengubah markdown sederhana menjadi node rich text: judul (##, ###), judul polos
 * (lewat plainHeadings), daftar berbutir, dan paragraf. Judul H1 dilewati karena
 * judul halaman/berita diisi di field terpisah.
 */
function markdownToNodes(md: string, plainHeadings: Record<string, 'h2' | 'h3'> = {}): RichNode[] {
  const nodes: RichNode[] = []
  let paragraphLines: string[] = []
  let items: string[] = []

  const flushParagraph = () => {
    if (paragraphLines.length) nodes.push(paragraph(paragraphLines.join(' ')))
    paragraphLines = []
  }
  const flushList = () => {
    if (items.length) nodes.push(bulletList(items))
    items = []
  }
  const flush = () => {
    flushParagraph()
    flushList()
  }

  for (const raw of stripFrontmatter(md).split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('# ')) {
      flush()
    } else if (line.startsWith('### ')) {
      flush()
      nodes.push(heading(line.slice(4), 'h3'))
    } else if (line.startsWith('## ')) {
      flush()
      nodes.push(heading(line.slice(3), 'h2'))
    } else if (plainHeadings[line]) {
      flush()
      nodes.push(heading(line, plainHeadings[line]))
    } else if (line.startsWith('- ')) {
      flushParagraph()
      // Menghapus pemisah di akhir butir, misalnya "(PAI)," atau "(PIAUD), dan".
      items.push(
        line
          .slice(2)
          .replace(/[,;]\s*(dan|serta)?$/, '')
          .replace(/\.$/, '')
          .trim(),
      )
    } else {
      flushList()
      paragraphLines.push(line)
    }
  }
  flush()

  return nodes
}

/** Bagian "## ..." dari markdown, termasuk paragrafnya, tanpa frontmatter dan H1. */
const markdownSections = (md: string) =>
  stripFrontmatter(md)
    .split(/\n(?=## )/)
    .filter((chunk) => chunk.startsWith('## '))

// ── Foto dan Media ───────────────────────────────────────────────────────────

const PHOTO_PAGE_LABEL: Record<PhotoPage, string> = {
  profil: 'Profil Kampus',
  'program-studi': 'Program Studi',
  'pkm-penelitian': 'Penelitian dan PkM',
  'kegiatan-mahasiswa': 'Kegiatan Mahasiswa',
  berita: 'Berita',
}

type PhotoRow = { alt: string; file: string; halaman: PhotoPage; urutan: number }

function loadPhotos(): PhotoRow[] {
  const seen = new Set<string>()
  const photos: PhotoRow[] = []

  for (const row of parseCsv(readContent('foto/index.csv'))) {
    if (row.catatan?.includes('duplikat')) continue
    if (seen.has(row.file)) continue
    seen.add(row.file)

    const halaman = row.halaman as PhotoPage
    if (!(halaman in PHOTO_PAGE_LABEL)) continue

    const urutan = Number(row.urutan_di_halaman) || 0
    const nearby = row.teks_terdekat_sebelum_gambar?.trim()
    photos.push({
      alt: nearby ? nearby.slice(0, 150) : `Foto ${PHOTO_PAGE_LABEL[halaman]} ${urutan}`,
      file: row.file,
      halaman,
      urutan,
    })
  }

  return photos
}

/** Mengembalikan id Media berdasarkan nama berkas; mengunggah bila belum ada. */
async function ensureMedia(filePath: string, alt: string): Promise<number | undefined> {
  const filename = path.basename(filePath)
  const existing = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    where: { filename: { equals: filename } },
  })
  if (existing.docs[0]) return existing.docs[0].id

  try {
    const created = await payload.create({ collection: 'media', data: { alt }, filePath })
    return created.id
  } catch (error) {
    log.warn(`Gagal mengunggah ${filename}: ${errorMessage(error)}`)
    return undefined
  }
}

// ── Sumber berita ────────────────────────────────────────────────────────────

const POST_CATEGORY: Record<string, PostCategory> = {
  '01-ujian-komprehensif.md': 'akademik',
  '02-kuliah-umum-maulid-nabi.md': 'kegiatan',
  '03-sk-koordinator-kelas.md': 'kemahasiswaan',
  '04-rapat-evaluasi-dosen-pkm.md': 'akademik',
  '05-workshop-bahan-ajar-dosen.md': 'akademik',
  '06-pembukaan-pbak-2026.md': 'kemahasiswaan',
  '07-plp-kkp-2026.md': 'akademik',
  '08-wawancara-pmb-2026.md': 'kemahasiswaan',
  '09-pengantaran-mou-plp-kkp.md': 'kegiatan',
  '10-mou-penelitian-dosen.md': 'akademik',
}

type PostSource = {
  category: PostCategory
  excerpt: string
  md: string
  nodes: RichNode[]
  publishedAt?: string
  slug: string
  title: string
}

function loadPosts(): PostSource[] {
  const files = fs
    .readdirSync(path.join(CONTENT, 'berita'))
    .filter((file) => file.endsWith('.md'))
    .sort()

  return files.map((file) => {
    const md = readContent(`berita/${file}`)
    const body = stripFrontmatter(md)
    const title = md.match(/^# (.+)$/m)?.[1]?.trim()
    if (!title) throw new Error(`Judul berita tidak ditemukan: ${file}`)

    const category = POST_CATEGORY[file]
    if (!category) throw new Error(`Kategori berita belum dipetakan: ${file}`)

    const tanggal = md.match(/^tanggal:\s*(\d{4}-\d{2}-\d{2})/m)?.[1]
    const firstParagraph =
      body
        .split(/\n\s*\n/)
        .map((block) => block.trim().replace(/\s+/g, ' '))
        .find((block) => block.length >= 60 && !/^[#\-(]/.test(block)) ?? title
    const excerpt =
      firstParagraph.length > 300 ? `${firstParagraph.slice(0, 297).trimEnd()}...` : firstParagraph

    return {
      category,
      excerpt,
      md: body,
      nodes: markdownToNodes(body),
      publishedAt: tanggal ? `${tanggal}T00:00:00+08:00` : undefined,
      slug: toSlug(title) ?? file.replace(/\.md$/, ''),
      title,
    }
  })
}

// ── Proses impor ─────────────────────────────────────────────────────────────

log.info('Memulai impor konten dari content/ ...')

// 1. Menghapus contoh bawaan seed.
await payload.delete({
  collection: 'posts',
  where: {
    slug: {
      in: [
        'Website Resmi STAI Morowali Diluncurkan',
        'Pembukaan Penerimaan Mahasiswa Baru 2026/2027',
      ].map((title) => toSlug(title) ?? title),
    },
  },
})
await payload.delete({
  collection: 'announcements',
  where: {
    slug: {
      in: [
        'pengumuman-pendaftaran-mahasiswa-baru',
        'dummy-jadwal-layanan-akademik',
        'dummy-pengumuman-perkuliahan',
      ],
    },
  },
})
await payload.delete({
  collection: 'events',
  where: {
    slug: {
      in: [
        'contoh-agenda-kegiatan-kampus',
        'dummy-kuliah-umum-akademik',
        'dummy-seminar-penelitian-dosen',
      ],
    },
  },
})
await payload.delete({ collection: 'pages', where: { slug: { equals: 'contoh-halaman' } } })
log.info('Contoh bawaan seed dihapus.')

// 2. Mengunggah foto ke Media.
const photos = loadPhotos()
const mediaIds = new Map<string, number>()
for (const [index, photo] of photos.entries()) {
  const id = await ensureMedia(path.join(CONTENT, photo.file), photo.alt)
  if (id !== undefined) mediaIds.set(photo.file, id)
  if ((index + 1) % 25 === 0) log.info(`Foto diproses: ${index + 1}/${photos.length}`)
}
log.info(`Foto tersedia di Media: ${mediaIds.size}/${photos.length}.`)

const photoIdsOf = (page: PhotoPage) =>
  photos
    .filter((photo) => photo.halaman === page)
    .sort((a, b) => a.urutan - b.urutan)
    .map((photo) => mediaIds.get(photo.file))
    .filter((id): id is number => id !== undefined)

const photoAt = (page: PhotoPage, index: number) => {
  const id = photoIdsOf(page)[index]
  if (id === undefined) throw new Error(`Foto ${page} urutan ${index} tidak tersedia`)
  return id
}

// 3. Data staf dari CSV (kolom: nama, jabatan, bidang, email, nama_file_foto).
const staffRows = parseCsv(readContent('dosen-staf.csv')).filter((row) => row.nama)
const leader = staffRows.find((row) => row.jabatan.toLowerCase() === 'ketua stai morowali')

// 4. Pengaturan situs (kontak.md). Telepon, WhatsApp, dan jam layanan tidak ada di sumber.
const logoPath = path.join(ROOT, 'public/images/logo-stai-morowali.jpg')
const logoId = fs.existsSync(logoPath)
  ? await ensureMedia(logoPath, `Logo ${SITE_NAME}`)
  : undefined

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    address: 'Kelurahan Matano, Kecamatan Bungku Tengah, Kabupaten Morowali, Sulawesi Tengah',
    description:
      'Website resmi STAI Morowali: program studi, dosen, penelitian, pengabdian masyarakat, dan informasi PMB.',
    email: 'staimorowali22@gmail.com',
    fullName: SITE_FULL_NAME,
    journalDescription:
      'Rumah Jurnal STAI Morowali menjadi wadah publikasi artikel ilmiah dari dosen dan mahasiswa.',
    journalUrl: DEFAULT_JOURNAL_URL,
    logo: logoId,
    mapEmbedUrl: '',
    mapUrl: 'https://www.google.com/maps?q=-2.537117,121.963898',
    officeHours: 'Senin–Jumat, 08.00–16.00 WITA',
    phone: '0000-0000000',
    siteName: SITE_NAME,
    socials: [
      { platform: 'facebook', url: 'https://www.facebook.com/p/STAI-Morowali-100086143392777/' },
      { platform: 'instagram', url: 'https://www.instagram.com/stai.morowali/' },
      { platform: 'youtube', url: 'https://www.youtube.com/channel/UC06WbguUnoZPc8uJtoVlwww' },
    ],
    whatsapp: '6200000000000',
  },
})
log.info('Pengaturan situs diperbarui.')

// 5. Beranda (sorotan dari profil.md dan pmb.md).
await payload.updateGlobal({
  slug: 'homepage',
  data: {
    slides: [
      {
        title: 'Selamat Datang di STAI Morowali',
        subtitle: 'Perguruan tinggi Islam di Kabupaten Morowali, Sulawesi Tengah.',
        image: photoAt('profil', 0),
      },
    ],
    highlights: [
      {
        title: 'Program Studi',
        description: 'PAI, PGMI, PIAUD, dan HKI.',
        url: '/program-studi',
      },
      {
        title: 'Penelitian dan PkM',
        description: 'Penelitian dan pengabdian kepada masyarakat sebagai bagian Tri Dharma.',
        url: '/pkm-penelitian',
      },
      {
        title: 'Kegiatan Mahasiswa',
        description: 'Pengembangan akademik, kepribadian, dan kepemimpinan mahasiswa.',
        url: '/kegiatan-mahasiswa',
      },
      { title: 'Informasi PMB', description: 'Penerimaan mahasiswa baru.', url: '/pmb' },
    ],
    stats: [
      { value: '4', label: 'Program Studi' },
      { value: '2021', label: 'Tahun berdiri' },
      { value: '120', label: 'Mahasiswa baru T.A. 2026/2027' },
    ],
  },
})
log.info('Beranda diperbarui.')

// 6. Profil kampus (profil.md; pejabat dari CSV).
const PROFIL_HEADINGS: Record<string, 'h2' | 'h3'> = {
  'Sejarah Kampus STAI Morowali': 'h2',
  'Rencana Pembangunan': 'h2',
  'Kampus STAI Morowali': 'h3',
  'Peresmian dan Awal Perkembangan': 'h3',
  'Pengembangan Kampus STAI Morowali': 'h3',
  'Penguatan Mutu Akademik': 'h3',
  'Peran bagi Kabupaten Morowali': 'h3',
}
const profilBody = readContent('profil.md')
const visiSentence = profilBody
  .split(/\n\s*\n/)
  .map((block) => block.trim())
  .find((block) => block.startsWith('Ke depan, STAI Morowali'))

await payload.updateGlobal({
  slug: 'campus-profile',
  data: {
    goals: [
      'Mencetak pendidik dan tenaga profesional di bidang keagamaan.',
      'Menghasilkan lulusan yang berakhlak mulia dan kompeten.',
      'Mendukung pembangunan daerah melalui peningkatan kualitas sumber daya manusia.',
      'Menjadi mitra strategis pemerintah daerah serta Kementerian Agama dalam pengembangan pendidikan tinggi keagamaan Islam.',
    ].map((text) => ({ text })),
    greeting: paragraphs(
      'Sambutan Ketua STAI Morowali akan disampaikan langsung oleh pimpinan kampus.',
    ),
    history: richText(...markdownToNodes(profilBody, PROFIL_HEADINGS)),
    leaderName: leader?.nama ?? 'Dr. Hj. Marwany, S.Ag., M.Pd.',
    leaderTitle: 'Ketua STAI Morowali',
    missions: [
      {
        text: 'Menyelenggarakan pendidikan dan pengabdian kepada masyarakat berlandaskan nilai Islam.',
      },
    ],
    officials: staffRows.map((row) => ({ name: row.nama, position: row.jabatan })),
    vision:
      visiSentence ?? 'Menjadi perguruan tinggi keagamaan Islam yang unggul di Sulawesi Tengah.',
  },
})
log.info('Profil kampus diperbarui.')

// 7. Informasi PMB (pmb.md). Jalur, syarat, biaya, dan jadwal tidak dipublikasikan di sumber, sehingga formulir ditutup.
await payload.updateGlobal({
  slug: 'pmb-info',
  data: {
    academicYear: '2026/2027',
    contacts: [{ name: 'Panitia PMB STAI Morowali', whatsapp: '6200000000000' }],
    fees: [{ item: 'Biaya pendaftaran', amount: 'Akan diumumkan' }],
    guide: paragraphs(
      'Petunjuk teknis pendaftaran akan diumumkan panitia PMB saat formulir dibuka.',
    ),
    intro: paragraphs(
      'Wawancara penerimaan mahasiswa baru T.A. 2026/2027 dilaksanakan pada 11 Agustus 2026 oleh Ketua STAI Morowali, Dr. Hj. Marwany, S.Ag., M.Pd.',
      'PBAK T.A. 2026/2027 diikuti 120 mahasiswa baru dari 4 program studi: PAI, PGMI, PIAUD, dan HKI.',
      'Bidang kemahasiswaan menyelenggarakan PMB dan PKKMB.',
      'Jalur, syarat, biaya, dan jadwal pendaftaran akan diumumkan setelah formulir dibuka.',
    ),
    isOpen: false,
    requirements: [{ text: 'Persyaratan pendaftaran akan diumumkan panitia PMB.' }],
    schedule: [{ stage: 'Pendaftaran', date: 'Akan diumumkan' }],
    wave: 'Akan diumumkan',
  },
})
log.info('Informasi PMB diperbarui (formulir ditutup).')

// 8. Menu navigasi utama (rute yang ada di situs).
await payload.updateGlobal({
  slug: 'header',
  data: {
    navItems: [
      { label: 'Beranda', url: '/' },
      {
        label: 'Profil',
        url: '/profil',
        children: [
          { label: 'Profil Kampus', url: '/profil' },
          { label: 'Dosen & Staf', url: '/dosen-staf' },
        ],
      },
      {
        label: 'Akademik',
        url: '/program-studi',
        children: [
          { label: 'Program Studi', url: '/program-studi' },
          { label: 'Penelitian & PkM', url: '/pkm-penelitian' },
          { label: 'Kegiatan Mahasiswa', url: '/kegiatan-mahasiswa' },
          { label: 'Jurnal', url: '/jurnal' },
        ],
      },
      { label: 'PMB', url: '/pmb' },
      { label: 'Berita', url: '/berita' },
      { label: 'Galeri', url: '/galeri' },
      { label: 'Kontak', url: '/kontak' },
    ],
  },
})
log.info('Menu navigasi diperbarui.')

// 9. Program studi (program-studi.md).
const PROGRAM_LANDASAN =
  'Landasan teologis kurikulum Program Studi di STAI Morowali bersumber dari Al-Qur’an dan Hadis sebagai dasar pengembangan ilmu pengetahuan, pembentukan karakter, dan pelaksanaan pendidikan. Kurikulum diarahkan untuk membentuk lulusan yang beriman, bertakwa, berakhlak mulia, berilmu, dan mampu mengamalkan nilai-nilai Islam dalam kehidupan pribadi maupun sosial.'

const PROGRAMS = [
  {
    code: 'PAI',
    name: 'Pendidikan Agama Islam',
    summary:
      'Program Studi Pendidikan Agama Islam (PAI) mempersiapkan pendidik profesional dan kompeten dalam bidang pendidikan Islam.',
  },
  {
    code: 'PGMI',
    name: 'Pendidikan Guru Madrasah Ibtidaiyah',
    summary:
      'Program Studi Pendidikan Guru Madrasah Ibtidaiyah (PGMI) mencetak calon guru sekolah dasar/madrasah yang kreatif, inovatif, dan berkarakter.',
  },
  {
    code: 'PIAUD',
    name: 'Pendidikan Islam Anak Usia Dini',
    summary:
      'Program Studi Pendidikan Islam Anak Usia Dini (PIAUD) berfokus pada pengembangan pendidik anak usia dini yang mampu membangun generasi emas sejak masa kanak-kanak.',
  },
  {
    code: 'HKI',
    name: 'Hukum Keluarga Islam',
    summary:
      'Program Studi Hukum Keluarga Islam (HKI) menghasilkan lulusan yang memiliki kompetensi dalam bidang hukum keluarga, peradilan agama, dan penyelesaian masalah hukum Islam secara profesional.',
  },
]

for (const [index, program] of PROGRAMS.entries()) {
  const existing = await payload.find({
    collection: 'programs',
    depth: 0,
    limit: 1,
    where: { code: { equals: program.code } },
  })
  const data = {
    accreditation: 'Akan diumumkan',
    careers: [{ text: 'Lulusan dapat berkarier sesuai bidang keilmuan program studi ini.' }],
    code: program.code,
    degree: 'S1' as const,
    department: 'Akan diumumkan',
    description: paragraphs(program.summary, PROGRAM_LANDASAN),
    email: `${program.code.toLowerCase()}@example.com`,
    graduateProfiles: [{ title: 'Berkompeten dan berkarakter sesuai bidang studinya.' }],
    journalUrl: DEFAULT_JOURNAL_URL,
    missions: [{ text: 'Menyelenggarakan pembelajaran berkualitas berlandaskan nilai Islam.' }],
    name: program.name,
    objectives: [{ text: 'Menghasilkan lulusan yang kompeten dan berakhlak mulia.' }],
    order: index + 1,
    slug: toSlug(program.code)!,
    summary: program.summary,
    vision: 'Menjadi program studi unggul dalam pendidikan di Sulawesi Tengah.',
  }
  if (existing.docs[0]) {
    await payload.update({ collection: 'programs', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'programs', data })
  }
}
log.info(`Program studi diperbarui: ${PROGRAMS.length}.`)

// 10. Dosen dan staf (dosen-staf.csv). Kolom yang kosong di CSV diisi nilai pengganti.
for (const [index, row] of staffRows.entries()) {
  const existing = await payload.find({
    collection: 'staff',
    depth: 0,
    limit: 1,
    where: { name: { equals: row.nama } },
  })
  const data = {
    active: true,
    education: 'Akan diperbarui',
    email: orFallback(row.email, `dosen${index + 1}@example.com`),
    expertise: orFallback(row.bidang, 'Akan diperbarui'),
    name: row.nama,
    nidn: 'Akan diperbarui',
    order: index + 1,
    position: row.jabatan || undefined,
    scholarUrl: 'https://example.com/scholar',
    sintaUrl: 'https://example.com/sinta',
    type: 'dosen' as const,
  }
  if (existing.docs[0]) {
    await payload.update({ collection: 'staff', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'staff', data })
  }
}
log.info(`Dosen dan staf diperbarui: ${staffRows.length}.`)

// 11. Berita (content/berita). Berita tanpa tanggal disimpan sebagai draf.
const posts = loadPosts()

const coverByPost = new Map<number, number>()
for (const photo of photos.filter((item) => item.halaman === 'berita')) {
  if (photo.alt.startsWith('Foto ')) continue
  const needle = normalize(photo.alt)
  if (needle.length < 25) continue
  const postIndex = posts.findIndex((post) => normalize(post.md).includes(needle))
  const id = mediaIds.get(photo.file)
  if (postIndex >= 0 && id !== undefined && !coverByPost.has(postIndex)) {
    coverByPost.set(postIndex, id)
  }
}

for (const [index, post] of posts.entries()) {
  const existing = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    where: { slug: { equals: post.slug } },
  })
  const data = {
    _status: post.publishedAt ? ('published' as const) : ('draft' as const),
    category: post.category,
    content: richText(...post.nodes),
    coverImage: coverByPost.get(index),
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    slug: post.slug,
    title: post.title,
  }
  if (existing.docs[0]) {
    await payload.update({ collection: 'posts', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'posts', data })
  }
}
log.info(
  `Berita diperbarui: ${posts.length} (terbit: ${posts.filter((post) => post.publishedAt).length}, draf: ${posts.filter((post) => !post.publishedAt).length}).`,
)

// 12. Galeri per halaman sumber.
const GALLERIES: { description: string; page: PhotoPage; slug: string; title: string }[] = [
  {
    description: 'Dokumentasi kampus dan sejarah STAI Morowali.',
    page: 'profil',
    slug: 'dokumentasi-profil-kampus',
    title: 'Dokumentasi Profil Kampus',
  },
  {
    description: 'Dokumentasi program studi PAI, PGMI, PIAUD, dan HKI.',
    page: 'program-studi',
    slug: 'dokumentasi-program-studi',
    title: 'Dokumentasi Program Studi',
  },
  {
    description: 'Dokumentasi penelitian dan pengabdian kepada masyarakat.',
    page: 'pkm-penelitian',
    slug: 'dokumentasi-penelitian-pkm',
    title: 'Dokumentasi Penelitian dan PkM',
  },
  {
    description: 'Dokumentasi kegiatan kemahasiswaan STAI Morowali.',
    page: 'kegiatan-mahasiswa',
    slug: 'dokumentasi-kegiatan-mahasiswa',
    title: 'Dokumentasi Kegiatan Mahasiswa',
  },
  {
    description: 'Dokumentasi kegiatan yang diberitakan di situs.',
    page: 'berita',
    slug: 'dokumentasi-berita',
    title: 'Dokumentasi Berita',
  },
]

for (const gallery of GALLERIES) {
  const ids = photoIdsOf(gallery.page)
  const existing = await payload.find({
    collection: 'galleries',
    depth: 0,
    limit: 1,
    where: { slug: { equals: gallery.slug } },
  })
  const data = {
    _status: 'published' as const,
    coverImage: ids[0],
    description: gallery.description,
    photos: ids,
    slug: gallery.slug,
    title: gallery.title,
  }
  if (existing.docs[0]) {
    await payload.update({ collection: 'galleries', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'galleries', data })
  }
}
log.info(`Galeri diperbarui: ${GALLERIES.length} album.`)

// 13. Halaman builder: Penelitian dan PkM (pkm-penelitian.md).
const pkmSections = markdownSections(readContent('pkm-penelitian.md')).map((chunk) =>
  richText(...markdownToNodes(chunk)),
)

const pkmLayout = [
  {
    blockType: 'hero' as const,
    image: photoAt('pkm-penelitian', 0),
    subtitle:
      'Tri Dharma Perguruan Tinggi di STAI Morowali: penelitian, publikasi ilmiah, dan pengabdian kepada masyarakat.',
    title: 'Penelitian dan Pengabdian kepada Masyarakat (PkM)',
  },
  ...pkmSections.slice(0, 2).map((content) => ({ blockType: 'content' as const, content })),
  {
    blockType: 'mediaBlock' as const,
    caption: 'Dokumentasi kegiatan penelitian dan PkM STAI Morowali.',
    image: photoAt('pkm-penelitian', 1),
  },
  ...pkmSections.slice(2).map((content) => ({ blockType: 'content' as const, content })),
  {
    blockType: 'callToAction' as const,
    button: { label: 'Hubungi Kami', url: '/kontak' },
    text: 'Hubungi STAI Morowali untuk membahas kerja sama penelitian, publikasi, dan pengabdian kepada masyarakat.',
    title: 'Ingin berkolaborasi dalam penelitian atau pengabdian?',
  },
]

// 14. Halaman builder: Kegiatan Mahasiswa (kegiatan-mahasiswa.md).
const kegiatanBody = stripFrontmatter(readContent('kegiatan-mahasiswa.md'))
const kegiatanIntro = kegiatanBody.slice(0, kegiatanBody.indexOf('Beberapa ruang lingkup'))

const kegiatanLayout = [
  {
    blockType: 'hero' as const,
    image: photoAt('kegiatan-mahasiswa', 0),
    subtitle:
      'Pengembangan mahasiswa secara menyeluruh: akademik, kepribadian, kepemimpinan, keagamaan, dan pengabdian.',
    title: 'Info Kegiatan Mahasiswa',
  },
  {
    blockType: 'content' as const,
    content: richText(
      ...markdownToNodes(kegiatanIntro, { 'Tujuan Kemahasiswaan STAI Morowali': 'h2' }),
    ),
  },
  {
    blockType: 'cardGrid' as const,
    cards: [
      {
        description:
          'Penyelenggaraan penerimaan mahasiswa baru dan Pengenalan Kehidupan Kampus bagi Mahasiswa Baru (PKKMB) untuk memperkenalkan budaya akademik, sistem perkuliahan, dan etika mahasiswa.',
        title: 'Penerimaan Mahasiswa Baru dan PKKMB',
      },
      {
        description:
          'Pembinaan Senat Mahasiswa (SEMA), DEMA/BEM apabila tersedia, Himpunan Mahasiswa Program Studi (HMPS), dan Unit Kegiatan Mahasiswa (UKM) untuk mengembangkan kepemimpinan, komunikasi, dan manajemen organisasi.',
        title: 'Pembinaan Organisasi Kemahasiswaan',
      },
      {
        description:
          'Kegiatan olahraga, seni dan budaya, keagamaan, literasi dan karya tulis ilmiah, serta lomba akademik maupun nonakademik.',
        title: 'Pengembangan Minat dan Bakat',
      },
      {
        description:
          'Pendampingan kompetisi tingkat lokal, regional, dan nasional, pembinaan Program Kreativitas Mahasiswa (PKM), dan publikasi ilmiah mahasiswa.',
        title: 'Pengembangan Prestasi Mahasiswa',
      },
      {
        description:
          'Praktik Lapangan Persekolahan (PLP) dan Kuliah Kerja Profesi (KKP) bersama pemerintah daerah, sekolah, KUA, dan instansi lainnya.',
        title: 'Program Pengabdian dan Praktik Lapangan',
      },
      {
        description:
          'Penanaman akhlakul karimah, moderasi beragama, toleransi, integritas, dan tanggung jawab sosial.',
        title: 'Pembinaan Karakter dan Moderasi Beragama',
      },
      {
        description:
          'Pembinaan akademik, layanan administrasi kemahasiswaan, rekomendasi beasiswa, surat aktif kuliah, surat rekomendasi, pendampingan kegiatan mahasiswa, serta layanan alumni dan tracer study.',
        title: 'Layanan Kemahasiswaan',
      },
    ],
    intro: 'Beberapa ruang lingkup kemahasiswaan di STAI Morowali.',
    title: 'Ruang Lingkup Kemahasiswaan',
  },
  {
    blockType: 'mediaBlock' as const,
    caption: 'Dokumentasi kegiatan kemahasiswaan STAI Morowali.',
    image: photoAt('kegiatan-mahasiswa', 1),
  },
  {
    blockType: 'callToAction' as const,
    button: { label: 'Lihat Galeri', url: '/galeri' },
    text: 'Lihat dokumentasi lengkap kegiatan mahasiswa di galeri.',
    title: 'Kegiatan mahasiswa dalam gambar',
  },
]

for (const page of [
  { layout: pkmLayout, slug: 'pkm-penelitian', title: 'Penelitian dan PkM' },
  { layout: kegiatanLayout, slug: 'kegiatan-mahasiswa', title: 'Kegiatan Mahasiswa' },
]) {
  const existing = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: { slug: { equals: page.slug } },
  })
  const data = {
    _status: 'published' as const,
    layout: page.layout,
    slug: page.slug,
    title: page.title,
  }
  if (existing.docs[0]) {
    await payload.update({ collection: 'pages', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'pages', data })
  }
}
log.info('Halaman builder diperbarui: pkm-penelitian, kegiatan-mahasiswa.')

// 15. Pengumuman dan agenda (belum tersedia di content/).
const ANNOUNCEMENTS = [
  {
    content: paragraphs(
      'Layanan akademik dibuka pada hari kerja. Mahasiswa dapat menanyakan jadwal layanan langsung kepada bagian akademik.',
    ),
    slug: 'jadwal-layanan-akademik',
    title: 'Jadwal Layanan Akademik',
  },
  {
    content: paragraphs(
      'Perkuliahan semester baru berjalan sesuai kalender akademik. Pantau informasi resmi di website ini.',
    ),
    slug: 'pengumuman-perkuliahan-semester-baru',
    title: 'Pengumuman Perkuliahan Semester Baru',
  },
]

for (const announcement of ANNOUNCEMENTS) {
  const existing = await payload.find({
    collection: 'announcements',
    depth: 0,
    limit: 1,
    where: { slug: { equals: announcement.slug } },
  })
  const data = { ...announcement, _status: 'published' as const }
  if (existing.docs[0]) {
    await payload.update({ collection: 'announcements', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'announcements', data })
  }
}

const EVENTS = [
  {
    location: 'Aula STAI Morowali',
    slug: 'kuliah-umum-akademik',
    startDate: '2026-11-20T08:00:00+08:00',
    summary: 'Kuliah umum terbuka bagi mahasiswa dan dosen untuk menambah wawasan akademik.',
    title: 'Kuliah Umum Akademik',
  },
  {
    location: 'Ruang Seminar STAI Morowali',
    slug: 'seminar-hasil-penelitian-dosen',
    startDate: '2026-12-05T08:00:00+08:00',
    summary: 'Seminar yang memaparkan hasil penelitian dosen kepada civitas akademika.',
    title: 'Seminar Hasil Penelitian Dosen',
  },
]

for (const event of EVENTS) {
  const existing = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 1,
    where: { slug: { equals: event.slug } },
  })
  const data = { ...event, _status: 'published' as const }
  if (existing.docs[0]) {
    await payload.update({ collection: 'events', id: existing.docs[0].id, data })
  } else {
    await payload.create({ collection: 'events', data })
  }
}
log.info('Pengumuman dan agenda diperbarui.')

log.info('Impor konten selesai.')
process.exit(0)
