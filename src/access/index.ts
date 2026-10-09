import type { Access, FieldAccess, PayloadRequest } from 'payload'

import type { User } from '@/payload-types'

export type Role = NonNullable<User['roles']>[number]

/** Admin: semua akses. Editor: kelola konten, tanpa pengguna & pengaturan situs. */
export function checkRole(user: PayloadRequest['user'] | undefined, roles: Role[]): boolean {
  return Boolean(user?.roles?.some((role) => roles.includes(role)))
}

export const anyone: Access = () => true

export const isAdmin: Access = ({ req: { user } }) => checkRole(user, ['admin'])

export const isStaff: Access = ({ req: { user } }) => checkRole(user, ['admin', 'editor'])

export const isAdminField: FieldAccess = ({ req: { user } }) => checkRole(user, ['admin'])

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (checkRole(user, ['admin'])) return true
  return { id: { equals: user.id } }
}

/** Publik hanya melihat dokumen terbit; admin & editor juga melihat draf. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (checkRole(user, ['admin', 'editor'])) return true
  return { _status: { equals: 'published' } }
}
