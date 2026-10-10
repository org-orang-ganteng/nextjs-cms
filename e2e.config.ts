import type { E2EConfig } from 'e2e'
import { web } from '@e2e-dev/web'

// Runner e2e (tester-army). Tes Playwright lama tetap di tests/e2e/*.e2e.spec.ts.
export default {
  tests: ['tests/e2e-ai/**/*.e2e.ts'],
  // Server dev mengompilasi rute saat pertama dibuka; 5 dtk bawaan terlalu singkat.
  assertionTimeout: 15_000,
  targets: [
    {
      // IP acak per run agar pembatas laju formulir tidak terbawa dari run sebelumnya.
      engine: web({
        headers: { 'x-real-ip': `198.51.100.${Math.floor(Math.random() * 254) + 1}` },
      }),
      app: {
        url: process.env.APP_URL ?? 'http://localhost:3000',
        command: { executable: 'pnpm', args: ['dev'], reuseExisting: true },
      },
    },
  ],
} satisfies E2EConfig
