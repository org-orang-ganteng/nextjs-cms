/** Pilihan (select) yang dipakai bersama oleh CMS dan tampilan publik. */

export const POST_CATEGORIES = [
  { label: 'Akademik', value: 'akademik' },
  { label: 'Kemahasiswaan', value: 'kemahasiswaan' },
  { label: 'Kegiatan Kampus', value: 'kegiatan' },
  { label: 'Prestasi', value: 'prestasi' },
  { label: 'Umum', value: 'umum' },
]

export const STAFF_TYPES = [
  { label: 'Dosen', value: 'dosen' },
  { label: 'Tenaga Kependidikan', value: 'tendik' },
]

export const ACADEMIC_RANKS = [
  { label: 'Tenaga Pengajar', value: 'tenaga-pengajar' },
  { label: 'Asisten Ahli', value: 'asisten-ahli' },
  { label: 'Lektor', value: 'lektor' },
  { label: 'Lektor Kepala', value: 'lektor-kepala' },
  { label: 'Profesor', value: 'profesor' },
]

export const GENDERS = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
]

export const REGISTRATION_STATUSES = [
  { label: 'Baru', value: 'baru' },
  { label: 'Sedang diproses', value: 'diproses' },
  { label: 'Berkas terverifikasi', value: 'terverifikasi' },
  { label: 'Diterima', value: 'diterima' },
  { label: 'Batal / mengundurkan diri', value: 'batal' },
]

export const MESSAGE_STATUSES = [
  { label: 'Baru', value: 'baru' },
  { label: 'Sudah dibaca', value: 'dibaca' },
  { label: 'Sudah dibalas', value: 'dibalas' },
]

export const SOCIAL_PLATFORMS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'X (Twitter)', value: 'x' },
  { label: 'LinkedIn', value: 'linkedin' },
]

export function labelFor(
  options: ReadonlyArray<{ label: string; value: string }>,
  value: null | string | undefined,
): string {
  return options.find((option) => option.value === value)?.label ?? value ?? ''
}
