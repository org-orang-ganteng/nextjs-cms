import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { getSiteSettings } from '@/lib/queries'
import { getServerUrl, SITE_NAME } from '@/lib/site'

import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-jakarta',
})

// Konten dikelola lewat CMS, jadi halaman dirender per permintaan agar selalu terbaru.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings.siteName || SITE_NAME
  return {
    description: settings.description ?? undefined,
    icons: { apple: '/apple-icon.png', icon: '/icon.png' },
    metadataBase: new URL(getServerUrl()),
    openGraph: {
      images: ['/images/og-default.jpg'],
      locale: 'id_ID',
      siteName,
      type: 'website',
    },
    title: {
      default: settings.tagline ? `${siteName} — ${settings.tagline}` : siteName,
      template: `%s | ${siteName}`,
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#006638',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={jakarta.variable} lang="id">
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold text-brand-800 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          href="#konten"
        >
          Lewati ke konten utama
        </a>
        <SiteHeader />
        <main className="flex-1" id="konten">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
