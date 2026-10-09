import type { CollectionConfig, DateFieldValidation } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { slugField } from '@/fields/common'
import { seoTab } from '@/fields/seo'

const validateEndDate: DateFieldValidation = (value, { siblingData }) => {
  const start = (siblingData as { startDate?: string } | undefined)?.startDate
  if (value && start && new Date(value) < new Date(start)) {
    return 'Waktu selesai tidak boleh sebelum waktu mulai.'
  }
  return true
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { plural: 'Agenda', singular: 'Agenda' },
  admin: {
    defaultColumns: ['title', 'startDate', 'location', '_status'],
    group: 'Informasi',
    useAsTitle: 'title',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: publishedOrStaff,
    update: isStaff,
  },
  defaultSort: '-startDate',
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Nama kegiatan', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          label: 'Mulai',
          index: true,
          required: true,
          admin: {
            date: { displayFormat: 'd MMM yyyy, HH:mm', pickerAppearance: 'dayAndTime' },
            width: '50%',
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Selesai (opsional)',
          admin: {
            date: { displayFormat: 'd MMM yyyy, HH:mm', pickerAppearance: 'dayAndTime' },
            width: '50%',
          },
          validate: validateEndDate,
        },
      ],
    },
    { name: 'location', type: 'text', label: 'Lokasi' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Konten',
          fields: [
            { name: 'coverImage', type: 'upload', label: 'Gambar', relationTo: 'media' },
            { name: 'summary', type: 'textarea', label: 'Ringkasan', maxLength: 300 },
            { name: 'content', type: 'richText', label: 'Deskripsi kegiatan' },
          ],
        },
        seoTab(),
      ],
    },
    slugField(),
  ],
}
