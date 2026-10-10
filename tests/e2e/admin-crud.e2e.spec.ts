import fs from 'node:fs'

import { expect, type Page, test } from '@playwright/test'

import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'
import { BASE_URL, newSession } from '../helpers/session'
import { cleanupTestData, MARKER, TEST_EMAIL_DOMAIN } from '../helpers/testData'

test.describe.configure({ mode: 'serial' })

let page: Page

test.beforeAll(async ({ browser }, testInfo) => {
  await seedTestUser()
  page = await newSession(browser, testInfo, {
    identifier: testUser.email,
    password: testUser.password,
  })
})

test.afterAll(async () => {
  await page?.context().close()
  await cleanupTestData()
  await cleanupTestUser()
})

test('dasbor menampilkan kartu ringkasan dan aksi cepat', async () => {
  await page.goto('/admin')

  for (const label of ['Berita', 'Pengumuman', 'Agenda', 'Pendaftar PMB', 'Pesan masuk']) {
    await expect(page.locator('.stai-dash').getByText(label, { exact: true }).first()).toBeVisible()
  }
  await page.getByRole('link', { name: 'Tambah berita' }).click()
  await expect(page).toHaveURL(/\/admin\/collections\/posts\/create/)
})

test('semua daftar koleksi dan global bisa dibuka', async () => {
  const paths = [
    ...[
      'posts',
      'announcements',
      'events',
      'pages',
      'galleries',
      'programs',
      'staff',
      'media',
      'pmb-registrations',
      'messages',
      'users',
    ].map((slug) => `/admin/collections/${slug}`),
    ...['homepage', 'campus-profile', 'pmb-info', 'site-settings', 'header', 'footer'].map(
      (slug) => `/admin/globals/${slug}`,
    ),
  ]

  for (const path of paths) {
    const response = await page.goto(path)
    expect(response?.status(), path).toBeLessThan(400)
    await expect(page.locator('h1').first(), path).toBeVisible()
  }
})

test('berita: draf tidak tampil, terbit tampil, lalu dihapus', async () => {
  const title = `${MARKER} Berita Siklus ${Date.now()}`

  await page.goto('/admin/collections/posts/create')
  await page.locator('#field-title').fill(title)
  const editor = page.locator('[data-lexical-editor="true"]').first()
  await expect(editor).toBeEditable()
  await editor.click()
  await page.keyboard.type('Isi berita uji otomatis.')
  // Lexical kadang belum siap saat diketik; pastikan isi benar-benar masuk.
  await expect(editor).toContainText('Isi berita uji otomatis.')
  await page.getByRole('button', { name: 'Simpan Draf' }).click()
  await page.waitForURL(/\/admin\/collections\/posts\/\d+/)

  const id = page.url().match(/posts\/(\d+)/)![1]
  const draft = await (await page.request.get(`/api/posts/${id}?draft=true`)).json()
  expect(draft._status).toBe('draft')
  expect(draft.slug).toMatch(/^uji-e2e-berita-siklus-\d+$/)
  expect((await fetch(`${BASE_URL}/berita/${draft.slug}`)).status).toBe(404)

  await page.getByRole('button', { name: 'Publikasikan perubahan' }).click()
  await expect(page.getByText('Berhasil diperbarui.').first()).toBeVisible()

  const published = await fetch(`${BASE_URL}/berita/${draft.slug}`)
  expect(published.status).toBe(200)
  expect(await published.text()).toContain(title)

  await page.locator('.doc-controls__popup button').first().click()
  await page.locator('#action-delete').click()
  await page.getByRole('button', { name: 'Konfirmasi' }).click()
  await page.waitForURL(/\/admin\/collections\/posts(\?.*)?$/)

  expect((await page.request.get(`/api/posts/${id}`)).status()).toBe(404)
  expect((await fetch(`${BASE_URL}/berita/${draft.slug}`)).status).toBe(404)
})

