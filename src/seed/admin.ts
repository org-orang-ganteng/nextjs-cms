/**
 * Membuat akun admin awal dari variabel lingkungan (idempoten).
 *
 * Jalankan: `pnpm seed:admin`. Butuh SEED_ADMIN_USERNAME dan SEED_ADMIN_PASSWORD di .env.
 * Bila username/email sudah terdaftar, akun tidak dibuat ulang dan tidak ditimpa.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })
const log = payload.logger

const username = process.env.SEED_ADMIN_USERNAME?.trim()
const password = process.env.SEED_ADMIN_PASSWORD
const email = process.env.SEED_ADMIN_EMAIL?.trim() || 'admin@staimorowali.ac.id'

if (!username || !password) {
  log.error('SEED_ADMIN_USERNAME dan SEED_ADMIN_PASSWORD wajib diisi di .env.')
  process.exit(1)
}

const { totalDocs } = await payload.count({
  collection: 'users',
  where: {
    or: [
      { username: { equals: username.toLowerCase() } },
      { email: { equals: email.toLowerCase() } },
    ],
  },
})

if (totalDocs > 0) {
  log.info(`Akun dengan username "${username}" atau email ${email} sudah ada. Dilewati.`)
  process.exit(0)
}

await payload.create({
  collection: 'users',
  data: { email, name: 'Administrator', password, roles: ['admin'], username },
})
log.info(`Akun admin dibuat: ${username} (${email}).`)
process.exit(0)
