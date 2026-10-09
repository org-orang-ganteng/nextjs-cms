'use client'

import Link from 'next/link'

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="container-site flex flex-col items-center py-24 text-center md:py-32">
      <h1 className="text-2xl font-extrabold text-brand-950 md:text-3xl">Terjadi gangguan</h1>
      <p className="mt-3 max-w-md text-stone-600">
        Maaf, halaman ini gagal dimuat. Silakan coba lagi beberapa saat lagi.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn btn-primary" onClick={reset} type="button">
          Coba lagi
        </button>
        <Link className="btn btn-outline" href="/">
          Ke beranda
        </Link>
      </div>
    </section>
  )
}
