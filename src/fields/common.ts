import { type Field, slugField as payloadSlugField, type TextFieldSingleValidation } from 'payload'

import { RESERVED_PAGE_SLUGS } from '@/lib/site'
import { toSlug } from '@/lib/slug'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const validateSlug =
  (reserved?: Set<string>): TextFieldSingleValidation =>
  (value) => {
    if (!value) return 'Slug wajib diisi.'
    if (!SLUG_PATTERN.test(value)) {
      return 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (contoh: wisuda-2026).'
    }
    if (reserved?.has(value)) {
      return `Slug "${value}" sudah dipakai halaman bawaan situs. Gunakan slug lain.`
    }
    return true
  }

/**
 * Slug URL yang dibuat otomatis dari judul (bisa diubah manual).
 * `reserved` menolak slug yang bentrok dengan rute bawaan (khusus koleksi Halaman).
 */
export function slugField({
  reserved,
  useAsSlug = 'title',
}: { reserved?: boolean; useAsSlug?: string } = {}): Field {
  return payloadSlugField({
    slugify: ({ valueToSlugify }) => toSlug(valueToSlugify),
    useAsSlug,
    overrides: (row) => {
      for (const field of row.fields) {
        if (field.type === 'text' && field.name === 'slug' && !field.hasMany) {
          field.label = 'Slug URL'
          field.validate = validateSlug(reserved ? RESERVED_PAGE_SLUGS : undefined)
          // Hook bawaan mengisi slug pada tahap beforeChange secara paralel dengan validasi,
          // sehingga pembuatan via Local API/seed tanpa slug gagal. Isi lebih awal di sini.
          field.hooks = {
            ...field.hooks,
            beforeValidate: [
              ...(field.hooks?.beforeValidate ?? []),
              ({ data, value }) => value || toSlug(data?.[useAsSlug]) || value,
            ],
          }
        }
      }
      return row
    },
  })
}

/** Tanggal terbit; terisi otomatis saat dokumen pertama kali diterbitkan. */
export function publishedAtField(): Field {
  return {
    name: 'publishedAt',
    type: 'date',
    label: 'Tanggal terbit',
    index: true,
    admin: {
      date: { displayFormat: 'd MMM yyyy, HH:mm', pickerAppearance: 'dayAndTime' },
      position: 'sidebar',
    },
    hooks: {
      beforeChange: [
        ({ siblingData, value }) => {
          if (!value && siblingData?._status === 'published') return new Date().toISOString()
          return value
        },
      ],
    },
  }
}
