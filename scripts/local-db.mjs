#!/usr/bin/env node
/**
 * PostgreSQL lokal khusus proyek ini (tanpa Docker).
 *
 * Memakai binary PostgreSQL yang sudah terpasang (initdb, pg_ctl, psql, createdb)
 * untuk menjalankan cluster terpisah di folder `.pgdata/`. Port, user, password,
 * dan nama database dibaca dari DATABASE_URL di `.env`, sehingga server
 * PostgreSQL lain di mesin ini tidak tersentuh.
 *
 *   pnpm db:start   -> inisialisasi cluster (sekali), jalankan server, buat database
 *   pnpm db:stop    -> hentikan server
 *   pnpm db:status  -> cek status server
 *   pnpm db:reset   -> kosongkan database proyek (data hilang, khusus pengembangan)
 *
 * Lokasi binary bisa dipaksa lewat env PG_BIN, mis. "C:\Program Files\PostgreSQL\17\bin".
 */
import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const projectRoot = path.resolve(import.meta.dirname, '..')
const baseDir = path.join(projectRoot, '.pgdata')
const dataDir = path.join(baseDir, 'cluster')
const logFile = path.join(baseDir, 'postgres.log')
const isWindows = process.platform === 'win32'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

const exe = (name) => (isWindows ? `${name}.exe` : name)

function fail(message) {
  console.error(`\n[db] ${message}`)
  process.exit(1)
}

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const envFile = path.join(projectRoot, '.env')
  if (!existsSync(envFile)) return undefined
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/)
    if (match) return match[1].replace(/^['"]|['"]$/g, '')
  }
  return undefined
}

function findBinDir() {
  const candidates = []
  if (process.env.PG_BIN) candidates.push(process.env.PG_BIN)
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) {
    if (dir) candidates.push(dir)
  }
  if (isWindows) {
    const root = 'C:\\Program Files\\PostgreSQL'
    if (existsSync(root)) {
      const versions = readdirSync(root)
        .filter((version) => /^\d+/.test(version))
        .sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a))
      for (const version of versions) candidates.push(path.join(root, version, 'bin'))
    }
  } else {
    for (const version of ['18', '17', '16', '15']) {
      candidates.push(`/usr/lib/postgresql/${version}/bin`)
    }
    candidates.push('/opt/homebrew/bin', '/usr/local/bin')
  }
  return candidates.find(
    (dir) => existsSync(path.join(dir, exe('initdb'))) && existsSync(path.join(dir, exe('pg_ctl'))),
  )
}

const rawUrl = readDatabaseUrl()
if (!rawUrl) fail('DATABASE_URL belum diisi di .env (lihat .env.example).')

const url = new URL(rawUrl)
const host = url.hostname
const port = url.port || '5432'
const user = decodeURIComponent(url.username)
const password = decodeURIComponent(url.password)
const database = decodeURIComponent(url.pathname.replace(/^\//, ''))

const binDir = findBinDir()

function run(bin, args, options = {}) {
  return spawnSync(path.join(binDir, exe(bin)), args, {
    encoding: 'utf8',
    windowsHide: true,
    ...options,
  })
}

function isRunning() {
  if (!existsSync(dataDir)) return false
  return run('pg_ctl', ['status', '-D', dataDir]).status === 0
}

function initCluster() {
  mkdirSync(baseDir, { recursive: true })
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'stai-pg-'))
  const passwordFile = path.join(tempDir, 'password')
  writeFileSync(passwordFile, password)
  try {
    console.log(`[db] Inisialisasi cluster baru di ${dataDir}`)
    const result = run(
      'initdb',
      [
        '-D',
        dataDir,
        '-U',
        user,
        `--pwfile=${passwordFile}`,
        '-A',
        'scram-sha-256',
        '-E',
        'UTF8',
        '--locale=C',
      ],
      { stdio: 'inherit' },
    )
    if (result.status !== 0) fail('initdb gagal. Periksa pesan di atas.')
  } finally {
    rmSync(tempDir, { force: true, recursive: true })
  }
}

