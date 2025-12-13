'use client'

import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { list } from '@/app/music/list'
import { useState, useEffect } from 'react'

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard
	const [isPlaying, setIsPlaying] = useState(false)

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	// 监听全局播放器状态
	useEffect(() => {
		const checkPlayerStatus = () => {
			const player = (window as any).musicPlayer
			if (player) {
				setIsPlaying(player.isPlaying)
			}
		}

		// 定期检查播放器状态
		const interval = setInterval(checkPlayerStatus, 100)

		return () => {
			clearInterval(interval)
		}
	}, [])

	// 处理播放按钮点击
	const handlePlayClick = async () => {
		try {
			// 检查是否有播放器实例
			if ((window as any).musicPlayer) {
				(window as any).musicPlayer.startRandomPlay()
			} else {
				// 如果播放器还没初始化，等待一下再试
				setTimeout(() => {
					if ((window as any).musicPlayer) {
						(window as any).musicPlayer.startRandomPlay()
					} else {
						toast.error('播放器正在加载中，请稍后再试')
					}
				}, 100)
			}
		} catch (error) {
			console.error('播放启动失败:', error)
			toast.error('播放启动失败')
		}
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex items-center gap-3'>
				<MusicSVG className='h-8 w-8' />

				<div className='flex-1'>
					<div className='text-secondary text-sm'>随机音乐</div>

					<div className='mt-1 h-2 rounded-full bg-white/60'>
						<div className='bg-linear h-full w-1/2 rounded-full' />
					</div>
				</div>

				<motion.button
					onClick={handlePlayClick}
					className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-shadow ${
						isPlaying
							? 'bg-brand/20 cursor-not-allowed'
							: 'bg-white hover:shadow-lg'
					}`}
					whileHover={isPlaying ? {} : { scale: 1.05 }}
					whileTap={isPlaying ? {} : { scale: 0.95 }}
					disabled={isPlaying}>
					<PlaySVG className={`ml-1 h-4 w-4 ${
						isPlaying ? 'text-brand/50' : 'text-brand'
					}`} />
				</motion.button>
			</Card>
		</HomeDraggableLayer>
	)
}
