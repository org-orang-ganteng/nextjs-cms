<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Proyek: Website Resmi STAI Morowali

Next.js 16 + Payload CMS 3 + PostgreSQL + Tailwind 4. Lihat `README.md` untuk setup dan pemetaan RAB.

## Konvensi

- Teks UI publik, label admin, pesan galat, dan komentar kode: **bahasa Indonesia**. Nama variabel, slug koleksi, dan nama field: bahasa Inggris.
- Rute publik berbahasa Indonesia (`/berita`, `/program-studi`). Tambah rute statis baru ke `RESERVED_PAGE_SLUGS` di `src/lib/site.ts`.
- Data publik diambil lewat `src/lib/queries.ts` (`overrideAccess: false`). Jangan memanggil Local API dengan akses penuh dari halaman publik, kecuali di server action formulir.
- Field yang dipakai ulang berupa fungsi (`seoTab()`, `slugField()`, `linkFields()`) karena Payload memodifikasi objek config saat sanitasi.
- Slug dibuat dengan `toSlug()` (`src/lib/slug.ts`), juga pada tahap `beforeValidate` agar Local API tanpa slug tetap valid.
- Pilihan select yang dipakai CMS & frontend ada di `src/lib/options.ts`.

## Setelah mengubah skema

1. `pnpm generate:types` (dan `pnpm generate:importmap` bila menambah komponen admin).
2. `pnpm payload migrate:create <nama>` lalu sertakan `src/migrations/` dalam commit.
3. `pnpm typecheck && pnpm lint && pnpm test:int`.
