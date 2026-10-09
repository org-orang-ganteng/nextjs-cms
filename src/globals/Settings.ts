import type { GlobalConfig, TextFieldSingleValidation } from 'payload'

import { anyone, isAdmin } from '@/access'
import { linkFields } from '@/fields/link'
import { DEFAULT_JOURNAL_URL, SITE_FULL_NAME, SITE_NAME } from '@/lib/site'
import { SOCIAL_PLATFORMS } from '@/lib/options'

const validateMapEmbed: TextFieldSingleValidation = (value) => {
  if (!value) return true
  return value.startsWith('https://www.google.com/maps/embed')
    ? true
    : 'Gunakan URL dari Google Maps > Bagikan > Sematkan peta (diawali https://www.google.com/maps/embed).'
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Pengaturan Situs',
  admin: {
    description: 'Identitas kampus, kontak resmi, media sosial, dan tautan Rumah Jurnal.',
    group: 'Pengaturan',
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identitas',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'siteName',
                  type: 'text',
                  label: 'Nama singkat',
                  defaultValue: SITE_NAME,
                  required: true,
                },
                {
                  name: 'fullName',
                  type: 'text',
                  label: 'Nama lengkap institusi',
                  defaultValue: SITE_FULL_NAME,
                },
              ],
            },
            { name: 'tagline', type: 'text', label: 'Tagline' },
            {
              name: 'logo',
              type: 'upload',
              label: 'Logo',
              relationTo: 'media',
              admin: {
                description:
                  'Disarankan PNG/SVG persegi beresolusi tinggi. Kosongkan untuk memakai logo bawaan.',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Deskripsi situs (SEO)',
              maxLength: 160,
              admin: { description: 'Deskripsi bawaan untuk mesin pencari, maks. 160 karakter.' },
            },
          ],
        },
        {
          label: 'Kontak & Lokasi',
          fields: [
            { name: 'address', type: 'textarea', label: 'Alamat' },
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', label: 'Telepon' },
                {
                  name: 'whatsapp',
                  type: 'text',
                  label: 'WhatsApp',
                  admin: { description: 'Format internasional tanpa +, contoh: 6281234567890' },
                },
                { name: 'email', type: 'email', label: 'Email' },
              ],
            },
            {
              name: 'officeHours',
              type: 'text',
              label: 'Jam layanan',
              admin: { description: 'Contoh: Senin–Jumat, 08.00–16.00 WITA' },
            },
            {
              name: 'mapEmbedUrl',
              type: 'text',
              label: 'URL sematan Google Maps',
              validate: validateMapEmbed,
              admin: {
                description:
                  'Google Maps > Bagikan > Sematkan peta, salin nilai src dari kode iframe.',
              },
            },
            { name: 'mapUrl', type: 'text', label: 'Tautan Google Maps (petunjuk arah)' },
          ],
        },
        {
          label: 'Media Sosial',
          fields: [
            {
              name: 'socials',
              type: 'array',
              label: 'Akun media sosial',
              labels: { plural: 'Akun', singular: 'Akun' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      label: 'Platform',
                      options: SOCIAL_PLATFORMS,
                      required: true,
                    },
                    { name: 'url', type: 'text', label: 'URL profil', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Rumah Jurnal',
          fields: [
            {
              name: 'journalUrl',
              type: 'text',
              label: 'URL Rumah Jurnal (OJS)',
              defaultValue: DEFAULT_JOURNAL_URL,
              required: true,
            },
            {
              name: 'journalDescription',
              type: 'textarea',
              label: 'Deskripsi singkat Rumah Jurnal',
            },
          ],
        },
      ],
    },
  ],
}

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Menu Navigasi',
  admin: {
    description: 'Menu utama di bagian atas website. Setiap menu dapat memiliki submenu.',
    group: 'Pengaturan',
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Menu',
      labels: { plural: 'Menu', singular: 'Menu' },
      maxRows: 10,
      fields: [
        ...linkFields(),
        {
          name: 'children',
          type: 'array',
          label: 'Submenu',
          labels: { plural: 'Submenu', singular: 'Submenu' },
          fields: linkFields(),
        },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Tombol aksi (kanan atas)',
      fields: linkFields({ required: false }),
    },
  ],
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    description: 'Bagian bawah website: deskripsi singkat dan kolom tautan.',
    group: 'Pengaturan',
  },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    { name: 'about', type: 'textarea', label: 'Deskripsi singkat' },
    {
      name: 'columns',
      type: 'array',
      label: 'Kolom tautan',
      labels: { plural: 'Kolom', singular: 'Kolom' },
      maxRows: 3,
      fields: [
        { name: 'title', type: 'text', label: 'Judul kolom', required: true },
        {
          name: 'links',
          type: 'array',
          label: 'Tautan',
          labels: { plural: 'Tautan', singular: 'Tautan' },
          fields: linkFields(),
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Teks hak cipta',
      defaultValue: '© {tahun} STAI Morowali. Seluruh hak cipta dilindungi.',
      admin: { description: '{tahun} otomatis diganti tahun berjalan.' },
    },
  ],
}
