import type { CollectionConfig, Field } from 'payload'

import { anyone, isAdmin, isStaff } from '@/access'
import { slugField } from '@/fields/common'
import { seoTab } from '@/fields/seo'

const textList = (name: string, label: string, itemLabel: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { plural: itemLabel, singular: itemLabel },
  fields: [{ name: 'text', type: 'textarea', label: itemLabel, required: true }],
})

export const Programs: CollectionConfig = {
  slug: 'programs',
  labels: { plural: 'Program Studi', singular: 'Program Studi' },
  admin: {
    defaultColumns: ['name', 'code', 'degree', 'accreditation', 'order'],
    description: 'Profil program studi (PAI, PGMI, PIAUD, HKI), tampil di /program-studi/{slug}.',
    group: 'Akademik',
    useAsTitle: 'name',
  },
  access: {
    create: isStaff,
    delete: isAdmin,
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
          label: 'Nama program studi',
          required: true,
          admin: { width: '60%' },
        },
        {
          name: 'code',
          type: 'text',
          label: 'Singkatan',
          required: true,
          unique: true,
          admin: { description: 'Contoh: PAI', width: '40%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'degree',
          type: 'select',
          label: 'Jenjang',
          defaultValue: 'S1',
          options: [
            { label: 'Sarjana (S1)', value: 'S1' },
            { label: 'Magister (S2)', value: 'S2' },
          ],
          required: true,
          admin: { width: '33%' },
        },
        { name: 'department', type: 'text', label: 'Jurusan/Fakultas', admin: { width: '33%' } },
        {
          name: 'accreditation',
          type: 'text',
          label: 'Akreditasi',
          admin: { description: 'Contoh: Baik Sekali (BAN-PT, 2025)', width: '34%' },
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Ringkasan',
      maxLength: 280,
      admin: { description: 'Satu-dua kalimat untuk kartu program studi.' },
    },
    { name: 'coverImage', type: 'upload', label: 'Gambar sampul', relationTo: 'media' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profil',
          fields: [
            { name: 'description', type: 'richText', label: 'Deskripsi program studi' },
            { name: 'vision', type: 'textarea', label: 'Visi' },
            textList('missions', 'Misi', 'Misi'),
            textList('objectives', 'Tujuan', 'Tujuan'),
          ],
        },
        {
          label: 'Lulusan',
          fields: [
            {
              name: 'graduateProfiles',
              type: 'array',
              label: 'Profil lulusan',
              labels: { plural: 'Profil lulusan', singular: 'Profil lulusan' },
              fields: [
                { name: 'title', type: 'text', label: 'Profil', required: true },
                { name: 'description', type: 'textarea', label: 'Deskripsi' },
              ],
            },
            textList('careers', 'Prospek karier', 'Prospek karier'),
          ],
        },
        {
          label: 'Kurikulum',
          fields: [
            { name: 'curriculum', type: 'richText', label: 'Ringkasan kurikulum' },
            {
              name: 'curriculumFile',
              type: 'upload',
              label: 'Dokumen kurikulum (PDF)',
              relationTo: 'media',
              filterOptions: { mimeType: { equals: 'application/pdf' } },
            },
          ],
        },
        {
          label: 'Pengelola & Jurnal',
          fields: [
            {
              name: 'head',
              type: 'relationship',
              label: 'Ketua program studi',
              relationTo: 'staff',
            },
            { name: 'email', type: 'email', label: 'Email program studi' },
            {
              name: 'journalUrl',
              type: 'text',
              label: 'Tautan jurnal prodi (Rumah Jurnal/OJS)',
              admin: {
                description: 'Contoh: https://jurnal.staimorowali.ac.id/index.php/nama-jurnal',
              },
            },
          ],
        },
        seoTab(),
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Urutan tampil',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    slugField({ useAsSlug: 'code' }),
  ],
}
