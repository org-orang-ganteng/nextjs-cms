'use server'

import { headers } from 'next/headers'

import { contactSchema, fieldErrors, type FormState, formValues } from '@/lib/forms'
import { getPayloadClient } from '@/lib/queries'
import { clientIp, isRateLimited } from '@/lib/rate-limit'

export async function submitContact(_state: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData)

  // Honeypot: bot mengisi field tersembunyi; tampilkan "sukses" palsu tanpa menyimpan.
  if (values.website)
    return { message: 'Terima kasih, pesan Anda sudah terkirim.', status: 'success' }

  if (isRateLimited(`kontak:${clientIp(await headers())}`, 5, 10 * 60 * 1000)) {
    return {
      message: 'Terlalu banyak pesan terkirim. Silakan coba lagi dalam beberapa menit.',
      status: 'error',
      values,
    }
  }

  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) {
    return {
      errors: fieldErrors(parsed.error),
      message: 'Periksa kembali isian yang ditandai.',
      status: 'error',
      values,
    }
  }

  const payload = await getPayloadClient()
  try {
    await payload.create({
      collection: 'messages',
      data: { ...parsed.data, phone: parsed.data.phone || undefined, status: 'baru' },
    })
    return {
      message: 'Terima kasih, pesan Anda sudah terkirim. Kami akan membalas melalui email.',
      status: 'success',
    }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Gagal menyimpan pesan kontak' })
    return { message: 'Maaf, pesan gagal terkirim. Silakan coba lagi.', status: 'error', values }
  }
}
