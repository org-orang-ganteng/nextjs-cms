import { execFileSync } from 'node:child_process'

import { test } from '@e2e-dev/web'
import { afterAll, expect } from 'e2e'

import { MARKER, TEST_EMAIL_DOMAIN } from '../helpers/markers'

afterAll(() => {
  execFileSync('pnpm', ['test:cleanup'], { stdio: 'ignore', timeout: 25_000 })
})

test('formulir kontak menampilkan galat per isian dan mempertahankan nilai', async ({
  app,
  screen,
}) => {
  await app.open('/kontak')

  await screen.getByLabel('Nama').fill('A')
  await screen.getByLabel('Email').fill('bukan-email')
  await screen.getByLabel('Telepon/WhatsApp', { exact: false }).fill('123')
  await screen.getByLabel('Subjek').fill('ab')
  await screen.getByLabel('Pesan').fill('pendek')
  await screen.getByRole('button', 'Kirim pesan').click()

  await expect(
    screen.getByRole('alert').filter({ hasText: 'Periksa kembali isian yang ditandai.' }),
  ).toBeVisible()
  for (const message of [
    'Nama minimal 2 karakter.',
    'Alamat email tidak valid.',
    'Nomor WhatsApp tidak valid, contoh: 081234567890.',
    'Subjek minimal 3 karakter.',
    'Pesan minimal 10 karakter.',
  ]) {
    await expect(screen.getByText(message)).toBeVisible()
  }
  await expect(screen.getByLabel('Email')).toHaveValue('bukan-email')
  await expect(screen.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
})

test('formulir kontak berhasil mengirim pesan', async ({ app, screen }) => {
  await app.open('/kontak')

  await screen.getByLabel('Nama').fill(`${MARKER} Pengunjung`)
  await screen.getByLabel('Email').fill(`pengunjung@${TEST_EMAIL_DOMAIN}`)
  await screen.getByLabel('Telepon/WhatsApp', { exact: false }).fill('0812 3456 7890')
  await screen.getByLabel('Subjek').fill(`${MARKER} Pertanyaan pendaftaran`)
  await screen.getByLabel('Pesan').fill('Pesan uji otomatis, mohon diabaikan.')
  await screen.getByRole('button', 'Kirim pesan').click()

  await expect(
    screen.getByRole('status').filter({ hasText: 'Terima kasih, pesan Anda sudah terkirim.' }),
  ).toBeVisible()
})

test('login menolak kredensial salah', async ({ app, browser, screen }) => {
  await app.open('/login')

  // Sengaja memakai akun yang tidak ada agar akun asli tidak terkunci.
  await screen.getByLabel('Username atau Email').fill('tidak-ada-uji-e2e')
  await screen.getByLabel('Password').fill('password-salah')
  await screen.getByRole('button', 'Masuk').click()

  await expect(
    screen.getByRole('alert').filter({ hasText: 'Username atau password salah.' }),
  ).toBeVisible()
  await expect(browser).toHaveURL('/login')
  await expect(screen.getByLabel('Username atau Email')).toHaveValue('tidak-ada-uji-e2e')
})

test('tombol tampilkan password mengubah jenis isian', async ({ app, screen }) => {
  await app.open('/login')
  const password = screen.getByLabel('Password')
  await password.fill('rahasia')
  await expect(screen.getByRole('button', 'Tampilkan password')).toHaveAttribute(
    'aria-pressed',
    'false',
  )

  await screen.getByRole('button', 'Tampilkan password').click()
  // Isian password tidak boleh dibaca runner; setelah ditampilkan ia menjadi isian teks biasa.
  await expect(password).toHaveAttribute('type', 'text')
  await expect(password).toHaveValue('rahasia')
  await expect(screen.getByRole('button', 'Sembunyikan password')).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await screen.getByRole('button', 'Sembunyikan password').click()
  await expect(screen.getByRole('button', 'Tampilkan password')).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})
