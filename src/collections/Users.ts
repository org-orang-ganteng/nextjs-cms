import type { CollectionConfig, FieldHook } from 'payload'

import { checkRole, isAdmin, isAdminField, isAdminOrSelf } from '@/access'

/** Pengguna pertama yang dibuat (layar "create first user") otomatis menjadi Admin. */
const ensureFirstUserIsAdmin: FieldHook = async ({ operation, req, value }) => {
  if (operation !== 'create') return value
  const { totalDocs } = await req.payload.count({ collection: 'users', req })
  const roles: string[] = Array.isArray(value) ? value : []
  if (totalDocs === 0 && !roles.includes('admin')) return [...roles, 'admin']
  return value
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { plural: 'Pengguna', singular: 'Pengguna' },
  admin: {
    defaultColumns: ['name', 'username', 'email', 'roles', 'updatedAt'],
    description: 'Akun pengelola website. Admin mengelola semuanya; Editor mengelola konten.',
    enableRichTextLink: false,
    enableRichTextRelationship: false,
    group: 'Pengaturan',
    useAsTitle: 'name',
  },
  auth: {
    lockTime: 10 * 60 * 1000,
    loginWithUsername: { allowEmailLogin: true, requireEmail: false },
    maxLoginAttempts: 5,
    tokenExpiration: 8 * 60 * 60,
  },
  access: {
    admin: ({ req: { user } }) => checkRole(user, ['admin', 'editor']),
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nama',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      label: 'Peran',
      hasMany: true,
      required: true,
      saveToJWT: true,
      defaultValue: ['editor'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
    },
  ],
}
