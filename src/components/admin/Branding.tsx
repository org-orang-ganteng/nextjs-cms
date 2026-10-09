import Image from 'next/image'

/** Logo di halaman login panel admin. */
export function Logo() {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
      <Image
        alt="Logo STAI Morowali"
        height={64}
        src="/images/logo-stai-morowali.jpg"
        style={{ borderRadius: 12 }}
        width={64}
      />
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>STAI Morowali</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Panel Pengelola Website</div>
      </div>
    </div>
  )
}

/** Ikon kecil di navigasi panel admin. */
export function Icon() {
  return (
    <Image
      alt="STAI Morowali"
      height={28}
      src="/images/logo-stai-morowali.jpg"
      style={{ borderRadius: 6 }}
      width={28}
    />
  )
}
