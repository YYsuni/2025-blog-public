import type { CardStyles } from '../stores/config-store'
import type { HomeLayoutMode } from './home-layout-mode'

export type LayoutBucket = 'desktop' | 'mobileLandscape' | 'tabletLandscape'

export type CardFrame = {
  width: number
  height: number
  offsetX: number | null
  offsetY: number | null
}

export type CardLayoutConfig = {
  order: number
  enabled?: boolean
  offset?: number
  desktop: CardFrame
  mobileLandscape: CardFrame
  tabletLandscape: CardFrame
}

type CardKey = keyof CardStyles

export function getLayoutBucket(mode: HomeLayoutMode): LayoutBucket {
  if (mode === 'mobileLandscape') return 'mobileLandscape'
  if (mode === 'tabletLandscape') return 'tabletLandscape'
  return 'desktop'
}

export function resolveHomeCardFrame(
  cardStyles: CardStyles,
  key: CardKey,
  mode: HomeLayoutMode
) {
  const card = cardStyles[key] as unknown as CardLayoutConfig
  const bucket = getLayoutBucket(mode)

  return {
    ...card[bucket],
    order: card.order,
    enabled: card.enabled,
    offset: card.offset
  }
}
