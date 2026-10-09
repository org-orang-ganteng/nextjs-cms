import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { slugField } from '@/fields/common'
import { seoTab } from '@/fields/seo'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { plural: 'Halaman', singular: 'Halaman' },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Halaman bebas yang disusun dari blok (page builder), tampil di /{slug}.',
    group: 'Konten',
    useAsTitle: 'title',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: publishedOrStaff,
    update: isStaff,
  },
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
            {
              name: 'layout',
              type: 'blocks',
              label: 'Susunan blok',
              labels: { plural: 'Blok', singular: 'Blok' },
              blocks: pageBlocks,
              minRows: 1,
              required: true,
            },
          ],
        },
        seoTab(),
      ],
    },
    slugField({ reserved: true }),
  ],
}
