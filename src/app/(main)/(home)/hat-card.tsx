import { ANIMATION_DELAY } from '@/consts'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useConfigStore } from './stores/config-store'
import { useCenterStore } from '@/hooks/use-center'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useHomeLayoutMode } from './utils/home-layout-mode'
import { resolveHomeCardFrame } from './utils/resolve-home-card-frame'

export default function HatCard() {
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const mode = useHomeLayoutMode()

  const styles = resolveHomeCardFrame(cardStyles, 'hatCard', mode)

  const [show, setShow] = useState(false)
  const [number, setNumber] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true)
    }, styles.order * ANIMATION_DELAY * 1000)

    return () => clearTimeout(timer)
  }, [styles.order])

  const hatIndex = siteContent.currentHatIndex ?? 1
  const hatFlipped = siteContent.hatFlipped ?? false

  if (mode === 'portrait') return null
  if (!show) return null

  const x = center.x + (styles.offsetX ?? -(styles.width / 2))
  const y = center.y + (styles.offsetY ?? -(styles.height / 2))

  return (
    <HomeDraggableLayer
      cardKey='hatCard'
      defaultX={x}
      defaultY={y}
      width={styles.width}
      height={styles.height}
    >
      <motion.div
        className='absolute flex h-full w-full items-center justify-center'
        style={{ left: x, top: y, width: styles.width, height: styles.height }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setNumber(prev => prev + 1)}
      >
        {new Array(number).fill(0).map((_, index) =>
          index === 0 ? (
            <img
              key={index}
              src={`/images/hats/${hatIndex}.webp`}
              alt='hat'
              className='h-full w-full object-contain'
              style={{
                width: styles.width,
                height: styles.height,
                transform: hatFlipped ? 'scaleX(-1)' : 'none'
              }}
            />
          ) : (
            <img
              key={index}
              src={`/images/hats/${hatIndex}.webp`}
              alt='hat'
              className='pointer-events-none absolute h-full w-full object-contain opacity-25'
              style={{
                width: styles.width,
                height: styles.height,
                transform: `translate(${index * 4}px, ${index * 4}px) ${
                  hatFlipped ? 'scaleX(-1)' : ''
                }`.trim()
              }}
            />
          )
        )}
      </motion.div>
    </HomeDraggableLayer>
  )
}
