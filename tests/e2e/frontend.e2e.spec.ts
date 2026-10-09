import { test, expect } from '@playwright/test'

test.describe('Website publik', () => {
  test('beranda tampil dengan identitas kampus', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/STAI Morowali/)
    await expect(page.getByRole('link', { name: /STAI Morowali/ }).first()).toBeVisible()
  })

  test('halaman program studi menampilkan daftar prodi', async ({ page }) => {
    await page.goto('http://localhost:3000/program-studi')
    await expect(page.getByRole('heading', { level: 1, name: 'Program Studi' })).toBeVisible()
  })

  test('formulir PMB menolak isian kosong', async ({ page }) => {
    await page.goto('http://localhost:3000/pmb/daftar')
    const submit = page.getByRole('button', { name: 'Kirim pendaftaran' })
    test.skip(!(await submit.isVisible()), 'Pendaftaran sedang ditutup')
    await submit.click()
    await expect(page.getByText('Periksa kembali isian yang ditandai.')).toBeVisible()
  })
})
