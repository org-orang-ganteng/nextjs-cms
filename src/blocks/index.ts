import type { Block } from 'payload'

import { linkFields } from '@/fields/link'
import { validateYouTubeUrl } from '@/lib/youtube'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { plural: 'Banner', singular: 'Banner' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    { name: 'subtitle', type: 'textarea', label: 'Subjudul' },
    { name: 'image', type: 'upload', label: 'Gambar latar', relationTo: 'media' },
    {
      name: 'buttons',
      type: 'array',
      label: 'Tombol',
      maxRows: 2,
      fields: linkFields(),
    },
  ],
}

export const ContentBlock: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: { plural: 'Teks', singular: 'Teks' },
  fields: [{ name: 'content', type: 'richText', label: 'Isi', required: true }],
}

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: { plural: 'Gambar', singular: 'Gambar' },
  fields: [
    { name: 'image', type: 'upload', label: 'Gambar', relationTo: 'media', required: true },
    { name: 'caption', type: 'text', label: 'Keterangan' },
  ],
}

export const CallToActionBlock: Block = {
  slug: 'callToAction',
  interfaceName: 'CallToActionBlock',
  labels: { plural: 'Ajakan (CTA)', singular: 'Ajakan (CTA)' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul', required: true },
    { name: 'text', type: 'textarea', label: 'Teks' },
    {
      name: 'button',
      type: 'group',
      label: 'Tombol (opsional)',
      fields: linkFields({ required: false }),
    },
  ],
}

export const CardGridBlock: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: { plural: 'Grid Kartu', singular: 'Grid Kartu' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul bagian' },
    { name: 'intro', type: 'textarea', label: 'Pengantar' },
    {
      name: 'cards',
      type: 'array',
      label: 'Kartu',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'title', type: 'text', label: 'Judul', required: true },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
        { name: 'image', type: 'upload', label: 'Gambar', relationTo: 'media' },
        { name: 'url', type: 'text', label: 'Tautan (opsional)' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { plural: 'Statistik', singular: 'Statistik' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul bagian' },
    {
      name: 'items',
      type: 'array',
      label: 'Angka',
      minRows: 1,
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
              admin: { width: '40%' },
            },
            {
              name: 'label',
              type: 'text',
              label: 'Keterangan',
              required: true,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { plural: 'Tanya Jawab', singular: 'Tanya Jawab' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Judul bagian',
      defaultValue: 'Pertanyaan yang Sering Diajukan',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Pertanyaan',
      minRows: 1,
      fields: [
        { name: 'question', type: 'text', label: 'Pertanyaan', required: true },
        { name: 'answer', type: 'textarea', label: 'Jawaban', required: true },
      ],
    },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { plural: 'Video YouTube', singular: 'Video YouTube' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul' },
    {
      name: 'url',
      type: 'text',
      label: 'URL YouTube',
      required: true,
      validate: validateYouTubeUrl,
    },
    { name: 'caption', type: 'text', label: 'Keterangan' },
  ],
}

export const LatestPostsBlock: Block = {
  slug: 'latestPosts',
  interfaceName: 'LatestPostsBlock',
  labels: { plural: 'Berita Terbaru', singular: 'Berita Terbaru' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul bagian', defaultValue: 'Berita Terbaru' },
    { name: 'limit', type: 'number', label: 'Jumlah berita', defaultValue: 3, min: 1, max: 9 },
  ],
}

export const ProgramListBlock: Block = {
  slug: 'programList',
  interfaceName: 'ProgramListBlock',
  labels: { plural: 'Daftar Program Studi', singular: 'Daftar Program Studi' },
  fields: [
    { name: 'title', type: 'text', label: 'Judul bagian', defaultValue: 'Program Studi' },
    { name: 'intro', type: 'textarea', label: 'Pengantar' },
  ],
}

/** Blok yang tersedia di page builder koleksi "Halaman". */
export const pageBlocks: Block[] = [
  HeroBlock,
  ContentBlock,
  MediaBlock,
  CallToActionBlock,
  CardGridBlock,
  StatsBlock,
  FaqBlock,
  VideoBlock,
  LatestPostsBlock,
  ProgramListBlock,
]
