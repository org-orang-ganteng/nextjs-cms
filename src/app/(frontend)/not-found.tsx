import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container-site flex flex-col items-center py-24 text-center md:py-32">
      <p className="text-6xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-950 md:text-3xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-stone-600">
        Halaman yang Anda cari mungkin sudah dipindahkan atau tidak tersedia.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link className="btn btn-primary" href="/">
          Ke beranda
        </Link>
        <Link className="btn btn-outline" href="/kontak">
          Hubungi kami
        </Link>
      </div>
    </section>
  )
}
