import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { publishedAtField, slugField } from '@/fields/common'
import { seoTab } from '@/fields/seo'
import { revalidateCollection } from '@/hooks/revalidate'
import { POST_CATEGORIES } from '@/lib/options'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { plural: 'Berita', singular: 'Berita' },
  admin: {
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
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
            { name: 'coverImage', type: 'upload', label: 'Gambar sampul', relationTo: 'media' },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Ringkasan',
              maxLength: 300,
              admin: { description: 'Ditampilkan di daftar berita (maks. 300 karakter).' },
            },
            { name: 'content', type: 'richText', label: 'Isi berita', required: true },
          ],
        },
        seoTab(),
      ],
    },
    {
      name: 'category',
      type: 'select',
      label: 'Kategori',
      defaultValue: 'umum',
      index: true,
      options: POST_CATEGORIES,
      required: true,
      admin: { position: 'sidebar' },
    },
    publishedAtField(),
    slugField(),
  ],
}
