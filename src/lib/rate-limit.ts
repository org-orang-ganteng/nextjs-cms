/** Pembatas laju sederhana di memori — cukup untuk satu proses server di VPS. */
const hits = new Map<string, number[]>()

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
  const limited = recent.length >= limit
  if (!limited) recent.push(now)
  hits.set(key, recent)

  if (hits.size > 10_000) {
    for (const [entry, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(entry)
    }
  }
  return limited
}

/**
 * IP pengunjung dari satu header yang diisi proxy tepercaya (`TRUSTED_IP_HEADER`,
 * bawaan `x-real-ip`). Header lain diabaikan karena bisa dipalsukan pengunjung.
 * Untuk `x-forwarded-for` dipakai entri terakhir, yaitu yang ditambahkan proxy.
 */
export function clientIp(headers: Headers): string {
  const name = (process.env.TRUSTED_IP_HEADER || 'x-real-ip').trim().toLowerCase()
  const value = headers.get(name)
  const ip = name === 'x-forwarded-for' ? value?.split(',').at(-1) : value
  return ip?.trim() || 'unknown'
}
