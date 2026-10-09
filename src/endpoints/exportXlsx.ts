import type { CollectionSlug, DataFromCollectionSlug, Endpoint, Where } from 'payload'
import writeXlsxFile, { type Cell, type SheetData } from 'write-excel-file/node'

import { checkRole } from '@/access'

type CellValue = Date | null | number | string | undefined

export type ExportColumn<TSlug extends CollectionSlug> = {
  /** Format Excel untuk kolom tanggal, bawaan "dd/mm/yyyy hh:mm". */
  dateFormat?: string
  header: string
  value: (doc: DataFromCollectionSlug<TSlug>) => CellValue
  width?: number
}

type Options<TSlug extends CollectionSlug> = {
  collection: TSlug
  columns: ExportColumn<TSlug>[]
  /** Awalan nama berkas, tanggal ekspor ditambahkan otomatis. */
  fileName: string
  sheet: string
}

const isWhere = (value: unknown): value is Where =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toCell = (value: CellValue, dateFormat = 'dd/mm/yyyy hh:mm'): Cell => {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) return { format: dateFormat, type: Date, value }
  return value
}

/**
 * Endpoint `GET /api/{koleksi}/export` yang mengunduh data sebagai berkas Excel (.xlsx).
 * Mengikuti filter & urutan yang sedang aktif di daftar admin (parameter `where` & `sort`),
 * dan tetap tunduk pada hak akses pengguna yang login.
 */
export function xlsxExportEndpoint<TSlug extends CollectionSlug>({
  collection,
  columns,
  fileName,
  sheet,
}: Options<TSlug>): Endpoint {
  return {
    method: 'get',
    path: '/export',
    handler: async (req) => {
      if (!checkRole(req.user, ['admin', 'editor'])) {
        return Response.json(
          { message: 'Anda tidak memiliki akses untuk mengekspor data ini.' },
          { status: 403 },
        )
      }

      const where = isWhere(req.query?.where) ? req.query.where : undefined
      const sort = typeof req.query?.sort === 'string' ? req.query.sort : '-createdAt'

      const { docs } = await req.payload.find({
        collection,
        depth: 1,
        overrideAccess: false,
        pagination: false,
        req,
        sort,
        user: req.user,
        where,
      })

      const data: SheetData = [
        columns.map((column) => ({
          backgroundColor: '#DCF2E3',
          fontWeight: 'bold',
          value: column.header,
        })),
        ...docs.map((doc) =>
          columns.map((column) =>
            toCell(column.value(doc as DataFromCollectionSlug<TSlug>), column.dateFormat),
          ),
        ),
      ]

      const buffer = await writeXlsxFile(data, {
        columns: columns.map((column) => ({ width: column.width ?? 20 })),
        sheet,
        stickyRowsCount: 1,
      }).toBuffer()

      const date = new Date().toISOString().slice(0, 10)

      return new Response(new Uint8Array(buffer), {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Disposition': `attachment; filename="${fileName}-${date}.xlsx"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      })
    },
  }
}

/** Nama dokumen relasi (mis. program studi) atau string kosong. */
export function relationName(value: unknown, key = 'name'): string {
  if (value && typeof value === 'object' && key in value) {
    const name = (value as Record<string, unknown>)[key]
    return typeof name === 'string' ? name : ''
  }
  return ''
}

/** Tanggal saja (mis. tanggal lahir yang disimpan pukul 00.00 UTC). */
export const toDate = (value: null | string | undefined): Date | undefined =>
  value ? new Date(value) : undefined

const WITA_OFFSET_MS = 8 * 60 * 60 * 1000

/**
 * Tanggal + jam dalam WITA. Excel tidak menyimpan zona waktu, jadi waktu UTC
 * digeser +8 jam agar jam yang tampil sama dengan jam lokal Morowali.
 */
export const toWitaDateTime = (value: null | string | undefined): Date | undefined =>
  value ? new Date(new Date(value).getTime() + WITA_OFFSET_MS) : undefined
