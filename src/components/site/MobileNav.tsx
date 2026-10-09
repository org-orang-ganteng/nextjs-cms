'use client'

import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'

import { isActivePath, type NavItem, type NavLink } from './nav'
import { SmartLink } from './SmartLink'

/** Menu layar kecil: panel penuh dengan semua menu dan submenu terbuka. */
export function MobileNav({ cta, items }: { cta: NavLink | null; items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeButton = useRef<HTMLButtonElement>(null)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    closeButton.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const linkClass = (url: string) =>
    cn(
      'block rounded-lg px-3 py-2.5',
      isActivePath(pathname, url)
        ? 'bg-brand-50 text-brand-800'
        : 'text-stone-700 hover:bg-stone-100',
    )

  const panel = (
    <div
      aria-label="Menu"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-white xl:hidden"
      id="menu-mobile"
      role="dialog"
    >
      <div className="flex h-16 items-center justify-between border-b border-stone-200 px-4">
        <span className="font-bold text-brand-900">Menu</span>
        <button
          className="flex size-11 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100"
          onClick={close}
          ref={closeButton}
          type="button"
        >
          <X aria-hidden className="size-5" />
          <span className="sr-only">Tutup menu</span>
        </button>
      </div>
      <nav aria-label="Menu utama" className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={`${item.label}-${item.url}`}>
              <SmartLink
                className={cn(linkClass(item.url), 'font-semibold')}
                href={item.url}
                newTab={item.newTab}
                onClick={close}
              >
                {item.label}
              </SmartLink>
              {item.children.length > 0 && (
                <ul className="mt-1 mb-2 ml-3 space-y-1 border-l-2 border-gold-300 pl-3 text-sm">
                  {item.children.map((child) => (
                    <li key={`${child.label}-${child.url}`}>
                      <SmartLink
                        className={linkClass(child.url)}
                        href={child.url}
                        newTab={child.newTab}
                        onClick={close}
                      >
                        {child.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
      {cta && (
        <div className="border-t border-stone-200 p-4">
          <SmartLink
            className="btn btn-primary w-full"
            href={cta.url}
            newTab={cta.newTab}
            onClick={close}
          >
            {cta.label}
          </SmartLink>
        </div>
      )}
    </div>
  )

  return (
    <div className="xl:hidden">
      <button
        aria-controls="menu-mobile"
        aria-expanded={open}
        className="flex size-11 items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu aria-hidden className="size-5" />
        <span className="sr-only">Buka menu</span>
      </button>
      {/* Portal ke <body>: header memakai backdrop-blur, yang membuat `position: fixed`
          relatif terhadap header alih-alih viewport. */}
      {open && createPortal(panel, document.body)}
    </div>
  )
}
