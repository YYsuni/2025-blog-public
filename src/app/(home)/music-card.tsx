import { useEffect, useRef, useState } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'

const API_URL = 'https://api.milorapart.top/apis/random'
const NEXT_DELAY = 400

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const x =
		styles.offsetX !== null
			? center.x + styles.offsetX
			: center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset

	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: center.y -
			  clockCardStyles.offset +
			  CARD_SPACING +
			  calendarCardStyles.height +
			  CARD_SPACING

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const barRef = useRef<HTMLDivElement | null>(null)
	const loadingRef = useRef(false)

	const draggingRef = useRef(false)
	const wasPlayingRef = useRef(false)
	const dragRatioRef = useRef(0)

	const [songTitle, setSongTitle] = useState('随机音乐')
	const [displayTitle, setDisplayTitle] = useState('音乐')
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	/** 拉取并播放 */
	const loadAndPlay = async () => {
		if (loadingRef.current || !audioRef.current) return

		loadingRef.current = true
		setIsLoading(true)
		setIsPlaying(false)
		setDisplayTitle('音乐')

		try {
			const res = await fetch(API_URL)
			const json = await res.json()
			const data = json?.data
			if (!data?.audiosrc) return

			const audio = audioRef.current
			audio.src = data.audiosrc
			audio.load()

			setSongTitle(data.nickname || '随机音乐')
			setCurrentTime(0)

			await audio.play()
			setIsPlaying(true)
			setDisplayTitle(data.nickname || '随机音乐')
		} finally {
			setIsLoading(false)
			loadingRef.current = false
		}
	}

	/** 播放 / 暂停 */
	const togglePlay = async () => {
		if (isLoading || !audioRef.current) return
		const audio = audioRef.current

		if (isPlaying) {
			audio.pause()
			setIsPlaying(false)
			setDisplayTitle('音乐')
		} else {
			await audio.play()
			setIsPlaying(true)
			setDisplayTitle(songTitle)
		}
	}

	/** 拖动计算比例（只更新视觉） */
	const updateDragRatio = (clientX: number) => {
		if (!barRef.current) return
		const rect = barRef.current.getBoundingClientRect()
		dragRatioRef.current = Math.min(
			Math.max((clientX - rect.left) / rect.width, 0),
			1
		)
	}

	useEffect(() => {
		const audio = new Audio()
		audioRef.current = audio

		audio.addEventListener('loadedmetadata', () => {
			setDuration(audio.duration || 0)
		})

		audio.addEventListener('timeupdate', () => {
			if (!draggingRef.current) {
				setCurrentTime(audio.currentTime)
			}
		})

		audio.addEventListener('ended', () => {
			setIsPlaying(false)
			setDisplayTitle('音乐')
			setTimeout(loadAndPlay, NEXT_DELAY)
		})

		const timer = setTimeout(loadAndPlay, 2000)

		const onMouseUp = () => {
			if (!draggingRef.current || !audioRef.current) return

			draggingRef.current = false
			const seekTime = dragRatioRef.current * duration
			audioRef.current.currentTime = seekTime
			setCurrentTime(seekTime)

			if (wasPlayingRef.current) {
				audioRef.current.play()
				setIsPlaying(true)
				setDisplayTitle(songTitle)
			}
		}

		window.addEventListener('mouseup', onMouseUp)

		return () => {
			clearTimeout(timer)
			window.removeEventListener('mouseup', onMouseUp)
			audio.pause()
		}
	}, [duration, songTitle])

	const visualProgress = draggingRef.current
		? dragRatioRef.current * 100
		: duration
		? (currentTime / duration) * 100
		: 0

	return (
		<HomeDraggableLayer cardKey="musicCard" x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				order={styles.order}
				width={styles.width}
				height={styles.height}
				x={x}
				y={y}
				className="flex items-center gap-3"
			>
				<MusicSVG className="h-8 w-8" />

				<div className="flex-1">
					<div className="text-secondary text-sm truncate">
						{isLoading ? '加载中…' : displayTitle}
					</div>

					<div
						ref={barRef}
						className="mt-1 h-2 rounded-full bg-white/60 overflow-hidden cursor-pointer"
						onMouseDown={e => {
							if (!audioRef.current || !duration) return
							draggingRef.current = true
							wasPlayingRef.current = isPlaying
							audioRef.current.pause()
							setIsPlaying(false)
							updateDragRatio(e.clientX)
						}}
						onMouseMove={e => {
							if (draggingRef.current) {
								updateDragRatio(e.clientX)
							}
						}}
					>
						<div
							className="bg-linear h-full rounded-full transition-[width]"
							style={{ width: `${visualProgress}%` }}
						/>
					</div>
				</div>

				<button
					onClick={togglePlay}
					disabled={isLoading}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-white disabled:opacity-50"
				>
					{isPlaying ? (
						<div className="flex gap-1">
							<span className="h-4 w-1 rounded bg-brand" />
							<span className="h-4 w-1 rounded bg-brand" />
						</div>
					) : (
						<PlaySVG className="ml-1 h-4 w-4 text-brand" />
					)}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
