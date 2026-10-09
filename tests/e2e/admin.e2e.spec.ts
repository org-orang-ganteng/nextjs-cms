import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Panel Admin', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('dapat membuka dasbor', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    await expect(page.getByRole('link', { name: 'Pendaftar PMB' }).first()).toBeVisible()
  })

  test('dapat membuka daftar pendaftar PMB beserta tombol ekspor', async () => {
    await page.goto('http://localhost:3000/admin/collections/pmb-registrations')
    await expect(page.locator('h1', { hasText: 'Pendaftar PMB' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Ekspor ke Excel/ })).toBeVisible()
  })

  test('dapat membuka form pengguna baru', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})
