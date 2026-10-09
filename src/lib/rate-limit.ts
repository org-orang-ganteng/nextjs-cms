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

/** IP pengunjung dari header proxy (Cloudflare/Nginx), atau "unknown". */
export function clientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
