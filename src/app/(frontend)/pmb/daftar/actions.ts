'use server'

import { headers } from 'next/headers'

import { createRegistration } from '@/collections/Registrations'
import { fieldErrors, type FormState, formValues, registrationSchema } from '@/lib/forms'
import { getPayloadClient } from '@/lib/queries'
import { clientIp, isRateLimited } from '@/lib/rate-limit'

const GENERIC_ERROR =
  'Maaf, terjadi kesalahan saat menyimpan pendaftaran. Silakan coba lagi beberapa saat lagi.'

export async function submitRegistration(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData)

  // Honeypot: bot mengisi field tersembunyi; tampilkan "sukses" palsu tanpa menyimpan.
  if (values.website) return { message: 'Terima kasih.', status: 'success' }

  if (isRateLimited(`pmb:${clientIp(await headers())}`, 5, 10 * 60 * 1000)) {
    return {
      message: 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.',
      status: 'error',
      values,
    }
  }

  const parsed = registrationSchema.safeParse(values)
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
    const pmb = await payload.findGlobal({ slug: 'pmb-info', depth: 0 })
    if (!pmb.isOpen) {
      return {
        message: pmb.closedMessage || 'Pendaftaran sedang ditutup.',
        status: 'error',
        values,
      }
    }

    const data = parsed.data
    const choices = [
      ...new Set([data.firstChoice, data.secondChoice].filter((id): id is number => Boolean(id))),
    ]
    const { totalDocs: validChoices } = await payload.count({
      collection: 'programs',
      where: { id: { in: choices } },
    })
    if (validChoices !== choices.length) {
      return {
        errors: {
          firstChoice: ['Program studi tidak ditemukan. Muat ulang halaman lalu pilih kembali.'],
        },
        status: 'error',
        values,
      }
    }

    const { totalDocs: duplicates } = await payload.count({
      collection: 'pmb-registrations',
      where: {
        and: [{ nik: { equals: data.nik } }, { academicYear: { equals: pmb.academicYear ?? '' } }],
      },
    })
    if (duplicates > 0) {
      return {
        errors: {
          nik: [
            'NIK ini sudah terdaftar pada PMB periode ini. Hubungi panitia bila ada perubahan data.',
          ],
        },
        status: 'error',
        values,
      }
    }

    const registration = await createRegistration(payload, {
      academicYear: pmb.academicYear,
      address: data.address,
      birthDate: new Date(`${data.birthDate}T00:00:00.000Z`).toISOString(),
      birthPlace: data.birthPlace,
      consent: true,
      email: data.email || undefined,
      firstChoice: data.firstChoice,
      fullName: data.fullName,
      gender: data.gender,
      graduationYear: data.graduationYear,
      nik: data.nik,
      phone: data.phone,
      schoolOrigin: data.schoolOrigin,
      secondChoice: data.secondChoice,
      status: 'baru',
      wave: pmb.wave,
    })

    return {
      message: pmb.successMessage || 'Pendaftaran awal Anda sudah kami terima.',
      registrationNumber: registration.registrationNumber ?? undefined,
      status: 'success',
    }
  } catch (error) {
    payload.logger.error({ err: error, msg: 'Gagal menyimpan pendaftaran PMB' })
    return { message: GENERIC_ERROR, status: 'error', values }
  }
}
