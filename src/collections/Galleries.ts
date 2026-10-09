import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { slugField } from '@/fields/common'
import { revalidateCollection } from '@/hooks/revalidate'
import { validateYouTubeUrl } from '@/lib/youtube'

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  labels: { plural: 'Galeri', singular: 'Album Galeri' },
  admin: {
    defaultColumns: ['title', 'date', '_status', 'updatedAt'],
    description: 'Album dokumentasi foto & video kegiatan akademik dan kemahasiswaan.',
    group: 'Konten',
    useAsTitle: 'title',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: publishedOrStaff,
    update: isStaff,
  },
  defaultSort: '-date',
  hooks: revalidateCollection,
  versions: {
    drafts: true,
    maxPerDoc: 10,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Judul album', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Tanggal kegiatan',
          index: true,
          admin: {
            date: { displayFormat: 'd MMM yyyy', pickerAppearance: 'dayOnly' },
            width: '50%',
          },
        },
        {
          name: 'coverImage',
          type: 'upload',
          label: 'Sampul album',
          relationTo: 'media',
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'description', type: 'textarea', label: 'Deskripsi' },
    {
      name: 'photos',
      type: 'upload',
      label: 'Foto',
      hasMany: true,
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
    },
    {
      name: 'videos',
      type: 'array',
      label: 'Video YouTube',
      labels: { plural: 'Video', singular: 'Video' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', label: 'Judul', admin: { width: '40%' } },
            {
              name: 'url',
              type: 'text',
              label: 'URL YouTube',
              required: true,
              validate: validateYouTubeUrl,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
    slugField(),
  ],
}
