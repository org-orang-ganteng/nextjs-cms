import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Tab } from 'payload'

/**
 * Tab "SEO" berisi judul, deskripsi, dan gambar untuk mesin pencari & media sosial.
 * Berupa fungsi agar tiap koleksi mendapat objek field baru (Payload memodifikasi config saat sanitasi).
 */
export function seoTab(): Tab {
  return {
    name: 'meta',
    label: 'SEO',
    fields: [
      OverviewField({
        descriptionPath: 'meta.description',
        imagePath: 'meta.image',
        titlePath: 'meta.title',
      }),
      MetaTitleField({ hasGenerateFn: true }),
      MetaImageField({ relationTo: 'media' }),
      MetaDescriptionField({}),
      PreviewField({
        descriptionPath: 'meta.description',
        hasGenerateFn: true,
        titlePath: 'meta.title',
      }),
    ],
  }
}
