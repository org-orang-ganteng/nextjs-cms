import { z } from 'zod'

/** Hasil server action formulir publik. */
export type FormState = {
  errors?: Partial<Record<string, string[]>>
  message?: string
  registrationNumber?: string
  status: 'error' | 'idle' | 'success'
  values?: Record<string, string>
}

export const initialFormState: FormState = { status: 'idle' }

const trimmed = (value: unknown) => (typeof value === 'string' ? value.trim() : value)

const requiredText = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} wajib diisi.` })
    .trim()
    .min(1, `${label} wajib diisi.`)
    .min(min, `${label} minimal ${min} karakter.`)
    .max(max, `${label} maksimal ${max} karakter.`)

const phone = z
  .string({ error: 'Nomor WhatsApp wajib diisi.' })
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .pipe(
    z.string().regex(/^(\+62|62|0)8\d{7,12}$/, 'Nomor WhatsApp tidak valid, contoh: 081234567890.'),
  )

const optionalEmail = z.preprocess(
  trimmed,
  z.union([z.literal(''), z.email('Alamat email tidak valid.')]).optional(),
)

const currentYear = new Date().getFullYear()

export const registrationSchema = z
  .object({
    address: requiredText('Alamat', 10, 500),
    birthDate: z.iso.date({ error: 'Tanggal lahir wajib diisi.' }),
    birthPlace: requiredText('Tempat lahir', 2, 80),
    consent: z.literal('on', { error: 'Centang pernyataan persetujuan untuk melanjutkan.' }),
    email: optionalEmail,
    firstChoice: z.coerce
      .number({ error: 'Pilih program studi.' })
      .int()
      .positive('Pilih program studi.'),
    fullName: requiredText('Nama lengkap', 3, 120),
    gender: z.enum(['L', 'P'], { error: 'Pilih jenis kelamin.' }),
    graduationYear: z.coerce
      .number({ error: 'Tahun lulus wajib diisi.' })
      .int('Tahun lulus tidak valid.')
      .min(1980, 'Tahun lulus tidak valid.')
      .max(currentYear + 1, 'Tahun lulus tidak valid.'),
    nik: z
      .string({ error: 'NIK wajib diisi.' })
      .trim()
      .regex(/^\d{16}$/, 'NIK harus 16 digit angka.'),
    phone,
    schoolOrigin: requiredText('Asal sekolah', 3, 120),
    secondChoice: z
      .union([z.literal(''), z.coerce.number().int().positive()])
      .optional()
      .transform((value) => (typeof value === 'number' ? value : undefined)),
  })
  .refine((data) => !data.secondChoice || data.secondChoice !== data.firstChoice, {
    error: 'Pilihan 2 harus berbeda dari pilihan 1.',
    path: ['secondChoice'],
  })

export const contactSchema = z.object({
  email: z.preprocess(trimmed, z.email('Alamat email tidak valid.')),
  message: requiredText('Pesan', 10, 3000),
  name: requiredText('Nama', 2, 100),
  phone: z.union([z.literal(''), phone]).optional(),
  subject: requiredText('Subjek', 3, 150),
})

/** Mengambil nilai teks dari FormData (tanpa field internal React `$ACTION_*`). */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('$')) values[key] = value
  }
  return values
}

export function fieldErrors(error: z.ZodError): FormState['errors'] {
  return z.flattenError(error).fieldErrors as FormState['errors']
}
