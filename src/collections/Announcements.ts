import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { publishedAtField, slugField } from '@/fields/common'
import { seoTab } from '@/fields/seo'

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  labels: { plural: 'Pengumuman', singular: 'Pengumuman' },
  admin: {
    defaultColumns: ['title', 'pinned', 'publishedAt', '_status'],
    group: 'Informasi',
    useAsTitle: 'title',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: publishedOrStaff,
    update: isStaff,
  },
  defaultSort: '-publishedAt',
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
    slugField(),
  ],
}
