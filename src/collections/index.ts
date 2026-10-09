import type { CollectionConfig } from 'payload'

import { Announcements } from './Announcements'
import { Events } from './Events'
import { Galleries } from './Galleries'
import { Media } from './Media'
import { Messages } from './Messages'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Programs } from './Programs'
import { Registrations } from './Registrations'
import { Staff } from './Staff'
import { Users } from './Users'

/** Urutan di sini menentukan urutan menu di panel admin (dalam grupnya). */
export const collections: CollectionConfig[] = [
  Posts,
  Announcements,
  Events,
  Galleries,
  Programs,
  Staff,
  Registrations,
  Messages,
  Pages,
  Media,
  Users,
]
