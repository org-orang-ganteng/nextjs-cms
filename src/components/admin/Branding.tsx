import Image from 'next/image'

/** Logo di halaman login panel admin. */
export function Logo() {
  return (
    <div className="stai-brand">
      <Image
        alt="Logo STAI Morowali"
        className="stai-brand__logo"
        height={64}
        src="/images/logo-stai-morowali.jpg"
        width={64}
      />
      <div>
        <p className="stai-brand__name">STAI Morowali</p>
        <p className="stai-brand__tagline">Panel Pengelola Website</p>
      </div>
    </div>
  )
}

/** Ikon kecil di navigasi panel admin. */
export function Icon() {
  return (
    <Image
      alt="STAI Morowali"
      className="stai-icon"
      height={28}
      src="/images/logo-stai-morowali.jpg"
      width={28}
    />
  )
}
