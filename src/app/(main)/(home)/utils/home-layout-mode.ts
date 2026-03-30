'use client'

import { useMemo } from 'react'
import { useSize } from '@/hooks/use-size'
import { useCenterStore } from '@/hooks/use-center'

export type HomeLayoutMode =
  | 'desktop'
  | 'mobileLandscape'
  | 'tabletLandscape'
  | 'portrait'

export function useHomeLayoutMode(): HomeLayoutMode {
  const { isPortrait, maxLG } = useSize()
  const { width, height } = useCenterStore()

  return useMemo(() => {
    if (isPortrait) return 'portrait'

    const shortSide = Math.min(width, height)
    const longSide = Math.max(width, height)

    // 手机横屏：短边较小，整体宽高都偏紧凑
    if (shortSide <= 480 && longSide <= 950) {
      return 'mobileLandscape'
    }

    // 平板横屏：不是竖屏，但也还没到完整桌面
    if (maxLG || longSide <= 1366) {
      return 'tabletLandscape'
    }

    return 'desktop'
  }, [height, isPortrait, maxLG, width])
}
