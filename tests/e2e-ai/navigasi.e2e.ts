import { test } from '@e2e-dev/web'
import { expect } from 'e2e'

const BASE_URL = process.env.APP_URL ?? 'http://localhost:3000'

test('tautan lewati konten membawa fokus ke konten utama', async ({ app, browser, screen }) => {
  await app.open('/')

  // Tautan ini hanya terlihat saat fokus keyboard.
  await screen.getByRole('link', 'Lewati ke konten utama').press('Enter')

  await expect(browser).toHaveURL('/#konten')
})

test('breadcrumb Beranda kembali ke beranda', async ({ app, browser, screen }) => {
  await app.open('/pengumuman')

  await screen.getByRole('navigation', 'Breadcrumb').getByRole('link', 'Beranda').click()

  await expect(browser).toHaveURL('/')
})

test('menu utama menandai halaman aktif', async ({ app, screen }) => {
  await app.open('/berita')

  await expect(
    screen
      .getByRole('navigation', 'Menu utama')
      .getByRole('link', 'Berita', { visible: true })
      .first(),
  ).toHaveAttribute('aria-current', 'page')
})

test('footer menampilkan hak cipta tahun berjalan', async ({ app, screen }) => {
  await app.open('/')

  await expect(
    screen.getByRole('contentinfo').getByText(`© ${new Date().getFullYear()}`, { exact: false }),
  ).toBeVisible()
})

test('carousel beranda bisa berpindah slide', async ({ app, screen }) => {
  await app.open('/')
  const hero = screen.getByRole('region', 'Sorotan utama')
  const dots = hero.getByRole('button', 'Tampilkan slide', { exact: false })
  const total = await dots.count()
  test.skip(total < 2, 'beranda hanya punya satu slide')

  await dots.nth(1).click()

  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
  await expect(hero.getByRole('group', `2 dari ${total}`)).toBeVisible()
})

test('header keamanan terpasang', async () => {
  const response = await fetch(`${BASE_URL}/`)

  expect(response.status).toBe(200)
  expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN')
  expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  expect(response.headers.get('referrer-policy')).toBeTruthy()
})

test('robots.txt menutup /admin dan /api', async () => {
  const response = await fetch(`${BASE_URL}/robots.txt`)
  const body = await response.text()

  expect(response.status).toBe(200)
  expect(body).toContain('Disallow: /admin')
  expect(body).toContain('Disallow: /api')
  expect(body).toContain('sitemap.xml')
})

test('semua URL di sitemap.xml bisa dibuka', { timeout: 180_000 }, async () => {
  const response = await fetch(`${BASE_URL}/sitemap.xml`)
  const xml = await response.text()
  expect(response.status).toBe(200)

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!))
  expect(urls.length).toBeGreaterThan(10)

  const failed: string[] = []
  for (const url of urls) {
    const page = await fetch(`${BASE_URL}${url.pathname}`)
    if (page.status !== 200) failed.push(`${url.pathname} -> ${page.status}`)
  }
  expect(failed).toEqual([])
})

test('/jurnal mengarah ke situs jurnal', async () => {
  const response = await fetch(`${BASE_URL}/jurnal`, { redirect: 'manual' })

  expect([307, 308]).toContain(response.status)
  expect(response.headers.get('location')).toMatch(/^https?:\/\//)
})

test('/admin/login dialihkan ke /login', async () => {
  const response = await fetch(`${BASE_URL}/admin/login`, { redirect: 'manual' })

  expect([307, 308]).toContain(response.status)
  expect(response.headers.get('location')).toMatch(/\/login$/)
})
