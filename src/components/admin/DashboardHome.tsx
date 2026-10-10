import Link from 'next/link'
import type { CollectionSlug, ServerProps, Where } from 'payload'

type Stat = {
  label: string
  note: string
  slug: CollectionSlug
  where?: Where
}

const STATS: Stat[] = [
  { label: 'Berita', note: 'Total berita', slug: 'posts' },
  { label: 'Pengumuman', note: 'Total pengumuman', slug: 'announcements' },
  { label: 'Agenda', note: 'Total agenda kegiatan', slug: 'events' },
  {
    label: 'Pendaftar PMB',
    note: 'Pendaftar berstatus baru',
    slug: 'pmb-registrations',
    where: { status: { equals: 'baru' } },
  },
  {
    label: 'Pesan masuk',
    note: 'Pesan berstatus baru',
    slug: 'messages',
    where: { status: { equals: 'baru' } },
  },
]

const QUICK_ACTIONS: { href: string; label: string }[] = [
  { href: '/admin/collections/posts/create', label: 'Tambah berita' },
  { href: '/admin/collections/announcements/create', label: 'Tambah pengumuman' },
  { href: '/admin/collections/events/create', label: 'Tambah agenda' },
  { href: '/admin/collections/media/create', label: 'Unggah media' },
]

/** Jumlah dokumen dengan hak akses pengguna yang sedang login; null bila gagal dibaca. */
async function countStat(payload: ServerProps['payload'], user: ServerProps['user'], stat: Stat) {
  try {
    const { totalDocs } = await payload.count({
      collection: stat.slug,
      overrideAccess: false,
      user,
      where: stat.where,
    })
    return totalDocs
  } catch {
    return null
  }
}

/** Beranda panel admin: sapaan, ringkasan jumlah data, dan pintasan. */
export async function DashboardHome({ payload, user }: ServerProps) {
  const counts = await Promise.all(STATS.map((stat) => countStat(payload, user, stat)))
  const name = user?.name || user?.email || 'Pengelola'

  return (
    <section className="stai-dash">
      <header className="stai-dash__hero">
        <p className="stai-dash__eyebrow">Beranda</p>
        <h2 className="stai-dash__title">Selamat datang, {name}</h2>
        <p className="stai-dash__lead">
          Kelola berita, agenda, pendaftaran, dan pesan website dari satu tempat.
        </p>
      </header>

      <div className="stai-dash__stats">
        {STATS.map((stat, index) => {
          const count = counts[index]
          return (
            <Link
              className="stai-dash__stat"
              href={`/admin/collections/${stat.slug}`}
              key={stat.slug}
            >
              <span className="stai-dash__stat-label">{stat.label}</span>
              <span className="stai-dash__stat-value">{count ?? '—'}</span>
              <span className="stai-dash__stat-note">
                {count === null ? 'Data belum dapat dimuat' : stat.note}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="stai-dash__actions">
        {QUICK_ACTIONS.map((action) => (
          <Link className="stai-dash__action" href={action.href} key={action.href}>
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
