import type { GlobalConfig } from 'payload'

import { CampusProfile, Homepage, PmbInfo } from './Content'
import { Footer, Header, SiteSettings } from './Settings'

export const globals: GlobalConfig[] = [
  Homepage,
  CampusProfile,
  PmbInfo,
  SiteSettings,
  Header,
  Footer,
]
