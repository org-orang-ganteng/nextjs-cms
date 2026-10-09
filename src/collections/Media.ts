import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { plural: 'Media', singular: 'Media' },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    description: 'Gambar dan dokumen PDF yang dipakai di seluruh website.',
    group: 'Konten',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: anyone,
    update: isStaff,
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
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 768, height: 512 },
      { name: 'hero', width: 1920 },
    ],
  },
}
