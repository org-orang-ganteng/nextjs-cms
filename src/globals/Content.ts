import type { Field, GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { linkFields } from '@/fields/link'
import { seoTab } from '@/fields/seo'

const textList = (name: string, label: string, itemLabel: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { plural: itemLabel, singular: itemLabel },
  fields: [{ name: 'text', type: 'textarea', label: itemLabel, required: true }],
})

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Beranda',
  admin: {
    description: 'Isi halaman beranda: banner, sorotan, statistik, dan bagian informasi.',
    group: 'Konten',
  },
  access: {
    read: anyone,
    update: isStaff,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Banner',
          fields: [
            {
              name: 'slides',
              type: 'array',
              label: 'Slide banner',
              labels: { plural: 'Slide', singular: 'Slide' },
              maxRows: 5,
              fields: [
                { name: 'title', type: 'text', label: 'Judul', required: true },
                { name: 'subtitle', type: 'textarea', label: 'Subjudul' },
                { name: 'image', type: 'upload', label: 'Gambar latar', relationTo: 'media' },
                {
                  name: 'primaryButton',
                  type: 'group',
                  label: 'Tombol utama',
                  fields: linkFields({ required: false }),
                },
                {
                  name: 'secondaryButton',
                  type: 'group',
                  label: 'Tombol kedua',
                  fields: linkFields({ required: false }),
                },
              ],
            },
          ],
        },
        {
          label: 'Sorotan & Statistik',
          fields: [
            {
              name: 'highlights',
              type: 'array',
              label: 'Sorotan utama',
              labels: { plural: 'Sorotan', singular: 'Sorotan' },
              maxRows: 6,
              fields: [
                { name: 'title', type: 'text', label: 'Judul', required: true },
                { name: 'description', type: 'textarea', label: 'Deskripsi' },
                { name: 'url', type: 'text', label: 'Tautan' },
              ],
            },
            {
              name: 'stats',
              type: 'array',
              label: 'Statistik kampus',
              labels: { plural: 'Statistik', singular: 'Statistik' },
              maxRows: 6,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'value',
                      type: 'text',
                      label: 'Nilai',
                      required: true,
                      admin: { description: 'Contoh: 4 atau 1.200+' },
                    },
                    { name: 'label', type: 'text', label: 'Keterangan', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Bagian Informasi',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'newsLimit',
                  type: 'number',
                  label: 'Jumlah berita',
                  defaultValue: 3,
                  min: 0,
                  max: 9,
                },
                {
                  name: 'announcementLimit',
                  type: 'number',
                  label: 'Jumlah pengumuman',
                  defaultValue: 5,
                  min: 0,
                  max: 10,
                },
                {
                  name: 'eventLimit',
                  type: 'number',
                  label: 'Jumlah agenda',
                  defaultValue: 3,
                  min: 0,
                  max: 6,
                },
              ],
            },
            {
              name: 'journalCta',
              type: 'group',
              label: 'Ajakan Rumah Jurnal',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Judul',
                  defaultValue: 'Rumah Jurnal STAI Morowali',
                },
                {
                  name: 'text',
                  type: 'textarea',
                  label: 'Teks',
                  defaultValue:
                    'Publikasi ilmiah dosen dan mahasiswa dalam jurnal program studi berbasis Open Journal Systems.',
                },
                {
                  name: 'buttonLabel',
                  type: 'text',
                  label: 'Teks tombol',
                  defaultValue: 'Kunjungi Rumah Jurnal',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const CampusProfile: GlobalConfig = {
  slug: 'campus-profile',
  label: 'Profil Kampus',
  admin: {
    description:
      'Isi halaman /profil: sejarah, visi & misi, sambutan ketua, dan struktur organisasi.',
    group: 'Konten',
  },
  access: {
    read: anyone,
    update: isStaff,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sejarah',
          fields: [{ name: 'history', type: 'richText', label: 'Sejarah' }],
        },
        {
          label: 'Visi & Misi',
          fields: [
            { name: 'vision', type: 'textarea', label: 'Visi' },
            textList('missions', 'Misi', 'Misi'),
            textList('goals', 'Tujuan', 'Tujuan'),
          ],
        },
        {
          label: 'Sambutan Ketua',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'leaderName', type: 'text', label: 'Nama ketua (dengan gelar)' },
                {
                  name: 'leaderTitle',
                  type: 'text',
                  label: 'Jabatan',
                  defaultValue: 'Ketua STAI Morowali',
                },
              ],
            },
            { name: 'leaderPhoto', type: 'upload', label: 'Foto', relationTo: 'media' },
            { name: 'greeting', type: 'richText', label: 'Isi sambutan' },
          ],
        },
        {
          label: 'Struktur Organisasi',
          fields: [
            {
              name: 'structureImage',
              type: 'upload',
              label: 'Bagan struktur organisasi',
              relationTo: 'media',
            },
            {
              name: 'officials',
              type: 'array',
              label: 'Daftar pejabat',
              labels: { plural: 'Pejabat', singular: 'Pejabat' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'position', type: 'text', label: 'Jabatan', required: true },
                    { name: 'name', type: 'text', label: 'Nama', required: true },
                  ],
                },
              ],
            },
          ],
        },
        seoTab(),
      ],
    },
  ],
}

