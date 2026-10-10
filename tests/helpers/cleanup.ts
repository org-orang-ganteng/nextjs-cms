/** Jalankan: `pnpm test:cleanup`. Menghapus sisa data uji berpenanda UJI-E2E. */
import { cleanupTestData } from './testData'

const summary = await cleanupTestData()
const removed = Object.entries(summary).filter(([, count]) => count > 0)
console.log(
  removed.length
    ? `Data uji dihapus: ${removed.map(([name, count]) => `${name}=${count}`).join(', ')}`
    : 'Tidak ada data uji tersisa.',
)
process.exit(0)
