import { APIError, type CollectionBeforeOperationHook, type CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const limitFileSize: CollectionBeforeOperationHook = ({ args, req }) => {
  if (req.file && req.file.size > MAX_FILE_SIZE) {
    throw new APIError('Ukuran berkas maksimal 5 MB.', 400, undefined, true)
  }
  return args
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { plural: 'Media', singular: 'Media' },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    description:
      'Gambar (JPG, PNG, WebP) dan dokumen PDF yang dipakai di seluruh website, maks. 5 MB per berkas.',
    group: 'Konten',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: anyone,
    update: isStaff,
  },
  hooks: {
    ...revalidateCollection,
    beforeOperation: [limitFileSize],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Teks alternatif',
      required: true,
      admin: {
        description:
          'Gambarkan isi gambar secara singkat (untuk aksesibilitas & SEO). Untuk PDF, isi judul dokumen.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Keterangan',
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 768, height: 512 },
      { name: 'hero', width: 1920 },
    ],
  },
}
