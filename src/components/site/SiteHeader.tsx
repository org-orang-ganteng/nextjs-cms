import { LogIn, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

import { getHeader, getSiteSettings } from '@/lib/queries'

import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'
import { toNavItems, toNavLink } from './nav'
import { SiteBrand } from './SiteBrand'
import { SmartLink } from './SmartLink'

export async function SiteHeader() {
  const [header, settings] = await Promise.all([getHeader(), getSiteSettings()])
  const items = toNavItems(header.navItems)
  const cta = toNavLink(header.cta)

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-brand-950 text-brand-100 md:block">
        <div className="container-site flex h-9 items-center justify-between gap-6 text-xs">
          <p className="truncate">{settings.fullName || settings.siteName}</p>
          <div className="flex shrink-0 items-center gap-5">
            {settings.phone && (
              <a
                className="flex items-center gap-1.5 hover:text-white"
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
              >
                <Phone aria-hidden className="size-3.5" />
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a
                className="flex items-center gap-1.5 hover:text-white"
                href={`mailto:${settings.email}`}
              >
                <Mail aria-hidden className="size-3.5" />
                {settings.email}
              </a>
            )}
            <Link className="flex items-center gap-1.5 hover:text-white" href="/login">
              <LogIn aria-hidden className="size-3.5" />
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="container-site flex h-20 items-center justify-between gap-6">
          <SiteBrand settings={settings} />
          <DesktopNav items={items} />
          <div className="flex items-center gap-2">
            {cta && (
              <SmartLink
                className="btn btn-primary hidden sm:inline-flex"
                href={cta.url}
                newTab={cta.newTab}
              >
                {cta.label}
              </SmartLink>
            )}
            <MobileNav cta={cta} items={items} />
          </div>
        </div>
      </div>
    </header>
  )
}