export const PmbInfo: GlobalConfig = {
  slug: 'pmb-info',
  label: 'Informasi PMB',
  admin: {
    description: 'Isi halaman /pmb dan pengaturan formulir pendaftaran awal.',
    group: 'PMB & Pesan',
  },
  access: {
    read: anyone,
    update: isStaff,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'isOpen',
          type: 'checkbox',
          label: 'Formulir pendaftaran dibuka',
          defaultValue: false,
        },
        {
          name: 'academicYear',
          type: 'text',
          label: 'Tahun akademik',
          admin: { description: 'Contoh: 2027/2028' },
        },
        {
          name: 'wave',
          type: 'text',
          label: 'Gelombang aktif',
          admin: { description: 'Contoh: Gelombang I' },
        },
      ],
    },
    {
      name: 'closedMessage',
      type: 'textarea',
      label: 'Pesan saat pendaftaran ditutup',
      defaultValue:
        'Pendaftaran mahasiswa baru belum dibuka. Pantau pengumuman resmi di website ini.',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informasi',
          fields: [
            { name: 'intro', type: 'richText', label: 'Informasi umum' },
            textList('requirements', 'Persyaratan', 'Persyaratan'),
            {
              name: 'schedule',
              type: 'array',
              label: 'Jadwal',
              labels: { plural: 'Tahapan', singular: 'Tahapan' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'stage', type: 'text', label: 'Tahapan', required: true },
                    {
                      name: 'date',
                      type: 'text',
                      label: 'Waktu',
                      required: true,
                      admin: { description: 'Contoh: 1–31 Maret 2027' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'fees',
              type: 'array',
              label: 'Rincian biaya',
              labels: { plural: 'Biaya', singular: 'Biaya' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'item', type: 'text', label: 'Komponen', required: true },
                    {
                      name: 'amount',
                      type: 'text',
                      label: 'Nominal',
                      required: true,
                      admin: { description: 'Contoh: Rp250.000' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Petunjuk Teknis',
          fields: [
            { name: 'guide', type: 'richText', label: 'Petunjuk teknis pendaftaran' },
            {
              name: 'downloads',
              type: 'upload',
              label: 'Berkas unduhan (juknis, brosur)',
              hasMany: true,
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Narahubung & Formulir',
          fields: [
            {
              name: 'contacts',
              type: 'array',
              label: 'Narahubung panitia',
              labels: { plural: 'Narahubung', singular: 'Narahubung' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', label: 'Nama', required: true },
                    {
                      name: 'whatsapp',
                      type: 'text',
                      label: 'WhatsApp',
                      required: true,
                      admin: { description: 'Contoh: 6281234567890' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'successMessage',
              type: 'textarea',
              label: 'Pesan setelah formulir terkirim',
              defaultValue:
                'Terima kasih, pendaftaran awal Anda sudah kami terima. Panitia PMB akan menghubungi Anda melalui WhatsApp untuk tahap berikutnya.',
            },
          ],
        },
        seoTab(),
      ],
    },
  ],
}
