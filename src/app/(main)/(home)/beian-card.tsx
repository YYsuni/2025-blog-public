import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useHomeLayoutMode } from './utils/home-layout-mode'
import { resolveHomeCardFrame } from './utils/resolve-home-card-frame'

export default function BeianCard() {
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const mode = useHomeLayoutMode()

  const styles = resolveHomeCardFrame(cardStyles, 'beianCard', mode)
  const beian = siteContent.beian

  if (!beian?.text) return null
  if (mode === 'portrait') return null

  const x = center.x + (styles.offsetX ?? -(styles.width / 2))
  const y = center.y + (styles.offsetY ?? 0)

  return (
    <HomeDraggableLayer
      cardKey='beianCard'
      defaultX={x}
      defaultY={y}
      width={styles.width}
      height={styles.height}
    >
      <Card
        order={styles.order}
        width={styles.width}
        height={styles.height}
        x={x}
        y={y}
        className='flex items-center justify-center'
      >
        {beian.link ? (
          <Link
            href={beian.link}
            target='_blank'
            rel='noopener noreferrer'
            className='text-secondary text-xs transition-opacity hover:opacity-80'
          >
            {beian.text}
          </Link>
        ) : (
          <span className='text-secondary text-xs'>{beian.text}</span>
        )}
      </Card>
    </HomeDraggableLayer>
  )
}
