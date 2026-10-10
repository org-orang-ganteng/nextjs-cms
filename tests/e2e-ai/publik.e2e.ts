import { test } from '@e2e-dev/web'
import { expect } from 'e2e'

test('beranda tampil dengan identitas kampus', async ({ app, browser, screen }) => {
  await app.open('/')

  await expect(browser).toHaveTitle(/STAI Morowali/)
  await expect(screen.getByRole('heading', 'Berita Terbaru')).toBeVisible()
  await expect(screen.getByRole('heading', 'Program Studi')).toBeVisible()
})

test('menu utama membuka halaman berita', async ({ app, browser, screen }) => {
  await app.open('/')

  await screen
    .getByRole('navigation', 'Menu utama')
    .getByRole('link', 'Berita', { visible: true })
    .first()
    .click()

  await expect(browser).toHaveURL('/berita')
  await expect(screen.getByRole('heading', 'Berita', { level: 1 })).toBeVisible()
})

test('menu ponsel bisa dibuka dan ditutup', async ({ app, browser, screen }) => {
  await browser.setViewport({ width: 390, height: 844 })
  await app.open('/')

  await screen.getByRole('button', 'Buka menu').click()
  const menu = screen.getByRole('dialog', 'Menu')
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('link', 'Login')).toBeVisible()

  await menu.getByRole('button', 'Tutup menu').click()
  await expect(menu).toBeHidden()
})

test('halaman program studi tampil', async ({ app, screen }) => {
  await app.open('/program-studi')

  await expect(screen.getByRole('heading', 'Program Studi', { level: 1 })).toBeVisible()
})

test('alamat tak dikenal menampilkan halaman 404', async ({ app, screen }) => {
  await app.open('/halaman-yang-tidak-ada')

  await expect(screen.getByRole('heading', 'Halaman tidak ditemukan')).toBeVisible()
  await expect(screen.getByRole('link', 'Ke beranda')).toBeVisible()
})

test('formulir kontak menolak isian kosong', async ({ app, screen }) => {
  await app.open('/kontak')

  await screen.getByRole('button', 'Kirim pesan').click()

  await expect(
    screen.getByRole('alert').filter({ hasText: 'Periksa kembali isian yang ditandai.' }),
  ).toBeVisible()
  await expect(screen.getByLabel('Nama', { exact: false })).toHaveAttribute('aria-invalid', 'true')
})

test('login menolak isian kosong', async ({ app, screen }) => {
  await app.open('/login')

  await screen.getByRole('button', 'Masuk').click()

  await expect(
    screen.getByRole('alert').filter({ hasText: 'Isi username/email dan password.' }),
  ).toBeVisible()
})

test('panel admin tanpa login diarahkan ke /login', async ({ app, browser, screen }) => {
  await app.open('/admin')

  await expect(browser).toHaveURL(/\/login/)
  await expect(screen.getByLabel('Username atau Email')).toBeVisible()
})
