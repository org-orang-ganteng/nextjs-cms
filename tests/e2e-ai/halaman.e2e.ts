import { test } from '@e2e-dev/web'
import { expect } from 'e2e'

const STATIC_PAGES = [
  { path: '/profil', title: 'Profil Kampus', crumb: 'Profil' },
  { path: '/program-studi', title: 'Program Studi', crumb: 'Program Studi' },
  { path: '/dosen-staf', title: 'Dosen & Staf', crumb: 'Dosen & Staf' },
  { path: '/berita', title: 'Berita', crumb: 'Berita' },
  { path: '/pengumuman', title: 'Pengumuman', crumb: 'Pengumuman' },
  { path: '/agenda', title: 'Agenda Kegiatan', crumb: 'Agenda' },
  { path: '/galeri', title: 'Galeri', crumb: 'Galeri' },
  { path: '/pmb', title: 'Penerimaan Mahasiswa Baru', crumb: 'PMB' },
  { path: '/pmb/daftar', title: 'Formulir Pendaftaran Awal', crumb: 'Formulir Pendaftaran' },
  { path: '/kontak', title: 'Kontak & Lokasi', crumb: 'Kontak' },
]

for (const page of STATIC_PAGES) {
  test(`halaman ${page.path} tampil dengan judul dan breadcrumb`, async ({ app, screen }) => {
    await app.open(page.path)

    await expect(screen.getByRole('heading', page.title, { level: 1 })).toBeVisible()
    const breadcrumb = screen.getByRole('navigation', 'Breadcrumb')
    await expect(breadcrumb.getByRole('link', 'Beranda')).toBeVisible()
    await expect(breadcrumb.getByText(page.crumb)).toHaveAttribute('aria-current', 'page')
  })
}

// Kartu daftar memakai judul h3 berisi tautan; pengumuman memakai item daftar.
const DETAIL_LISTS = [
  { path: '/berita', crumb: 'Berita' },
  { path: '/agenda', crumb: 'Agenda' },
  { path: '/galeri', crumb: 'Galeri' },
  { path: '/program-studi', crumb: 'Program Studi' },
]

for (const list of DETAIL_LISTS) {
  test(`item pertama ${list.path} membuka halaman detail`, async ({ app, browser, screen }) => {
    await app.open(list.path)

    const link = screen
      .getByRole('main')
      .getByRole('heading', { level: 3 })
      .first()
      .getByRole('link')
    const title = (await link.textContent())?.trim() ?? ''
    const href = (await link.getAttribute('href')) ?? ''
    expect(href.startsWith(`${list.path}/`)).toBe(true)

    await link.click()

    await expect(browser).toHaveURL(href)
    await expect(screen.getByRole('heading', title, { level: 1 })).toBeVisible()
    await expect(
      screen.getByRole('navigation', 'Breadcrumb').getByRole('link', list.crumb),
    ).toBeVisible()
  })
}

test('item pertama /pengumuman membuka halaman detail', async ({ app, browser, screen }) => {
  await app.open('/pengumuman')

  let link = screen.getByRole('main').getByRole('link').first()
  for (const candidate of await screen.getByRole('main').getByRole('link').all()) {
    if ((await candidate.getAttribute('href'))?.startsWith('/pengumuman/')) {
      link = candidate
      break
    }
  }
  const href = (await link.getAttribute('href')) ?? ''
  expect(href.startsWith('/pengumuman/')).toBe(true)

  await link.click()

  await expect(browser).toHaveURL(href)
  await expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    screen.getByRole('navigation', 'Breadcrumb').getByRole('link', 'Pengumuman'),
  ).toBeVisible()
})

test('slug detail yang tidak ada menampilkan 404', async ({ app, screen }) => {
  for (const path of [
    '/berita/tidak-ada-uji',
    '/program-studi/tidak-ada-uji',
    '/galeri/tidak-ada-uji',
  ]) {
    await app.open(path)
    await expect(screen.getByRole('heading', 'Halaman tidak ditemukan')).toBeVisible()
  }
})

test('filter kategori berita menandai kategori aktif', async ({ app, browser, screen }) => {
  await app.open('/berita')
  const categories = screen.getByRole('navigation', 'Kategori berita')
  await expect(categories.getByRole('link', 'Semua')).toHaveAttribute('aria-current', 'page')

  await categories.getByRole('link', 'Akademik').click()

  await expect(browser).toHaveURL('/berita?kategori=akademik')
  await expect(categories.getByRole('link', 'Akademik')).toHaveAttribute('aria-current', 'page')
  expect(await screen.getByRole('main').getByRole('heading', { level: 3 }).count()).toBeGreaterThan(
    0,
  )
})

test('kategori berita tak dikenal kembali ke semua berita', async ({ app, screen }) => {
  await app.open('/berita?kategori=tidak-ada')

  await expect(
    screen.getByRole('navigation', 'Kategori berita').getByRole('link', 'Semua'),
  ).toHaveAttribute('aria-current', 'page')
})

test('halaman berita di luar jangkauan menampilkan keadaan kosong', async ({ app, screen }) => {
  await app.open('/berita?page=999')

  await expect(screen.getByText('Belum ada berita.')).toBeVisible()
})

test('filter dosen & staf per tipe dan program studi', async ({ app, browser, screen }) => {
  await app.open('/dosen-staf')
  const tabs = screen.getByRole('navigation', 'Kategori')

  await tabs.getByRole('link', 'Dosen').click()
  await expect(browser).toHaveURL('/dosen-staf?tipe=dosen')
  await expect(tabs.getByRole('link', 'Dosen')).toHaveAttribute('aria-current', 'page')

  await screen.getByLabel('Program studi').selectOption({ value: 'pai' })
  await screen.getByRole('button', 'Terapkan').click()
  await expect(browser).toHaveURL('/dosen-staf?tipe=dosen&prodi=pai')
  await expect(screen.getByLabel('Program studi')).toHaveValue('pai')
  await expect(tabs.getByRole('link', 'Dosen')).toHaveAttribute('aria-current', 'page')
})

test('tombol daftar di detail prodi membuka formulir PMB', async ({ app, browser, screen }) => {
  await app.open('/program-studi/pai')

  await screen.getByRole('link', 'Daftar ke prodi ini').click()

  await expect(browser).toHaveURL('/pmb/daftar?prodi=pai')
  await expect(screen.getByRole('heading', 'Formulir Pendaftaran Awal', { level: 1 })).toBeVisible()
})

test('status PMB konsisten dengan formulir pendaftaran', async ({ app, screen }) => {
  await app.open('/pmb')
  const isOpen = (await screen.getByText('Pendaftaran belum dibuka').count()) === 0

  if (isOpen) {
    await expect(screen.getByText('Pendaftaran dibuka', { exact: false })).toBeVisible()
    await screen.getByRole('link', 'Isi formulir pendaftaran').click()
    await expect(screen.getByRole('button', 'Kirim pendaftaran', { exact: false })).toBeVisible()
  } else {
    await expect(screen.getByRole('link', 'Isi formulir pendaftaran')).toHaveCount(0)
    await app.open('/pmb/daftar')
    await expect(screen.getByRole('link', 'Lihat informasi PMB')).toBeVisible()
  }
})
