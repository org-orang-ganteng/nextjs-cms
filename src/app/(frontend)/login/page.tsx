import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/forms/LoginForm'
import { asMedia } from '@/lib/media'
import { getPayloadClient, getSiteSettings } from '@/lib/queries'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Login Admin',
}

export default async function LoginPage() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (user) redirect('/admin')

  const settings = await getSiteSettings()
  const logo = asMedia(settings.logo)

  return (
    <section className="bg-pattern flex min-h-[calc(100dvh-5rem)] items-center bg-brand-800 md:min-h-[calc(100dvh-7.25rem)]">
      <h1 className="sr-only">Login Admin</h1>
      <div className="container-site w-full py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <div className="card p-6 shadow-xl md:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <Image
                alt={`Logo ${settings.siteName}`}
                className="size-20 object-contain"
                height={80}
                preload
                src={logo?.url || '/images/logo-stai-morowali.jpg'}
                width={80}
              />
              <p className="eyebrow mt-3">{settings.siteName}</p>
              <p className="mt-1 text-sm text-stone-600">
                Gunakan username atau email akun pengelola.
              </p>
            </div>
            <LoginForm />
          </div>
          <Link
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-100 hover:text-white"
            href="/"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </section>
  )
}
