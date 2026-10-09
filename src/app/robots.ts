import type { MetadataRoute } from 'next'

import { getServerUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ allow: '/', disallow: ['/admin', '/api'], userAgent: '*' }],
    sitemap: `${getServerUrl()}/sitemap.xml`,
  }
}
