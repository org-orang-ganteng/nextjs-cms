import type { Header } from '@/payload-types'

export type NavLink = { label: string; newTab: boolean; url: string }
export type NavItem = NavLink & { children: NavLink[] }

type RawLink = { label?: null | string; newTab?: boolean | null; url?: null | string }

const toLink = (link: RawLink): NavLink | null =>
  link.label && link.url ? { label: link.label, newTab: Boolean(link.newTab), url: link.url } : null

/** Merapikan data menu dari CMS (membuang entri kosong). */
export function toNavItems(navItems: Header['navItems']): NavItem[] {
  return (navItems ?? []).flatMap((item) => {
    const link = toLink(item)
    if (!link) return []
    const children = (item.children ?? []).flatMap((child) => toLink(child) ?? [])
    return [{ ...link, children }]
  })
}

export function toNavLink(link: RawLink | null | undefined): NavLink | null {
  return link ? toLink(link) : null
}

/** Menu aktif bila path sama, atau path berada di bawah menu tersebut. */
export function isActivePath(pathname: string, url: string): boolean {
  const path = url.split('#')[0]?.split('?')[0] ?? ''
  if (!path.startsWith('/')) return false
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}
