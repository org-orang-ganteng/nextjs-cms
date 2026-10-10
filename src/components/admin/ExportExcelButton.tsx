'use client'

import { Button, useConfig } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'

type Props = {
  collectionSlug: string
}

/** Tombol di atas tabel daftar admin untuk mengunduh data (mengikuti filter aktif) sebagai Excel. */
export function ExportExcelButton({ collectionSlug }: Props) {
  const { config } = useConfig()
  const searchParams = useSearchParams()

  const params = new URLSearchParams(searchParams?.toString())
  params.delete('limit')
  params.delete('page')
  const query = params.toString()
  const href = `${config.serverURL}${config.routes.api}/${collectionSlug}/export${query ? `?${query}` : ''}`

  return (
    <div className="export-excel">
      <Button buttonStyle="secondary" el="anchor" size="small" url={href}>
        Ekspor ke Excel (.xlsx)
      </Button>
    </div>
  )
}
