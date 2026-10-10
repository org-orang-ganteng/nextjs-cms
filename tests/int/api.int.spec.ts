import { getPayload, Payload } from 'payload'
import { createRegistration } from '@/collections/Registrations'
import { clientIp } from '@/lib/rate-limit'
import config from '@/payload.config'

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

let payload: Payload
let programId: number
const created: Array<{
  collection: 'pages' | 'pmb-registrations' | 'posts' | 'programs'
  id: number
}> = []

const registrationData = (nik: string) => ({
  address: 'Jalan Uji Coba No. 1, Bungku',
  birthDate: '2007-01-01T00:00:00.000Z',
  birthPlace: 'Bungku',
  firstChoice: programId,
  fullName: 'Calon Mahasiswa Uji',
  gender: 'L' as const,
  graduationYear: 2026,
  nik,
  phone: '081234567890',
  schoolOrigin: 'MA Uji',
  status: 'baru' as const,
})

describe('Model konten STAI Morowali', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const program = await payload.create({
      collection: 'programs',
      data: { code: 'UJI', degree: 'S1', name: 'Program Studi Uji', slug: 'uji-integrasi' },
    })
    programId = program.id
    created.push({ collection: 'programs', id: program.id })
  })

  afterAll(async () => {
    for (const { collection, id } of created.reverse()) {
      await payload.delete({ collection, id })
    }
  })

  it('memberi nomor pendaftaran PMB berurutan', async () => {
    const first = await payload.create({
      collection: 'pmb-registrations',
      data: registrationData('1111111111111111'),
    })
    const second = await payload.create({
      collection: 'pmb-registrations',
      data: registrationData('2222222222222222'),
    })
    created.push(
      { collection: 'pmb-registrations', id: first.id },
      { collection: 'pmb-registrations', id: second.id },
    )

    expect(first.registrationNumber).toMatch(/^PMB-\d{4}-\d{4}$/)
    const number = (value?: null | string) => Number(value?.slice(-4))
    expect(number(second.registrationNumber)).toBe(number(first.registrationNumber) + 1)
    expect(first.status).toBe('baru')
  })

  it('tetap memberi nomor unik saat pendaftar mengirim bersamaan', async () => {
    const results = await Promise.allSettled(
      ['3333333333333333', '4444444444444444', '5555555555555555'].map((nik) =>
        createRegistration(payload, registrationData(nik)),
      ),
    )
    const docs = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
    created.push(...docs.map(({ id }) => ({ collection: 'pmb-registrations' as const, id })))

    expect(results.filter((result) => result.status === 'rejected')).toEqual([])
    const numbers = docs.map((doc) => doc.registrationNumber)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('membuat slug otomatis dari judul', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        content: {
          root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 },
        },
        slug: '',
        title: 'Uji Slug & Judul Berita',
      },
      draft: true,
    })
    created.push({ collection: 'posts', id: post.id })
    expect(post.slug).toBe('uji-slug-dan-judul-berita')
  })

  it('menolak slug halaman yang bentrok dengan rute bawaan', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: { layout: [{ blockType: 'programList' }], slug: 'berita', title: 'Berita' },
      }),
    ).rejects.toThrow()
  })
})

describe('IP pengunjung untuk pembatas laju', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('hanya membaca header tepercaya, bukan header kiriman pengunjung', () => {
    const headers = new Headers({
      'cf-connecting-ip': '1.1.1.1',
      'x-forwarded-for': '2.2.2.2, 10.0.0.1',
      'x-real-ip': '10.0.0.9',
    })
    expect(clientIp(headers)).toBe('10.0.0.9')
    expect(clientIp(new Headers({ 'cf-connecting-ip': '1.1.1.1' }))).toBe('unknown')

    vi.stubEnv('TRUSTED_IP_HEADER', 'x-forwarded-for')
    expect(clientIp(headers)).toBe('10.0.0.1')
    vi.stubEnv('TRUSTED_IP_HEADER', 'CF-Connecting-IP')
    expect(clientIp(headers)).toBe('1.1.1.1')
  })
})
