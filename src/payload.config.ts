import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { id } from '@payloadcms/translations/languages/id'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { collections } from './collections'
import { Users } from './collections/Users'
import { globals } from './globals'
import { getServerUrl, isLinkableCollection, pathFor, SITE_NAME } from './lib/site'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const serverUrl = getServerUrl()

const generateTitle: GenerateTitle = ({ doc }) => {
  const title = doc?.title ?? doc?.name
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME
}

const generateURL: GenerateURL = ({ collectionConfig, doc }) => {
  const slug = collectionConfig?.slug
  if (slug && isLinkableCollection(slug)) return `${serverUrl}${pathFor(slug, doc?.slug)}`
  return serverUrl
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '/components/admin/Branding#Icon',
        Logo: '/components/admin/Branding#Logo',
      },
    },
    dateFormat: 'd MMMM yyyy, HH:mm',
    meta: {
      icons: [{ rel: 'icon', type: 'image/png', url: '/icon.png' }],
      titleSuffix: ` — Admin ${SITE_NAME}`,
    },
  },
  collections,
  globals,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // Di produksi, cookie login hanya diterima dari domain situs sendiri.
  csrf: process.env.NODE_ENV === 'production' ? [serverUrl] : [],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Development memakai "push" otomatis; produksi menjalankan migrasi di src/migrations saat start.
    prodMigrations: migrations,
  }),
  i18n: {
    fallbackLanguage: 'id',
    supportedLanguages: { en, id },
  },
  upload: {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  },
  sharp,
  plugins: [seoPlugin({ generateTitle, generateURL })],
})
