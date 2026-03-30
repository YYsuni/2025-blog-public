'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '@/app/(main)/(home)/stores/config-store'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '@/app/(main)/(home)/home-draggable-layer'
import { Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useHomeLayoutMode } from '@/app/(main)/(home)/utils/home-layout-mode'
import { resolveHomeCardFrame } from '@/app/(main)/(home)/utils/resolve-home-card-frame'

const MUSIC_FILES = ['/music/close-to-you.mp3']

export default function MusicCard() {
  const pathname = usePathname()
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const mode = useHomeLayoutMode()

  const styles = resolveHomeCardFrame(cardStyles, 'musicCard', mode)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIndexRef = useRef(0)

  const isHomePage = pathname === '/'

  const position = useMemo(() => {
    // 非首页：保留右下角悬浮逻辑
    if (!isHomePage) {
      return {
        x: center.width - styles.width - 16,
        y: center.height - styles.height - 16
      }
    }

    // 首页：统一走当前布局模式配置
    return {
      x: center.x + (styles.offsetX ?? 0),
      y: center.y + (styles.offsetY ?? 0)
    }
  }, [isHomePage, center, styles])

  const { x, y } = position

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
      }
    }

    const handleEnded = () => {
      const nextIndex = (currentIndexRef.current + 1) % MUSIC_FILES.length
      currentIndexRef.current = nextIndex
      setCurrentIndex(nextIndex)
      setProgress(0)
    }

    const handleTimeUpdate = () => {
      updateProgress()
    }

    const handleLoadedMetadata = () => {
      updateProgress()
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  useEffect(() => {
    currentIndexRef.current = currentIndex

    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused
      audioRef.current.pause()
      audioRef.current.src = MUSIC_FILES[currentIndex]
      audioRef.current.loop = false
      setProgress(0)

      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentIndex])

  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev)
  }

  // 非首页且没播放时，不显示
  if (!isHomePage && !isPlaying) {
    return null
  }

  return (
    <HomeDraggableLayer
      cardKey='musicCard'
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
        className={clsx('flex items-center gap-3', !isHomePage && 'fixed')}
      >
        {siteContent.enableChristmas && (
          <>
            <img
              src='/images/christmas/snow-10.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute'
              style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
            />
            <img
              src='/images/christmas/snow-11.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute'
              style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
            />
          </>
        )}

        <MusicSVG className='h-8 w-8 shrink-0' />

        <div className='min-w-0 flex-1'>
          <div className='text-secondary truncate text-sm'>Close To You</div>

          <div className='mt-1 h-2 rounded-full bg-white/60'>
            <div
              className='bg-linear h-full rounded-full transition-all duration-300'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={togglePlayPause}
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'
        >
          {isPlaying ? (
            <Pause className='text-brand h-4 w-4' />
          ) : (
            <PlaySVG className='text-brand ml-1 h-4 w-4' />
          )}
        </button>
      </Card>
    </HomeDraggableLayer>
  )
}
