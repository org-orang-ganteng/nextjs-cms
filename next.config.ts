import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// GitHub Codespaces meneruskan port lewat domain lain, jadi host-nya harus diizinkan untuk server action.
const { CODESPACE_NAME, GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN } = process.env
const codespaceHosts =
  CODESPACE_NAME && GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? [`${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`]
    : []
// Proxy Codespaces menulis ulang header Origin menjadi localhost:3000.
const actionOrigins = codespaceHosts.length > 0 ? [...codespaceHosts, 'localhost:3000'] : []

const nextConfig: NextConfig = {
  // Build standalone hanya untuk image Docker (lihat Dockerfile); di Windows build biasa lebih aman.
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  poweredByHeader: false,
  allowedDevOrigins: codespaceHosts,
  experimental: {
    serverActions: { allowedOrigins: actionOrigins },
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/images/**' }],
  },
  // Halaman login Payload dialihkan ke satu-satunya halaman login (/login).
  async redirects() {
    return [{ source: '/admin/login', destination: '/login', permanent: false }]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
