import type { Field } from 'payload'

/** Pasangan teks + tautan yang dipakai menu, tombol, dan kartu. */
export function linkFields({ required = true }: { required?: boolean } = {}): Field[] {
  return [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Teks',
          required,
          admin: { width: '50%' },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Tautan',
          required,
          admin: {
            description:
              'Tautan internal diawali "/", misalnya /berita. Tautan luar memakai https://',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'newTab',
      type: 'checkbox',
      label: 'Buka di tab baru',
      defaultValue: false,
    },
  ]
}
