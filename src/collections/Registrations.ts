import type {
  CollectionBeforeValidateHook,
  CollectionConfig,
  TextFieldSingleValidation,
} from 'payload'

import { isAdmin, isStaff } from '@/access'
import { relationName, toDate, toWitaDateTime, xlsxExportEndpoint } from '@/endpoints/exportXlsx'
import { GENDERS, labelFor, REGISTRATION_STATUSES } from '@/lib/options'

const SLUG = 'pmb-registrations'

/** Nomor pendaftaran berurutan per tahun, contoh: PMB-2026-0001. */
const assignRegistrationNumber: CollectionBeforeValidateHook = async ({ data, operation, req }) => {
  if (operation !== 'create' || !data || data.registrationNumber) return data
  const prefix = `PMB-${new Date().getFullYear()}-`
  const { docs } = await req.payload.find({
    collection: SLUG,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    select: { registrationNumber: true },
    sort: '-registrationNumber',
    where: { registrationNumber: { like: prefix } },
  })
  const last = Number.parseInt(docs[0]?.registrationNumber?.slice(prefix.length) ?? '0', 10)
  return { ...data, registrationNumber: `${prefix}${String((last || 0) + 1).padStart(4, '0')}` }
}

const validateNik: TextFieldSingleValidation = (value) =>
  !value || /^\d{16}$/.test(value) ? true : 'NIK harus 16 digit angka.'

export const Registrations: CollectionConfig = {
  slug: SLUG,
  labels: { plural: 'Pendaftar PMB', singular: 'Pendaftar PMB' },
  admin: {
    components: {
      beforeListTable: [
        {
          clientProps: { collectionSlug: SLUG },
          path: '/components/admin/ExportExcelButton#ExportExcelButton',
        },
      ],
    },
    defaultColumns: [
      'registrationNumber',
      'fullName',
      'firstChoice',
      'phone',
      'status',
      'createdAt',
    ],
    description:
      'Data calon mahasiswa dari formulir pendaftaran awal di website. Gunakan tombol ekspor untuk mengunduh Excel.',
    enableRichTextLink: false,
    enableRichTextRelationship: false,
    group: 'PMB & Pesan',
    listSearchableFields: ['fullName', 'registrationNumber', 'nik', 'phone', 'email'],
    useAsTitle: 'fullName',
  },
  access: {
    // Pendaftaran publik masuk lewat server action (validasi + anti-spam), bukan REST API.
    create: isStaff,
    delete: isAdmin,
    read: isStaff,
    update: isStaff,
  },
  defaultSort: '-createdAt',
  endpoints: [
    xlsxExportEndpoint({
      collection: SLUG,
      fileName: 'pendaftar-pmb',
      sheet: 'Pendaftar PMB',
      columns: [
        { header: 'No. Pendaftaran', value: (doc) => doc.registrationNumber, width: 18 },
        { header: 'Tanggal Daftar', value: (doc) => toWitaDateTime(doc.createdAt), width: 18 },
        { header: 'Tahun Akademik', value: (doc) => doc.academicYear, width: 14 },
        { header: 'Gelombang', value: (doc) => doc.wave, width: 14 },
        {
          header: 'Status',
          value: (doc) => labelFor(REGISTRATION_STATUSES, doc.status),
          width: 18,
        },
        { header: 'Nama Lengkap', value: (doc) => doc.fullName, width: 28 },
        { header: 'NIK', value: (doc) => doc.nik, width: 20 },
        { header: 'Jenis Kelamin', value: (doc) => labelFor(GENDERS, doc.gender), width: 14 },
        { header: 'Tempat Lahir', value: (doc) => doc.birthPlace, width: 16 },
        {
          dateFormat: 'dd/mm/yyyy',
          header: 'Tanggal Lahir',
          value: (doc) => toDate(doc.birthDate),
          width: 14,
        },
        { header: 'No. WhatsApp', value: (doc) => doc.phone, width: 16 },
        { header: 'Email', value: (doc) => doc.email, width: 26 },
        { header: 'Alamat', value: (doc) => doc.address, width: 40 },
        { header: 'Asal Sekolah', value: (doc) => doc.schoolOrigin, width: 28 },
        { header: 'Tahun Lulus', value: (doc) => doc.graduationYear, width: 12 },
        { header: 'Pilihan 1', value: (doc) => relationName(doc.firstChoice), width: 32 },
        { header: 'Pilihan 2', value: (doc) => relationName(doc.secondChoice), width: 32 },
        { header: 'Catatan Panitia', value: (doc) => doc.notes, width: 40 },
      ],
    }),
  ],
  hooks: {
    beforeValidate: [assignRegistrationNumber],
  },
  fields: [
    {
      name: 'registrationNumber',
      type: 'text',
      label: 'No. pendaftaran',
      index: true,
      unique: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'baru',
      index: true,
      options: REGISTRATION_STATUSES,
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'academicYear',
      type: 'text',
      label: 'Tahun akademik',
      admin: { position: 'sidebar' },
    },
    {
      name: 'wave',
      type: 'text',
      label: 'Gelombang',
      admin: { position: 'sidebar' },
    },
    {
      type: 'collapsible',
      label: 'Data diri',
      fields: [
        { name: 'fullName', type: 'text', label: 'Nama lengkap', required: true },
        {
          type: 'row',
          fields: [
            {
              name: 'nik',
              type: 'text',
              label: 'NIK',
              required: true,
              validate: validateNik,
              admin: { width: '50%' },
            },
            {
              name: 'gender',
              type: 'select',
              label: 'Jenis kelamin',
              options: GENDERS,
              required: true,
              admin: { width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'birthPlace',
              type: 'text',
              label: 'Tempat lahir',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'birthDate',
              type: 'date',
              label: 'Tanggal lahir',
              required: true,
              admin: {
                date: { displayFormat: 'd MMMM yyyy', pickerAppearance: 'dayOnly' },
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'phone',
              type: 'text',
              label: 'No. WhatsApp',
              required: true,
              admin: { width: '50%' },
            },
            { name: 'email', type: 'email', label: 'Email', admin: { width: '50%' } },
          ],
        },
        { name: 'address', type: 'textarea', label: 'Alamat lengkap', required: true },
      ],
    },
    {
      type: 'collapsible',
      label: 'Pendidikan & pilihan program studi',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'schoolOrigin',
              type: 'text',
              label: 'Asal sekolah',
              required: true,
              admin: { width: '60%' },
            },
            {
              name: 'graduationYear',
              type: 'number',
              label: 'Tahun lulus',
              required: true,
              admin: { width: '40%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'firstChoice',
              type: 'relationship',
              label: 'Pilihan program studi 1',
              relationTo: 'programs',
              required: true,
              admin: { width: '50%' },
            },
            {
              name: 'secondChoice',
              type: 'relationship',
              label: 'Pilihan program studi 2',
              relationTo: 'programs',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'consent',
      type: 'checkbox',
      label: 'Menyetujui penggunaan data untuk keperluan PMB',
      defaultValue: false,
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Catatan internal panitia',
      admin: { description: 'Tidak terlihat oleh pendaftar.' },
    },
  ],
}
