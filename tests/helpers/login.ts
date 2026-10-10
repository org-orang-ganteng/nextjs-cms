import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  serverURL = 'http://localhost:3000',
  user,
}: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/login`)

  await page.fill('#identifier', user.email)
  await page.fill('#password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  // Label navigasi berasal dari konfigurasi koleksi (tidak tergantung bahasa UI admin).
  await expect(page.getByRole('link', { name: 'Pengguna' }).first()).toBeVisible()
}
