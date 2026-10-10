import { expect, type Page, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'
import { BASE_URL, newSession } from '../helpers/session'
import {
  cleanupTestData,
  editorUser,
  MARKER,
  openPmbTemporarily,
  seedEditorUser,
  TEST_EMAIL_DOMAIN,
} from '../helpers/testData'

test.afterAll(async () => {
  await cleanupTestData()
})

test.describe('REST API tanpa login', () => {
  test('data pribadi tidak bisa dibaca', async ({ request }) => {
    for (const path of ['/api/messages', '/api/pmb-registrations', '/api/users']) {
      expect((await request.get(`${BASE_URL}${path}`)).status(), path).toBe(403)
    }
  })

  test('ekspor Excel ditolak', async ({ request }) => {
    for (const path of ['/api/pmb-registrations/export', '/api/messages/export']) {
      expect((await request.get(`${BASE_URL}${path}`)).status(), path).toBe(403)
    }
  })

  test('hanya berita terbit yang terlihat', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/posts?limit=100&draft=true`)
    expect(response.status()).toBe(200)
    const { docs } = await response.json()
    expect(docs.length).toBeGreaterThan(0)
    expect(docs.every((doc: { _status: string }) => doc._status === 'published')).toBe(true)
  })

  test('tidak bisa menulis konten, pesan, atau pengaturan', async ({ request }) => {
    const writes = [
      request.post(`${BASE_URL}/api/posts`, { data: { title: `${MARKER} Anonim` } }),
      request.post(`${BASE_URL}/api/messages`, {
        data: { email: `anon@${TEST_EMAIL_DOMAIN}`, message: 'x', name: 'x', subject: 'x' },
      }),
      request.post(`${BASE_URL}/api/users`, {
        data: { email: `anon@${TEST_EMAIL_DOMAIN}`, password: 'x', username: 'anon-uji' },
      }),
      request.post(`${BASE_URL}/api/globals/site-settings`, { data: { siteName: 'Diretas' } }),
      request.post(`${BASE_URL}/api/globals/pmb-info`, { data: { isOpen: true } }),
    ]
    for (const response of await Promise.all(writes)) {
      expect(response.status(), response.url()).toBe(403)
    }
  })
})

test.describe('Formulir kontak', () => {
  test('honeypot terisi: tampil sukses tapi tidak disimpan', async ({ page }) => {
    const email = `bot@${TEST_EMAIL_DOMAIN}`
    await page.goto(`${BASE_URL}/kontak`)
    await page.fill('#name', `${MARKER} Bot`)
    await page.fill('#email', email)
    await page.fill('#subject', `${MARKER} Spam`)
    await page.fill('#message', 'Pesan bot yang seharusnya dibuang.')
    await page.locator('#website').fill('https://spam.example')
    await page.getByRole('button', { name: 'Kirim pesan' }).click()

    await expect(page.getByRole('status')).toContainText('Terima kasih')
    const payload = await getPayload({ config })
    const { totalDocs } = await payload.count({
      collection: 'messages',
      where: { email: { equals: email } },
    })
    expect(totalDocs).toBe(0)
  })
})

test.describe('Formulir PMB', () => {
  let restorePmb: (() => Promise<void>) | undefined

  test.beforeAll(async () => {
    restorePmb = await openPmbTemporarily()
  })

  test.afterAll(async () => {
    await restorePmb?.()
  })

  test('menolak isian kosong', async ({ page }) => {
    await page.goto(`${BASE_URL}/pmb/daftar`)
    await page.getByRole('button', { name: 'Kirim pendaftaran' }).click()
    await expect(page.getByText('Periksa kembali isian yang ditandai.')).toBeVisible()
    await expect(page.locator('#nik-error')).toContainText('NIK')
  })

  test('pendaftaran tersimpan dengan nomor PMB dan NIK ganda ditolak', async ({ page }) => {
    const nik = `9999${String(Date.now()).slice(-12)}`
    const fillForm = async () => {
      await page.goto(`${BASE_URL}/pmb/daftar`)
      await page.fill('#fullName', `${MARKER} Calon Mahasiswa`)
      await page.fill('#nik', nik)
      await page.selectOption('#gender', 'P')
      await page.fill('#birthPlace', 'Bungku')
      await page.fill('#birthDate', '2007-05-17')
      await page.fill('#phone', '081234567890')
      await page.fill('#email', `pmb@${TEST_EMAIL_DOMAIN}`)
      await page.fill('#address', 'Jalan Uji Coba No. 1, Bungku Tengah')
      await page.fill('#schoolOrigin', 'MA Uji Morowali')
      await page.fill('#graduationYear', String(new Date().getFullYear()))
      await page.selectOption('#firstChoice', { index: 1 })
      await page.check('#consent')
      await page.getByRole('button', { name: 'Kirim pendaftaran' }).click()
    }

    await fillForm()
    const status = page.getByRole('status')
    await expect(status).toContainText('Pendaftaran awal terkirim')
    const number = (await status.locator('.font-mono').textContent())?.trim()
    expect(number).toMatch(/^PMB-\d{4}-\d{4}$/)

    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pmb-registrations',
      where: { nik: { equals: nik } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ registrationNumber: number, status: 'baru' })

    await fillForm()
    await expect(page.locator('#nik-error')).toContainText('NIK ini sudah terdaftar')
  })
})

test.describe('Login & logout', () => {
  test.beforeAll(async () => {
    await seedTestUser()
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('login dengan username lalu logout', async ({ browser }, testInfo) => {
    const page = await newSession(browser, testInfo, {
      identifier: testUser.username,
      password: testUser.password,
    })
    const cookies = await page.context().cookies()
    const token = cookies.find((cookie) => cookie.name === 'payload-token')
    expect(token?.httpOnly).toBe(true)

    await page.goto('/admin/logout')
    await page.waitForURL(/\/login/)
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
    await page.context().close()
  })

  test('pengguna yang sudah login dialihkan dari /login ke /admin', async ({
    browser,
  }, testInfo) => {
    const page = await newSession(browser, testInfo, {
      identifier: testUser.email,
      password: testUser.password,
    })
    await page.goto('/login')
    await expect(page).toHaveURL(`${BASE_URL}/admin`)
    await page.context().close()
  })
})

test.describe('Hak akses editor', () => {
  test.describe.configure({ mode: 'serial' })
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    await seedEditorUser()
    page = await newSession(browser, testInfo, {
      identifier: editorUser.username,
      password: editorUser.password,
    })
  })

  test.afterAll(async () => {
    await page?.context().close()
  })

  test('editor bisa membuat berita dan mengekspor data', async () => {
    const response = await page.request.post('/api/posts?draft=true', {
      data: { _status: 'draft', title: `${MARKER} Berita Editor` },
    })
    expect(response.status()).toBe(201)
    expect((await page.request.get('/api/pmb-registrations/export')).status()).toBe(200)
  })

  test('editor tidak bisa mengelola pengguna atau pengaturan situs', async () => {
    const createUser = await page.request.post('/api/users', {
      data: { email: `baru@${TEST_EMAIL_DOMAIN}`, password: 'rahasia-123', username: 'baru-uji' },
    })
    expect(createUser.status()).toBe(403)

    const settings = await page.request.post('/api/globals/site-settings', {
      data: { siteName: 'Diubah editor' },
    })
    expect(settings.status()).toBe(403)

    const users = await (await page.request.get('/api/users')).json()
    expect(users.docs.map((user: { email: string }) => user.email)).toEqual([editorUser.email])
  })

  test('editor tidak bisa menaikkan perannya sendiri', async () => {
    const me = await (await page.request.get('/api/users/me')).json()
    await page.request.patch(`/api/users/${me.user.id}`, { data: { roles: ['admin'] } })

    const after = await (await page.request.get(`/api/users/${me.user.id}`)).json()
    expect(after.roles).toEqual(['editor'])
  })

  test('editor tidak bisa menghapus pendaftar PMB', async () => {
    const programs = await (await page.request.get('/api/programs?limit=1')).json()
    const created = await page.request.post('/api/pmb-registrations', {
      data: {
        address: 'Jalan Uji Coba No. 2, Bungku',
        birthDate: '2007-01-01T00:00:00.000Z',
        birthPlace: 'Bungku',
        firstChoice: programs.docs[0].id,
        fullName: `${MARKER} Pendaftar Editor`,
        gender: 'P',
        graduationYear: 2026,
        nik: `9999${String(Date.now()).slice(-12)}`,
        phone: '081234567891',
        schoolOrigin: 'MA Uji',
      },
    })
    expect(created.status()).toBe(201)
    const { doc } = await created.json()

    expect((await page.request.delete(`/api/pmb-registrations/${doc.id}`)).status()).toBe(403)
  })

  test('panel admin editor tidak menampilkan form pengguna baru', async () => {
    await page.goto('/admin/collections/users/create')
    await expect(page.locator('input[name="email"]')).toHaveCount(0)
  })
})
