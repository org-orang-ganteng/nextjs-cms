import type { CollectionConfig, Condition } from 'payload'

import { anyone, isStaff } from '@/access'
import { ACADEMIC_RANKS, STAFF_TYPES } from '@/lib/options'

const isLecturer: Condition = (_data, siblingData) => siblingData?.type === 'dosen'

export const Staff: CollectionConfig = {
  slug: 'staff',
  labels: { plural: 'Dosen & Staf', singular: 'Dosen/Staf' },
  admin: {
    defaultColumns: ['name', 'type', 'position', 'program', 'active'],
    description: 'Direktori tenaga pendidik (dosen) dan tenaga kependidikan.',
    enableRichTextLink: false,
    group: 'Akademik',
    listSearchableFields: ['name', 'nidn', 'position', 'expertise'],
    useAsTitle: 'name',
  },
  access: {
    create: isStaff,
    delete: isStaff,
    read: anyone,
    update: isStaff,
  },
  defaultSort: 'order',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nama lengkap & gelar',
          required: true,
          admin: { width: '60%' },
        },
        {
          name: 'type',
          type: 'select',
          label: 'Kategori',
          defaultValue: 'dosen',
          index: true,
          options: STAFF_TYPES,
          required: true,
          admin: { width: '40%' },
        },
      ],
    },
    { name: 'photo', type: 'upload', label: 'Foto', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        {
          name: 'position',
          type: 'text',
          label: 'Jabatan',
          admin: { description: 'Contoh: Ketua Program Studi PAI', width: '50%' },
        },
        {
          name: 'program',
          type: 'relationship',
          label: 'Program studi (homebase)',
          relationTo: 'programs',
          admin: { condition: isLecturer, width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'nidn',
          type: 'text',
          label: 'NIDN/NIDK',
          admin: { condition: isLecturer, width: '50%' },
        },
        {
          name: 'academicRank',
          type: 'select',
          label: 'Jabatan fungsional',
          options: ACADEMIC_RANKS,
          admin: { condition: isLecturer, width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'expertise', type: 'text', label: 'Bidang keahlian', admin: { width: '50%' } },
        { name: 'education', type: 'text', label: 'Pendidikan terakhir', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email (tampil publik)',
          admin: { width: '34%' },
        },
        {
          name: 'sintaUrl',
          type: 'text',
          label: 'Profil SINTA',
          admin: { condition: isLecturer, width: '33%' },
        },
        {
          name: 'scholarUrl',
          type: 'text',
          label: 'Profil Google Scholar',
          admin: { condition: isLecturer, width: '33%' },
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Tampilkan di website',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Urutan tampil',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
