import type { CollectionConfig, DateFieldValidation } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { publishedAtField, slugField } from '@/fields/common'
import { seoTab } from '@/fields/seo'
import { revalidateCollection } from '@/hooks/revalidate'

const validateExpiresAt: DateFieldValidation = (value, { siblingData }) => {
  const published = (siblingData as { publishedAt?: string } | undefined)?.publishedAt
  if (value && published && new Date(value) <= new Date(published)) {
    return 'Tanggal kedaluwarsa harus setelah tanggal terbit.'
  }
  return true
}

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  labels: { plural: 'Pengumuman', singular: 'Pengumuman' },
  admin: {
    defaultColumns: ['title', 'pinned', 'publishedAt', '_status'],
    group: 'Konten',
    useAsTitle: 'title',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: publishedOrStaff,
    update: isStaff,
  },
  defaultSort: '-publishedAt',
  hooks: revalidateCollection,
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Konten',
          fields: [
            { name: 'content', type: 'richText', label: 'Isi pengumuman', required: true },
            {
              name: 'attachments',
              type: 'upload',
              label: 'Lampiran',
              hasMany: true,
              relationTo: 'media',
              admin: { description: 'Berkas PDF atau gambar yang dapat diunduh pengunjung.' },
            },
          ],
        },
        seoTab(),
      ],
    },
    {
      name: 'pinned',
      type: 'checkbox',
      label: 'Sematkan di urutan teratas',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    publishedAtField(),
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Tanggal kedaluwarsa',
      index: true,
      validate: validateExpiresAt,
      admin: {
        date: { displayFormat: 'd MMM yyyy, HH:mm', pickerAppearance: 'dayAndTime' },
        description: 'Opsional. Setelah tanggal ini pengumuman tidak tampil di daftar.',
        position: 'sidebar',
      },
    },
    slugField(),
  ],
}