function ensureDatabase() {
  if (!/^[A-Za-z0-9_]+$/.test(database)) fail(`Nama database tidak valid: "${database}"`)
  const env = { ...process.env, PGPASSWORD: password }
  // -w: jangan pernah meminta password secara interaktif (akan menggantung).
  const connection = ['-h', host, '-p', port, '-U', user, '-w']
  const options = { env, stdio: ['ignore', 'pipe', 'pipe'], timeout: 30_000 }
  const check = run(
    'psql',
    [
      ...connection,
      '-d',
      'postgres',
      '-tAc',
      `SELECT 1 FROM pg_database WHERE datname = '${database}'`,
    ],
    options,
  )
  if (check.status !== 0) fail(`Tidak bisa terhubung ke server:\n${check.stderr || check.error}`)
  if (check.stdout.trim() === '1') return
  const create = run('createdb', [...connection, database], options)
  if (create.status !== 0) fail(`Gagal membuat database "${database}":\n${create.stderr}`)
  console.log(`[db] Database "${database}" dibuat.`)
}

/**
 * Menjalankan server di latar belakang tanpa menahan stdout/stderr pemanggil.
 *
 * Di Windows, proses anak mewarisi semua handle yang inheritable (termasuk pipe
 * stdout terminal/CI), sehingga server yang terus hidup membuat perintah
 * pemanggil menggantung. Start-Process memakai ShellExecute yang tidak
 * mewariskan handle, dan memberi server console tersembunyi sendiri.
 */
function launchServer() {
  const args = ['start', '-D', dataDir, '-l', logFile, '-o', `-p ${port} -h localhost`]
  if (!isWindows) {
    return run('pg_ctl', [...args, '-w', '-t', '60'], { stdio: 'ignore' }).status === 0
  }
  const psQuote = (value) => `'${value.replace(/'/g, "''")}'`
  const argumentList = args.map((arg) => psQuote(arg.includes(' ') ? `"${arg}"` : arg)).join(',')
  const command = `Start-Process -FilePath ${psQuote(path.join(binDir, exe('pg_ctl')))} -ArgumentList ${argumentList} -WindowStyle Hidden`
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', command],
    {
      stdio: 'ignore',
      windowsHide: true,
    },
  )
  return result.status === 0
}

async function waitUntilReady(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const ready = run('pg_isready', ['-h', host, '-p', port, '-U', user], { stdio: 'ignore' })
    if (ready.status === 0) return true
    await sleep(500)
  }
  return false
}

async function start() {
  if (!existsSync(path.join(dataDir, 'PG_VERSION'))) initCluster()
  if (isRunning()) {
    console.log(`[db] Server sudah berjalan di ${host}:${port}.`)
  } else {
    console.log(`[db] Menjalankan server di ${host}:${port} ...`)
    if (!launchServer() || !(await waitUntilReady())) {
      fail(
        `Server gagal dijalankan. Cek log: ${logFile}\nPastikan port ${port} tidak dipakai aplikasi lain.`,
      )
    }
  }
  ensureDatabase()
  console.log(`[db] Siap: postgres://${user}:***@${host}:${port}/${database}`)
}

function stop() {
  if (!isRunning()) {
    console.log('[db] Server tidak sedang berjalan.')
    return
  }
  const result = run('pg_ctl', ['stop', '-D', dataDir, '-m', 'fast', '-w'], { stdio: 'inherit' })
  if (result.status !== 0) fail('Gagal menghentikan server.')
}

function status() {
  console.log(
    isRunning() ? `[db] Berjalan di ${host}:${port} (data: ${dataDir})` : '[db] Tidak berjalan.',
  )
}

/** Menghapus lalu membuat ulang database proyek (data hilang!). Hanya untuk pengembangan. */
async function reset() {
  if (!isRunning()) await start()
  const env = { ...process.env, PGPASSWORD: password }
  const options = { env, stdio: ['ignore', 'pipe', 'pipe'], timeout: 30_000 }
  const drop = run(
    'dropdb',
    ['-h', host, '-p', port, '-U', user, '-w', '--if-exists', '--force', database],
    options,
  )
  if (drop.status !== 0) fail(`Gagal menghapus database:\n${drop.stderr}`)
  ensureDatabase()
  console.log(
    `[db] Database "${database}" dikosongkan. Berkas unggahan di folder media/ tidak ikut dihapus.`,
  )
}

const command = process.argv[2] ?? 'status'
const actions = { reset, start, status, stop }

if (!actions[command])
  fail(`Perintah tidak dikenal: ${command}. Gunakan start | stop | status | reset.`)
if (!LOCAL_HOSTS.has(host)) {
  console.log(`[db] DATABASE_URL menunjuk ke ${host}, bukan server lokal. Script ini dilewati.`)
  process.exit(0)
}
if (!binDir) {
  fail('Binary PostgreSQL (initdb/pg_ctl) tidak ditemukan. Pasang PostgreSQL atau set env PG_BIN.')
}

await actions[command]()
