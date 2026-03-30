import { create } from 'zustand'
import siteContent from '@/config/site-content.json'
import cardStyles from '@/config/card-styles.json'

export type SiteContent = typeof siteContent
export type CardStyles = typeof cardStyles

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

interface ConfigStore {
  siteContent: SiteContent
  cardStyles: CardStyles
  regenerateKey: number
  configDialogOpen: boolean
  setSiteContent: (content: SiteContent) => void
  setCardStyles: (styles: CardStyles) => void
  resetSiteContent: () => void
  resetCardStyles: () => void
  regenerateBubbles: () => void
  setConfigDialogOpen: (open: boolean) => void
}

export const useConfigStore = create<ConfigStore>(set => ({
  siteContent: clone(siteContent),
  cardStyles: clone(cardStyles),
  regenerateKey: 0,
  configDialogOpen: false,

  setSiteContent: (content: SiteContent) => {
    set({ siteContent: content })
  },

  setCardStyles: (styles: CardStyles) => {
    set({ cardStyles: styles })
  },

  resetSiteContent: () => {
    set({ siteContent: clone(siteContent) })
  },

  resetCardStyles: () => {
    set({ cardStyles: clone(cardStyles) })
  },

  regenerateBubbles: () => {
    set(state => ({ regenerateKey: state.regenerateKey + 1 }))
  },

  setConfigDialogOpen: (open: boolean) => {
    set({ configDialogOpen: open })
  }
}))
