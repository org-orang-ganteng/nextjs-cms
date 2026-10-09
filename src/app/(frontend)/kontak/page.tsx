import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react'
import type { Metadata } from 'next'

import { ContactForm } from '@/components/forms/ContactForm'
import { PageHeader } from '@/components/site/PageHeader'
import { toWhatsAppNumber } from '@/lib/format'
import { getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  alternates: { canonical: '/kontak' },
  description: 'Alamat, kontak resmi, dan lokasi kampus STAI Morowali.',
  title: 'Kontak',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const mapEmbedUrl = settings.mapEmbedUrl?.startsWith('https://www.google.com/maps/embed')
    ? settings.mapEmbedUrl
    : null

  const items = [
    settings.address && {
      href: settings.mapUrl || undefined,
      icon: MapPin,
      label: 'Alamat',
      value: settings.address,
    },
    settings.phone && {
      href: `tel:${settings.phone.replace(/\s/g, '')}`,
      icon: Phone,
      label: 'Telepon',
      value: settings.phone,
    },
    settings.whatsapp && {
      href: `https://wa.me/${toWhatsAppNumber(settings.whatsapp)}`,
      icon: MessageCircle,
      label: 'WhatsApp',
      value: settings.whatsapp,
    },
    settings.email && {
      href: `mailto:${settings.email}`,
      icon: Mail,
      label: 'Email',
      value: settings.email,
    },
    settings.officeHours && {
      href: undefined,
      icon: Clock,
      label: 'Jam layanan',
      value: settings.officeHours,
    },
  ].filter((item): item is NonNullable<typeof item> & object => Boolean(item))

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Kontak' }]}
        description="Hubungi kami atau kunjungi kampus STAI Morowali."
        title="Kontak & Lokasi"
      />
      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6">
          <ul className="card divide-y divide-stone-100">
            {items.map(({ href, icon: Icon, label, value }) => (
              <li className="flex gap-4 p-5" key={label}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold tracking-wide text-stone-500 uppercase">
                    {label}
                  </span>
                  {href ? (
                    <a
                      className="mt-0.5 block font-medium break-words text-stone-900 hover:text-brand-800"
                      href={href}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      target={href.startsWith('http') ? '_blank' : undefined}
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="mt-0.5 block font-medium text-stone-900">{value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {settings.mapUrl && (
            <a
              className="btn btn-outline w-full"
              href={settings.mapUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Navigation aria-hidden className="size-4" />
              Petunjuk arah
            </a>
          )}
        </div>

        <div className="min-w-0 space-y-10">
          {mapEmbedUrl && (
            <div className="card relative aspect-[16/9] overflow-hidden">
              <iframe
                allowFullScreen
                className="absolute inset-0 size-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedUrl}
                title={`Peta lokasi ${settings.siteName}`}
              />
            </div>
          )}
          <section aria-labelledby="judul-form-kontak">
            <h2 className="mb-2 text-2xl font-extrabold text-brand-950" id="judul-form-kontak">
              Kirim Pesan
            </h2>
            <p className="mb-6 text-stone-600">
              Pertanyaan seputar akademik, PMB, atau layanan kampus.
            </p>
            <ContactForm />
          </section>
        </div>
      </div>
    </>
  )
}
