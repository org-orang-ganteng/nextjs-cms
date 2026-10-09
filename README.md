# Website Resmi STAI Morowali

Website resmi **Sekolah Tinggi Agama Islam (STAI) Morowali**: profil kampus, 4 program studi
(PAI, PGMI, PIAUD, HKI), informasi & PMB, dan tautan ke Rumah Jurnal (OJS).
Dibangun sesuai RAB No. 004/RAB-IT/STAI-MRW/X/2026.

| Lapisan      | Teknologi                                              |
| ------------ | ------------------------------------------------------ |
| Frontend     | Next.js 16 (App Router) + React 19 + Tailwind CSS 4    |
| CMS / Admin  | Payload CMS 3 (tertanam di `/admin`), bahasa Indonesia |
| Database     | PostgreSQL (Payload tidak mendukung MySQL)             |
| Rumah Jurnal | OJS 3 terpisah di subdomain, ditautkan lewat `/jurnal` |

## Mulai cepat

Prasyarat: Node.js ≥ 20.18 (disarankan 24), pnpm 10, dan PostgreSQL 15+ **atau** Docker.

```bash
pnpm install
cp .env.example .env        # isi DATABASE_URL & PAYLOAD_SECRET
pnpm db:start               # PostgreSQL lokal khusus proyek (port 5433), lihat di bawah
pnpm seed                   # data awal: admin, 4 prodi, menu, pengaturan, contoh konten
pnpm dev                    # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

Login admin pertama memakai `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` dari `.env`
(ganti password setelah login).

### Database lokal

`pnpm db:start` memakai binary PostgreSQL yang sudah terpasang (initdb/pg_ctl) untuk menjalankan
cluster terpisah di folder `.pgdata/`, dengan user/password/port/nama database dari `DATABASE_URL`.
Server PostgreSQL lain di komputer tidak tersentuh.

| Perintah                          | Fungsi                                                |
| --------------------------------- | ----------------------------------------------------- |
| `pnpm db:start`                   | Inisialisasi (sekali), jalankan server, buat database |
| `pnpm db:stop` / `pnpm db:status` | Hentikan / cek server                                 |
| `pnpm db:reset`                   | Kosongkan database (data hilang, khusus pengembangan) |
| `pnpm dev:local`                  | `db:start` lalu `dev`                                 |

Binary tidak ditemukan? Set env `PG_BIN` ke folder `bin` PostgreSQL. Alternatif Docker:
`docker compose up -d db` (samakan `POSTGRES_PASSWORD` dengan password di `DATABASE_URL`).
Setelah restart komputer, jalankan `pnpm db:start` lagi sebelum `pnpm dev`.

## Perintah

| Perintah                             | Fungsi                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| `pnpm dev`                           | Server pengembangan                                                   |
| `pnpm build` / `pnpm start`          | Build & jalankan versi produksi                                       |
| `pnpm typecheck` / `pnpm lint`       | Pemeriksaan TypeScript & ESLint                                       |
| `pnpm test:int`                      | Tes integrasi (Vitest, butuh database)                                |
| `pnpm test:e2e`                      | Tes end-to-end (Playwright, `pnpm exec playwright install` sekali)    |
| `pnpm seed`                          | Isi data awal (dilewati bila data sudah ada; paksa `SEED_FORCE=true`) |
| `pnpm generate:types`                | Perbarui `src/payload-types.ts` setelah mengubah koleksi/global       |
| `pnpm generate:importmap`            | Perbarui import map admin setelah menambah komponen kustom            |
| `pnpm payload migrate:create <nama>` | Buat migrasi setelah skema berubah (wajib sebelum deploy)             |

## Pemetaan RAB → kode

| RAB                            | Implementasi                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------- |
| 2.2 Beranda                    | Global **Beranda** (banner, sorotan, statistik, CTA jurnal) → `/`             |
| 2.3 Profil                     | Global **Profil Kampus** (sejarah, visi misi, sambutan, struktur) → `/profil` |
| 2.4 Program Studi              | Koleksi **Program Studi** → `/program-studi`, `/program-studi/{slug}`         |
| 2.5 Dosen & Staf               | Koleksi **Dosen & Staf** → `/dosen-staf` (filter kategori & prodi)            |
| 2.6 Berita, Pengumuman, Agenda | Koleksi bersama draf/terbit → `/berita`, `/pengumuman`, `/agenda`             |
| 2.7 Galeri                     | Koleksi **Galeri** (foto + video YouTube) → `/galeri`                         |
| 2.8 Info PMB & formulir        | Global **Informasi PMB** + formulir → `/pmb`, `/pmb/daftar`                   |
| 2.9 Kontak & Maps              | Pengaturan Situs (sematan Google Maps) + formulir → `/kontak`                 |
| 2.10 SEO & performa            | Tab SEO per dokumen, `sitemap.xml`, `robots.txt`, Open Graph, next/image      |
| 3.1 Login & role               | Koleksi **Pengguna**: Admin (semua) & Editor (konten)                         |
| 3.2 Global settings            | Global **Pengaturan Situs**, **Menu Navigasi**, **Footer**                    |
| 3.3 Content management         | Semua koleksi & global di atas                                                |
| 3.4 Page builder               | Koleksi **Halaman** dengan 10 blok → `/{slug}`                                |
| 3.5 Inbox & Excel              | **Pendaftar PMB** & **Pesan Masuk** + tombol _Ekspor ke Excel (.xlsx)_        |
| 3.6 Rumah Jurnal               | `/jurnal` mengarah ke URL OJS di Pengaturan Situs; tautan jurnal per prodi    |

Hak akses: pengunjung hanya melihat konten **terbit**. Formulir PMB & kontak tidak terbuka lewat
REST API; data masuk melalui server action dengan validasi (Zod), honeypot, dan pembatas laju.
Nomor pendaftaran dibuat otomatis (`PMB-2026-0001`) dan NIK ganda per tahun akademik ditolak.

## Struktur

```
src/
├─ access/          aturan akses & peran (admin/editor)
├─ app/(frontend)/  halaman publik (rute berbahasa Indonesia), server action formulir
├─ app/(payload)/   panel admin & REST API Payload (dibuat otomatis)
├─ blocks/          definisi blok page builder
├─ collections/     koleksi Payload (Berita, Prodi, Pendaftar PMB, …)
├─ components/      UI publik (site/, blocks/, forms/) & komponen admin
├─ endpoints/       endpoint ekspor Excel
├─ fields/          field bersama (slug, SEO, tautan)
├─ globals/         global Payload (Pengaturan Situs, Beranda, Info PMB, …)
├─ lib/             query data, format tanggal, validasi formulir, utilitas
├─ migrations/      migrasi database produksi
└─ seed/            data awal
```

## Alur kerja skema & migrasi

- **Pengembangan**: Payload menyinkronkan skema otomatis (_push_) saat `pnpm dev`.
- **Sebelum deploy**: setelah mengubah koleksi/global, jalankan
  `pnpm payload migrate:create <nama-perubahan>` lalu commit folder `src/migrations/`.
- **Produksi**: migrasi yang belum jalan dieksekusi otomatis saat aplikasi start (`prodMigrations`).

## Deploy (ringkas)

- Build di CI/mesin build, bukan di VPS 3 GB: `docker build --build-arg NEXT_PUBLIC_SERVER_URL=https://<domain> .`
  (lihat `Dockerfile`; `BUILD_STANDALONE=true` sudah diset di dalamnya).
- Env produksi wajib: `DATABASE_URL`, `PAYLOAD_SECRET` (acak, ≥ 32 karakter), `NEXT_PUBLIC_SERVER_URL`.
- Simpan folder `media/` (unggahan) di volume persisten dan ikutkan dalam backup bersama database.
- Di belakang Nginx/Cloudflare, teruskan header `X-Real-IP`/`X-Forwarded-For` agar pembatas laju formulir bekerja.

## Sebelum go-live

- Ganti semua teks bertanda **[Isi resmi menyusul …]** dan hapus konten berawalan **“Contoh:”**
  serta halaman `contoh-halaman`.
- Unggah logo resolusi tinggi, foto pimpinan, struktur organisasi, data dosen/staf (RAB 6.5).
- Atur status **Informasi PMB** (buka/tutup, tahun akademik, gelombang, persyaratan, jadwal, biaya).
- Isi kontak resmi, akun media sosial, URL sematan Google Maps, dan URL Rumah Jurnal.
- Belum termasuk (sesuai RAB): payment gateway, CBT/seleksi otomatis, integrasi SIAKAD/PDDIKTI,
  dan pengiriman email (perlu layanan SMTP terpisah bila notifikasi email dibutuhkan).
