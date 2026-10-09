const YOUTUBE_ID = /^[\w-]{11}$/

/** Mengambil ID video dari URL YouTube (watch, youtu.be, shorts, embed, live). */
export function getYouTubeId(url: null | string | undefined): null | string {
  if (!url) return null
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace(/^www\.|^m\./, '')
    let id: null | string = null
    if (host === 'youtu.be') {
      id = parsed.pathname.slice(1)
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') {
        id = parsed.searchParams.get('v')
      } else {
        const [, kind, value] = parsed.pathname.split('/')
        if (kind && ['embed', 'live', 'shorts'].includes(kind)) id = value ?? null
      }
    }
    return id && YOUTUBE_ID.test(id) ? id : null
  } catch {
    return null
  }
}

export function getYouTubeEmbedUrl(url: null | string | undefined): null | string {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

export function validateYouTubeUrl(value: null | string | undefined): string | true {
  if (!value) return 'URL video wajib diisi.'
  return getYouTubeId(value)
    ? true
    : 'Masukkan URL YouTube yang valid, misalnya https://youtu.be/xxxxxxxxxxx'
}
