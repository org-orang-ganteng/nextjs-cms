import { test, expect } from '@playwright/test'

import { addTemporarySlide } from '../helpers/testData'

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
})

test.describe('Carousel beranda', () => {
  let restoreSlides: (() => Promise<void>) | undefined

  test.beforeAll(async () => {
    restoreSlides = await addTemporarySlide()
  })

  test.afterAll(async () => {
    await restoreSlides?.()
  })

  test('bisa berpindah ke slide berikutnya', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const hero = page.getByRole('region', { name: 'Sorotan utama' })
    const dots = hero.getByRole('button', { name: /^Tampilkan slide/ })
    const total = await dots.count()
    expect(total).toBeGreaterThanOrEqual(2)

    await dots.nth(1).click()

    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true')
    await expect(hero.getByRole('group', { name: `2 dari ${total}` })).toBeVisible()
  })
})
