import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/** Menyegarkan seluruh halaman publik setelah konten diubah dari panel admin. */
function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Di luar request Next.js (mis. `pnpm seed`) tidak ada cache yang perlu disegarkan.
  }
}

const afterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite()
  return doc
}

export const revalidateCollection = { afterChange: [afterChange], afterDelete: [afterDelete] }

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}