test('media: unggah gambar lalu hapus', async () => {
  await page.goto('/admin/collections/media/create')
  await page.setInputFiles('input[type="file"]', 'public/images/og-default.jpg')
  await page.locator('#field-alt').fill(`${MARKER} Logo uji`)
  await page.getByRole('button', { name: 'Simpan' }).click()
  await page.waitForURL(/\/admin\/collections\/media\/\d+/)

  const id = page.url().match(/media\/(\d+)/)![1]
  const doc = await (await page.request.get(`/api/media/${id}`)).json()
  expect(doc.mimeType).toBe('image/jpeg')
  expect(doc.sizes?.thumbnail?.url).toBeTruthy()
  expect((await page.request.get(doc.url)).status()).toBe(200)

  expect((await page.request.delete(`/api/media/${id}`)).status()).toBe(200)
  expect((await page.request.get(`/api/media/${id}`)).status()).toBe(404)
  // Payload membalas 500 (bukan 404) bila berkas tak ada di disk; cukup pastikan tidak tersaji.
  expect((await page.request.get(doc.url)).status()).not.toBe(200)
  expect(fs.existsSync(`media/${doc.filename}`)).toBe(false)
})

test('media: berkas lebih dari 5 MB ditolak', async () => {
  const image = fs.readFileSync('public/images/logo-stai-morowali.jpg')
  const buffer = Buffer.concat([image, Buffer.alloc(6 * 1024 * 1024 - image.length)])

  const response = await page.request.post('/api/media', {
    multipart: {
      _payload: JSON.stringify({ alt: `${MARKER} Terlalu besar` }),
      file: { buffer, mimeType: 'image/jpeg', name: 'uji-besar.jpg' },
    },
  })

  expect(response.status()).toBe(400)
  expect(JSON.stringify(await response.json())).toContain('Ukuran berkas maksimal 5 MB.')
})

test('pesan masuk: status bisa diubah dari admin', async () => {
  const created = await page.request.post('/api/messages', {
    data: {
      email: `status@${TEST_EMAIL_DOMAIN}`,
      message: 'Pesan uji untuk ubah status.',
      name: `${MARKER} Status`,
      subject: `${MARKER} Ubah status`,
    },
  })
  expect(created.status()).toBe(201)
  const { doc } = await created.json()
  expect(doc.status).toBe('baru')

  await page.goto(`/admin/collections/messages/${doc.id}`)
  await page.locator('#field-status .rs__control').click()
  await page.locator('.rs__option', { hasText: 'Sudah dibaca' }).click()
  await page.getByRole('button', { name: 'Simpan' }).click()
  await expect(page.getByText('Berhasil diperbarui.').first()).toBeVisible()

  const updated = await (await page.request.get(`/api/messages/${doc.id}`)).json()
  expect(updated.status).toBe('dibaca')
})

test('ekspor Excel pendaftar PMB dan pesan', async () => {
  const programs = await (await page.request.get('/api/programs?limit=1')).json()
  const created = await page.request.post('/api/pmb-registrations', {
    data: {
      address: 'Jalan Uji Coba No. 1, Bungku',
      birthDate: '2007-01-01T00:00:00.000Z',
      birthPlace: 'Bungku',
      firstChoice: programs.docs[0].id,
      fullName: `${MARKER} Calon Mahasiswa`,
      gender: 'L',
      graduationYear: 2026,
      nik: `9999${String(Date.now()).slice(-12)}`,
      phone: '081234567890',
      schoolOrigin: 'MA Uji',
    },
  })
  expect(created.status()).toBe(201)
  expect((await created.json()).doc.registrationNumber).toMatch(/^PMB-\d{4}-\d{4}$/)

  await page.goto('/admin/collections/pmb-registrations')
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /Ekspor ke Excel/ }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^pendaftar-pmb-\d{4}-\d{2}-\d{2}\.xlsx$/)

  for (const [collection, prefix] of [
    ['pmb-registrations', 'pendaftar-pmb'],
    ['messages', 'pesan-masuk'],
  ]) {
    const response = await page.request.get(
      `/api/${collection}/export?sort=-createdAt&where[createdAt][exists]=true`,
    )
    expect(response.status(), collection).toBe(200)
    expect(response.headers()['content-type']).toContain('spreadsheetml.sheet')
    expect(response.headers()['content-disposition']).toContain(`${prefix}-`)
    const body = await response.body()
    expect(body.subarray(0, 2).toString()).toBe('PK')
  }
})

test('daftar pengguna memuat akun admin', async () => {
  const users = await (await page.request.get('/api/users?limit=50')).json()
  expect(users.docs.some((user: { username?: string }) => user.username === 'admin')).toBe(true)
})
