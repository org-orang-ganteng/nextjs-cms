import { type Browser, expect, type Page, type TestInfo } from '@playwright/test'

export const BASE_URL = 'http://localhost:3000'

/** Konteks baru berbahasa Indonesia yang sudah login lewat /login. */
export async function newSession(
  browser: Browser,
  testInfo: TestInfo,
  user: { identifier: string; password: string },
): Promise<Page> {
  const context = await browser.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: testInfo.project.use.extraHTTPHeaders,
    locale: 'id-ID',
    viewport: testInfo.project.use.viewport,
  })
  const page = await context.newPage()

  await page.goto('/login')
  await page.fill('#identifier', user.identifier)
  await page.fill('#password', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}/admin`)
  await expect(page.getByRole('heading', { name: /Selamat datang/ })).toBeVisible()
  return page
}
