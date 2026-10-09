'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/cn'

import { isActivePath, type NavItem } from './nav'
import { SmartLink } from './SmartLink'

/** Menu utama layar lebar; submenu terbuka saat hover atau fokus keyboard. */
export function DesktopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Menu utama" className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {items.map((item) => {
          const active =
            isActivePath(pathname, item.url) ||
            item.children.some((child) => isActivePath(pathname, child.url))
          return (
            <li className="group relative" key={`${item.label}-${item.url}`}>
              <SmartLink
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                  active
                    ? 'text-brand-800'
                    : 'text-stone-700 hover:bg-brand-50 hover:text-brand-800',
                )}
                href={item.url}
                newTab={item.newTab}
              >
                {item.label}
                {item.children.length > 0 && (
                  <ChevronDown
                    aria-hidden
                    className="size-3.5 transition-transform group-hover:rotate-180"
                  />
                )}
              </SmartLink>
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold-400"
                />
              )}
              {item.children.length > 0 && (
                <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <ul className="w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={`${child.label}-${child.url}`}>
                        <SmartLink
                          className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 hover:text-brand-800"
                          href={child.url}
                          newTab={child.newTab}
                        >
                          {child.label}
                        </SmartLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
