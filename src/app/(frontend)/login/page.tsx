import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/forms/LoginForm'
import { PageHeader } from '@/components/site/PageHeader'
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
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Login Admin' }]}
        description="Masuk ke panel pengelola untuk memperbarui konten website."
        eyebrow="Panel Pengelola"
        title="Login Admin"
      />
      <div className="container-site py-12 md:py-16">
        <div className="mx-auto max-w-md">
          <div className="card p-6 md:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <Image
                alt={`Logo ${settings.siteName}`}
                className="size-16 rounded-full bg-white object-contain p-0.5 ring-4 ring-brand-50"
                height={64}
                src={logo?.url || '/images/logo-stai-morowali.jpg'}
                width={64}
              />
              <p className="eyebrow mt-4">{settings.siteName}</p>
              <p className="mt-1 text-sm text-stone-600">
                Gunakan username atau email akun pengelola.
              </p>
            </div>
            <LoginForm />
          </div>
          <Link
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
            href="/"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </>
  )
}
