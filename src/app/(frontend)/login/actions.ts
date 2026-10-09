'use server'

import config from '@payload-config'
import { login } from '@payloadcms/next/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import type { FormState } from '@/lib/forms'
import { clientIp, isRateLimited } from '@/lib/rate-limit'

/** Login admin memakai autentikasi bawaan Payload (cookie HTTP-only `payload-token`). */
export async function loginAdmin(_state: FormState, formData: FormData): Promise<FormState> {
  const identifier = String(formData.get('identifier') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const values = { identifier }

  if (!identifier || !password) {
    return { message: 'Isi username/email dan password.', status: 'error', values }
  }

  // Lapisan tambahan per IP; penguncian akun tetap diatur `maxLoginAttempts` & `lockTime`.
  if (isRateLimited(`login:${clientIp(await headers())}`, 10, 15 * 60 * 1000)) {
    return {
      message: 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.',
      status: 'error',
      values,
    }
  }

  try {
    await login(
      identifier.includes('@')
        ? { collection: 'users', config, email: identifier, password }
        : { collection: 'users', config, password, username: identifier },
    )
  } catch {
    // Pesan sama untuk semua kegagalan agar tidak membocorkan akun mana yang ada/terkunci.
    return { message: 'Username atau password salah.', status: 'error', values }
  }

  redirect('/admin')
}
