import { useEffect, useRef, useState } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'

const API_URL = 'https://api.jkyai.top/API/cy.php'
const NEXT_DELAY = 300

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

	const [songName, setSongName] = useState('')
	const [songSinger, setSongSinger] = useState('')
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	/** 拉取并播放随机音乐 */
	const loadAndPlay = async () => {
		if (loadingRef.current || !audioRef.current) return

		loadingRef.current = true
		setIsLoading(true)
		setIsPlaying(false)

		try {
			const res = await fetch(API_URL)
			const json = await res.json()

			if (json.code !== 1 || !json.data?.song_url) {
				console.error('Failed to load music:', json)
				return
			}

			const data = json.data
			const audio = audioRef.current
			audio.src = data.song_url
			audio.load()

			setSongName(data.song_name || '未知歌曲')
			setSongSinger(data.song_singer || '未知歌手')
			setCurrentTime(0)

			await audio.play()
			setIsPlaying(true)
		} catch (error) {
			console.error('Error loading music:', error)
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
		} else {
			if (!audio.src) {
				await loadAndPlay()
			} else {
				await audio.play()
				setIsPlaying(true)
			}
		}
	}

	/** 计算并设置播放进度 */
	const seekByEvent = (e: React.MouseEvent) => {
		if (!barRef.current || !audioRef.current || !duration) return

		const rect = barRef.current.getBoundingClientRect()
		const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
		const time = ratio * duration

		audioRef.current.currentTime = time
		setCurrentTime(time)
	}

	/** 初始化 Audio */
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
			setTimeout(loadAndPlay, NEXT_DELAY)
		})

		// 自动播放已关闭，点击播放按钮手动开始
		// const timer = setTimeout(loadAndPlay, 2000)

		window.addEventListener('mouseup', () => {
			draggingRef.current = false
		})

		return () => {
			// clearTimeout(timer)
			audio.pause()
		}
	}, [])

	const progress = duration ? (currentTime / duration) * 100 : 0

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

				<div className="flex-1 overflow-hidden">
					<div className="text-sm font-medium truncate">
						{isLoading ? '加载中…' : songName || '随机音乐'}
					</div>
					{songSinger && !isLoading && (
						<div className="text-secondary text-xs truncate">
							{songSinger}
						</div>
					)}

					{/* 进度条 + 可拖动 */}
					<div
						ref={barRef}
						className="mt-1 h-2 rounded-full bg-white/60 overflow-hidden cursor-pointer"
						onMouseDown={e => {
							draggingRef.current = true
							seekByEvent(e)
						}}
						onMouseMove={e => {
							if (draggingRef.current) seekByEvent(e)
						}}
					>
						<div
							className="bg-linear h-full rounded-full transition-[width]"
							style={{ width: `${progress}%` }}
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
