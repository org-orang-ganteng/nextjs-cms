import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '@/hooks/revalidate'

import { CampusProfile, Homepage, PmbInfo } from './Content'
import { Footer, Header, SiteSettings } from './Settings'

export const globals: GlobalConfig[] = [
  Homepage,
  CampusProfile,
  PmbInfo,
  SiteSettings,
  Header,
  Footer,
].map((global) => ({
  ...global,
  hooks: { ...global.hooks, afterChange: [...(global.hooks?.afterChange ?? []), revalidateGlobal] },
}))
