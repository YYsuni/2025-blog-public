import { useCenterStore } from '@/hooks/use-center'
import Card from '@/components/card'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import Link from 'next/link'
import { useHomeLayoutMode } from './utils/home-layout-mode'
import { resolveHomeCardFrame } from './utils/resolve-home-card-frame'

function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 18) return 'Good Afternoon'
  if (hour >= 18 && hour < 22) return 'Good Evening'
  return 'Good Night'
}

export default function HiCard() {
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const mode = useHomeLayoutMode()

  const greeting = getGreeting()
  const styles = resolveHomeCardFrame(cardStyles, 'hiCard', mode)
  const username = siteContent.meta.username || 'Suni'

  const x = center.x + (styles.offsetX ?? -(styles.width / 2))
  const y = center.y + (styles.offsetY ?? -(styles.height / 2))

  return (
    <HomeDraggableLayer
      cardKey='hiCard'
      defaultX={x}
      defaultY={y}
      width={styles.width}
      height={styles.height}
    >
      <Card x={x} y={y} width={styles.width} height={styles.height} order={styles.order}>
        {siteContent.enableChristmas && (
          <>
            <img
              src='/images/christmas-3.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute -top-18 -right-18 z-10 size-32 rotate-12 select-none'
            />
            <img
              src='/images/christmas-4.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute -right-3 -bottom-3 z-10 size-20 select-none'
            />
          </>
        )}

        <div className='flex h-full flex-col justify-between p-7'>
          <div>
            <h1 className='text-3xl font-semibold leading-tight'>{greeting}</h1>
            <p className='mt-3 text-2xl leading-tight text-muted-foreground'>
              I&apos;m <span className='text-foreground'>{username}</span>, Nice to meet you!
            </p>
          </div>

          <div className='flex items-center justify-between'>
            <Link href='/about' className='brand-btn'>
              About me
            </Link>

            <img
              src='/images/avatar.webp'
              alt='avatar'
              className='size-16 rounded-full object-cover'
            />
          </div>
        </div>
      </Card>
    </HomeDraggableLayer>
  )
}
