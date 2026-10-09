import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import { labelFor, SOCIAL_PLATFORMS } from '@/lib/options'
import { getFooter, getSiteSettings } from '@/lib/queries'

import { SiteBrand } from './SiteBrand'
import { SmartLink } from './SmartLink'

export async function SiteFooter() {
  const [footer, settings] = await Promise.all([getFooter(), getSiteSettings()])
  const copyright = (footer.copyright || '© {tahun} STAI Morowali').replace(
    '{tahun}',
    String(new Date().getFullYear()),
  )
  const socials = settings.socials ?? []
  const hasContact = Boolean(
    settings.address || settings.phone || settings.email || settings.officeHours,
  )

  return (
    <footer className="bg-pattern bg-brand-950 text-brand-100">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SiteBrand inverted settings={settings} />
          {footer.about && (
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-200">{footer.about}</p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map((social) => (
                <li key={social.id ?? social.url}>
                  <a
                    className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs font-medium hover:border-gold-300 hover:text-gold-300"
                    href={social.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {labelFor(SOCIAL_PLATFORMS, social.platform)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(footer.columns ?? []).map((column) => (
          <div className="lg:col-span-2" key={column.id ?? column.title}>
            <h2 className="text-sm font-semibold tracking-wider text-gold-300 uppercase">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(column.links ?? []).map((link) => (
                <li key={link.id ?? link.url}>
                  <SmartLink className="hover:text-white" href={link.url} newTab={link.newTab}>
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {hasContact && (
          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold tracking-wider text-gold-300 uppercase">Kontak</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {settings.address && (
                <li className="flex gap-2.5">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-300" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-2.5">
                  <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-300" />
                  <a className="hover:text-white" href={`tel:${settings.phone.replace(/\s/g, '')}`}>
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-2.5">
                  <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-300" />
                  <a className="hover:text-white" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.officeHours && (
                <li className="flex gap-2.5">
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-300" />
                  <span>{settings.officeHours}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10">
        <p className="container-site py-5 text-xs text-brand-200">{copyright}</p>
      </div>
    </footer>
  )
}
