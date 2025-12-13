import { useEffect, useRef, useState } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'

const API_URL = 'https://api.milorapart.top/apis/random'

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

	const [title, setTitle] = useState('音乐')
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	const loadRandomMusic = async () => {
		const res = await fetch(API_URL)
		const json = await res.json()
		const data = json?.data
		if (!data?.audiosrc) return

		const audio = audioRef.current!
		audio.src = data.audiosrc
		audio.load()

		setTitle(data.lyrics?.split('\n')[0] || '随机音乐')
		setCurrentTime(0)

		await audio.play()
		setIsPlaying(true)
	}

	const togglePlay = async () => {
		const audio = audioRef.current!
		if (audio.paused) {
			await audio.play()
			setIsPlaying(true)
		} else {
			audio.pause()
			setIsPlaying(false)
			setTitle('音乐')
		}
	}

	useEffect(() => {
		const audio = new Audio()
		audioRef.current = audio

		audio.addEventListener('loadedmetadata', () => {
			setDuration(audio.duration || 0)
		})

		audio.addEventListener('timeupdate', () => {
			setCurrentTime(audio.currentTime)
		})

		audio.addEventListener('ended', loadRandomMusic)

		setTimeout(loadRandomMusic, 2000)

		return () => audio.pause()
	}, [])

	return (
		<HomeDraggableLayer cardKey="musicCard" x={x} y={y} width={styles.width} height={styles.height}>
			<Card className="flex items-center gap-3" width={styles.width} height={styles.height}>
				<MusicSVG className="h-8 w-8" />

				<div className="flex-1">
					<div className="text-secondary text-sm truncate">{title}</div>

					<input
						type="range"
						min={0}
						max={duration}
						value={currentTime}
						onChange={e => {
							const t = Number(e.target.value)
							audioRef.current!.currentTime = t
							setCurrentTime(t)
						}}
						className="mt-1 w-full"
					/>
				</div>

				<button
					onClick={togglePlay}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
				>
					{isPlaying ? (
						<div className="flex gap-1">
							<span className="h-4 w-1 bg-brand rounded" />
							<span className="h-4 w-1 bg-brand rounded" />
						</div>
					) : (
						<PlaySVG className="ml-1 h-4 w-4 text-brand" />
					)}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
