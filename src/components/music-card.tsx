'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const MUSIC_FILES = ['/music/close-to-you.mp3']
const MUSIC_LIST = [
  { 
    id: 1, 
    url: '/music/Il aurait suffit Le Rouge Et Le Noir.flac', 
    title: 'Il aurait suffi', 
    artist: 'Le Rouge Et Le Noir' 
  },
  { 
    id: 2, 
    url: '/music/Lassasymphonie Florent Mothe.mp3', 
    title: "L'assasymphonie", 
    artist: 'Florent Mothe' 
  },
  { 
    id: 3, 
    url: '/music/La fête des fous Bruno Pelletier.flac', 
    title: 'La fête des fous', 
    artist: 'Bruno Pelletier' 
  },
  { 
    id: 4, 
    url: '/music/Le Temps Des Cathédrales Bruno Pelletier.flac', 
    title: 'Le Temps Des Cathédrales', 
    artist: 'Bruno Pelletier' 
  },
  { 
    id: 5, 
    url: '/music/SNEAKERS ITZY.flac', 
    title: 'SNEAKERS', 
    artist: 'ITZY' 
  },
  { 
    id: 6, 
    url: '/music/カタオモイ Aimer.flac', 
    title: 'カタオモイ', 
    artist: 'Aimer' 
  },
  { 
    id: 7, 
    url: '/music/下一站天后 Twins.flac', 
    title: '下一站天后', 
    artist: 'Twins' 
  },
  { 
    id: 8, 
    url: '/music/囍帖街谢安琪.flac', 
    title: '囍帖街', 
    artist: '谢安琪' 
  },
  { 
    id: 9, 
    url: '/music/小城谣Cover胡碧乔双笙ai.mp3', 
    title: '小城谣', 
    artist: '双笙' 
  },
  { 
    id: 10, 
    url: '/music/故梦双笙(陈元汐).m4a', 
    title: '故梦', 
    artist: '双笙(陈元汐)' 
  },
  { 
    id: 11, 
    url: '/music/春风吹方大同.flac', 
    title: '春风吹', 
    artist: '方大同' 
  },
  { 
    id: 12, 
    url: '/music/月出双笙(陈元汐).mp3', 
    title: '月出', 
    artist: '双笙(陈元汐)' 
  },
  { 
    id: 13, 
    url: '/music/死别(中文填词洛天依) 纸屑超级屑.mp3', 
    title: '死别', 
    artist: '纸屑超级屑' 
  },
  { 
    id: 14, 
    url: '/music/烟雨行舟司南.flac', 
    title: '烟雨行舟', 
    artist: '司南' 
  },
  { 
    id: 15, 
    url: '/music/琴师双笙(陈元汐).mp3', 
    title: '琴师', 
    artist: '双笙(陈元汐)' 
  },
  { 
    id: 16, 
    url: '/music/苏丽珍方大同.flac', 
    title: '苏丽珍', 
    artist: '方大同' 
  },
  { 
    id: 17, 
    url: '/music/谁家池鱼.flac', 
    title: '谁家池鱼', 
    artist: '未知' 
  }
];


export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const currentIndexRef = useRef(0)

	const isHomePage = pathname === '/'

	const position = useMemo(() => {
		// If not on home page, always position at bottom-right corner when playing
		if (!isHomePage) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - styles.height - 16
			}
		}

		// Default position on home page
		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [isPlaying, isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	const { x, y } = position

	// Initialize audio element
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

	// Handle currentIndex change - load new audio
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

	// Handle play/pause state change
	useEffect(() => {
		if (!audioRef.current) return

		if (isPlaying) {
			audioRef.current.play().catch(console.error)
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.src = ''
			}
		}
	}, [])

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying)
	}

	// Hide component if not on home page and not playing
	if (!isHomePage && !isPlaying) {
		return null
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className={clsx('flex items-center gap-3', !isHomePage && 'fixed')}>
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

				<MusicSVG className='h-8 w-8' />

				<div className='flex-1'>
					<div className='text-secondary text-sm'>{MUSIC_LIST[currentIndex].name} - {MUSIC_LIST[currentIndex].singer}</div>

					<div className='mt-1 h-2 rounded-full bg-white/60'>
						<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
					</div>
				</div>

				<button onClick={togglePlayPause} className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
					{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
