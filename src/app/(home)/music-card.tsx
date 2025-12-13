import { useEffect, useRef, useState } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import PauseSVG from '@/svgs/pause.svg'
import { HomeDraggableLayer } from './home-draggable-layer'

const API_URL = 'https://api.milorapart.top/apis/random'

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const x = styles.offsetX !== null
		? center.x + styles.offsetX
		: center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset

	const y = styles.offsetY !== null
		? center.y + styles.offsetY
		: center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	const audioRef = useRef<HTMLAudioElement | null>(null)

	const [audioSrc, setAudioSrc] = useState('')
	const [title, setTitle] = useState('音乐')
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	/** 获取随机音乐 */
	const loadRandomMusic = async (autoPlay = true) => {
		try {
			const res = await fetch(API_URL)
			const json = await res.json()
			const data = json?.data

			if (!data?.audiosrc) return

			const audio = audioRef.current
			if (!audio) return

			audio.src = data.audiosrc
			audio.load()

			setAudioSrc(data.audiosrc)
			setCurrentTime(0)
			setDuration(0)

			// 音乐名：取歌词第一行
			if (data.lyrics) {
				const firstLine = data.lyrics.split('\n')[0]
				setTitle(firstLine || '随机音乐')
			} else {
				setTitle('随机音乐')
			}

			if (autoPlay) {
				await audio.play()
				setIsPlaying(true)
			}
		} catch (e) {
			console.error('获取随机音乐失败', e)
		}
	}

	/** 播放 / 暂停 */
	const togglePlay = async () => {
		const audio = audioRef.current
		if (!audio) return

		if (audio.paused) {
			await audio.play()
			setIsPlaying(true)
			setTitle(prev => prev === '音乐' ? '随机音乐' : prev)
		} else {
			audio.pause()
			setIsPlaying(false)
			setTitle('音乐')
		}
	}

	/** 进度条拖动 */
	const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const audio = audioRef.current
		if (!audio) return
		const time = Number(e.target.value)
		audio.currentTime = time
		setCurrentTime(time)
	}

	/** 初始化 */
	useEffect(() => {
		const audio = new Audio()
		audioRef.current = audio

		audio.addEventListener('loadedmetadata', () => {
			setDuration(audio.duration || 0)
		})

		audio.addEventListener('timeupdate', () => {
			setCurrentTime(audio.currentTime)
		})

		audio.addEventListener('ended', () => {
			setIsPlaying(false)
			loadRandomMusic(true)
		})

		// 页面打开 2 秒后自动播放
		const timer = setTimeout(() => {
			loadRandomMusic(true)
		}, 2000)

		return () => {
			clearTimeout(timer)
			audio.pause()
		}
	}, [])

	const progress = duration ? (currentTime / duration) * 100 : 0

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card
				order={styles.order}
				width={styles.width}
				height={styles.height}
				x={x}
				y={y}
				className='flex items-center gap-3'
			>
				<MusicSVG className='h-8 w-8' />

				<div className='flex-1'>
					<div className='text-secondary text-sm truncate'>
						{title}
					</div>

					<div className='mt-1'>
						<input
							type='range'
							min={0}
							max={duration || 0}
							step={0.1}
							value={currentTime}
							onChange={onSeek}
							className='w-full h-2 appearance-none rounded-full bg-white/60 cursor-pointer'
						/>
						<div
							className='pointer-events-none relative -mt-2 h-2 rounded-full bg-linear'
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				<button
					onClick={togglePlay}
					className='flex h-10 w-10 items-center justify-center rounded-full bg-white'
				>
					{isPlaying ? (
						<PauseSVG className='text-brand h-4 w-4' />
					) : (
						<PlaySVG className='text-brand ml-1 h-4 w-4' />
					)}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
