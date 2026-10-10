'use client'

import { Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

const jakarta = Plus_Jakarta_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-jakarta',
})

/** Memuat font situs publik ke panel admin; dipakai oleh `--font-body` di custom.scss. */
export function AdminFont({ children }: { children: ReactNode }) {
  return (
    <>
      <style href="stai-admin-font" precedence="default">
        {`:root{--font-jakarta:${jakarta.style.fontFamily};}`}
      </style>
      {children}
    </>
  )
}
