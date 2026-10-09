import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '@/access'
import { toWitaDateTime, xlsxExportEndpoint } from '@/endpoints/exportXlsx'
import { labelFor, MESSAGE_STATUSES } from '@/lib/options'

const SLUG = 'messages'

export const Messages: CollectionConfig = {
  slug: SLUG,
  labels: { plural: 'Pesan Masuk', singular: 'Pesan' },
  admin: {
    components: {
      beforeListTable: [
        {
          clientProps: { collectionSlug: SLUG },
          path: '/components/admin/ExportExcelButton#ExportExcelButton',
        },
      ],
    },
    defaultColumns: ['subject', 'name', 'email', 'status', 'createdAt'],
    description: 'Pesan dari formulir kontak website.',
    enableRichTextLink: false,
    enableRichTextRelationship: false,
    group: 'PMB & Pesan',
    listSearchableFields: ['name', 'email', 'subject', 'message'],
    useAsTitle: 'subject',
  },
  access: {
    // Pesan publik masuk lewat server action (validasi + anti-spam), bukan REST API.
    create: isStaff,
    delete: isAdmin,
    read: isStaff,
    update: isStaff,
  },
  defaultSort: '-createdAt',
  endpoints: [
    xlsxExportEndpoint({
      collection: SLUG,
      fileName: 'pesan-masuk',
      sheet: 'Pesan Masuk',
      columns: [
        { header: 'Tanggal', value: (doc) => toWitaDateTime(doc.createdAt), width: 18 },
        { header: 'Status', value: (doc) => labelFor(MESSAGE_STATUSES, doc.status), width: 16 },
        { header: 'Nama', value: (doc) => doc.name, width: 26 },
        { header: 'Email', value: (doc) => doc.email, width: 28 },
        { header: 'Telepon', value: (doc) => doc.phone, width: 16 },
        { header: 'Subjek', value: (doc) => doc.subject, width: 32 },
        { header: 'Pesan', value: (doc) => doc.message, width: 60 },
      ],
    }),
  ],
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'baru',
      index: true,
      options: MESSAGE_STATUSES,
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Nama', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', label: 'Email', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'phone', type: 'text', label: 'Telepon/WhatsApp' },
    { name: 'subject', type: 'text', label: 'Subjek', required: true },
    { name: 'message', type: 'textarea', label: 'Pesan', required: true },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Catatan internal',
      admin: { description: 'Tidak terlihat oleh pengirim.' },
    },
  ],
}
