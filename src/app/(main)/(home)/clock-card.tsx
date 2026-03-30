'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useHomeLayoutMode } from './utils/home-layout-mode'
import { resolveHomeCardFrame } from './utils/resolve-home-card-frame'

export default function ClockCard() {
  const router = useRouter()
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const editing = useLayoutEditStore(state => state.editing)
  const [time, setTime] = useState(new Date())
  const mode = useHomeLayoutMode()

  const styles = resolveHomeCardFrame(cardStyles, 'clockCard', mode)
  const showSeconds = siteContent.clockShowSeconds ?? false

  useEffect(() => {
    const interval = showSeconds ? 1000 : 5000
    const timer = setInterval(() => {
      setTime(new Date())
    }, interval)

    return () => clearInterval(timer)
  }, [showSeconds])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  const x = center.x + (styles.offsetX ?? 0)
  const y = center.y + (styles.offsetY ?? 0)

  return (
    <HomeDraggableLayer
      cardKey='clockCard'
      defaultX={x}
      defaultY={y}
      width={styles.width}
      height={styles.height}
    >
      <Card x={x} y={y} width={styles.width} height={styles.height} order={styles.order}>
        {siteContent.enableChristmas && (
          <>
            <img
              src='/images/christmas-2.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute -top-8 -left-6 z-10 size-20 -rotate-12 select-none'
            />
            <img
              src='/images/christmas-4.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute -right-1 -bottom-1 z-10 size-12 select-none'
            />
          </>
        )}

        <div
          onClick={() => {
            if (!editing) {
              router.push('/clock')
            }
          }}
          className='bg-secondary/20 card-rounded flex h-full w-full cursor-pointer items-center justify-center gap-1.5 p-2'
        >
          <SevenSegmentDigit value={Number(hours[0])} />
          <SevenSegmentDigit value={Number(hours[1])} />
          <Colon />
          <SevenSegmentDigit value={Number(minutes[0])} />
          <SevenSegmentDigit value={Number(minutes[1])} />
          {showSeconds && (
            <>
              <Colon />
              <SevenSegmentDigit value={Number(seconds[0])} />
              <SevenSegmentDigit value={Number(seconds[1])} />
            </>
          )}
        </div>
      </Card>
    </HomeDraggableLayer>
  )
}

interface SevenSegmentDigitProps {
  value: number
  className?: string
}

function SevenSegmentDigit({ value, className }: SevenSegmentDigitProps) {
  const segmentMap = {
    0: [true, true, true, true, true, true, false],
    1: [false, true, true, false, false, false, false],
    2: [true, true, false, true, true, false, true],
    3: [true, true, true, true, false, false, true],
    4: [false, true, true, false, false, true, true],
    5: [true, false, true, true, false, true, true],
    6: [true, false, true, true, true, true, true],
    7: [true, true, true, false, false, false, false],
    8: [true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true]
  }

  const segments = segmentMap[value as keyof typeof segmentMap] || segmentMap[0]
  const activeColor = 'var(--color-primary)'
  const inactiveColor = 'rgba(0, 0, 0, 0.05)'

  return (
    <div className={className}>
      {/* 保留你原来的 seven-segment DOM 即可 */}
      <svg width='34' height='56' viewBox='0 0 34 56' fill='none'>
        <rect x='7' y='0' width='20' height='4' rx='2' fill={segments[0] ? activeColor : inactiveColor} />
        <rect x='30' y='4' width='4' height='20' rx='2' fill={segments[1] ? activeColor : inactiveColor} />
        <rect x='30' y='32' width='4' height='20' rx='2' fill={segments[2] ? activeColor : inactiveColor} />
        <rect x='7' y='52' width='20' height='4' rx='2' fill={segments[3] ? activeColor : inactiveColor} />
        <rect x='0' y='32' width='4' height='20' rx='2' fill={segments[4] ? activeColor : inactiveColor} />
        <rect x='0' y='4' width='4' height='20' rx='2' fill={segments[5] ? activeColor : inactiveColor} />
        <rect x='7' y='26' width='20' height='4' rx='2' fill={segments[6] ? activeColor : inactiveColor} />
      </svg>
    </div>
  )
}

function Colon({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg width='10' height='40' viewBox='0 0 10 40' fill='none'>
        <circle cx='5' cy='10' r='3' fill='var(--color-primary)' />
        <circle cx='5' cy='30' r='3' fill='var(--color-primary)' />
      </svg>
    </div>
  )
}
