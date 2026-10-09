import { NextResponse } from 'next/server'

import { getSiteSettings } from '@/lib/queries'
import { DEFAULT_JOURNAL_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

/** /jurnal mengarahkan ke Rumah Jurnal (OJS) sesuai URL di Pengaturan Situs. */
export async function GET() {
  const settings = await getSiteSettings()
  const target = /^https?:\/\//.test(settings.journalUrl ?? '')
    ? settings.journalUrl!
    : DEFAULT_JOURNAL_URL
  return NextResponse.redirect(target, 307)
}
