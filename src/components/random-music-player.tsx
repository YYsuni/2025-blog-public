'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShuffleIcon, PlayIcon, MusicIcon, XIcon } from 'lucide-react'
import { list } from '@/app/music/list'
import { cn } from '@/lib/utils'

interface MusicItem {
	name: string
	iframe: string
}

export default function RandomMusicPlayer() {
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentSong, setCurrentSong] = useState<MusicItem | null>(null)
	const [isExpanded, setIsExpanded] = useState(false)
	const [playHistory, setPlayHistory] = useState<MusicItem[]>([])

	// 获取随机歌曲（避免重复）
	const getRandomSong = (): MusicItem => {
		const availableSongs = list.filter(song => 
			!playHistory.some(history => history.name === song.name)
		)
		
		// 如果所有歌曲都播放过了，重置历史
		const songsToChoose = availableSongs.length > 0 ? availableSongs : list
		const randomIndex = Math.floor(Math.random() * songsToChoose.length)
		return songsToChoose[randomIndex]
	}

	// 开始随机播放
	const startRandomPlay = () => {
		const song = getRandomSong()
		setCurrentSong(song)
		setPlayHistory([song])
		setIsPlaying(true)
		setIsExpanded(true)
	}

	// 播放下一首随机歌曲
	const playNextRandom = () => {
		const song = getRandomSong()
		setCurrentSong(song)
		setPlayHistory(prev => [...prev.slice(-4), song]) // 保留最近5首的历史
	}

	// 关闭播放器
	const closePlayer = () => {
		setIsExpanded(false)
		setTimeout(() => {
			setIsPlaying(false)
			setCurrentSong(null)
			setPlayHistory([])
		}, 300)
	}

	return (
		<div className='fixed bottom-6 right-6 z-50'>
			{/* 主按钮 */}
			<motion.button
				onClick={isPlaying ? closePlayer : startRandomPlay}
				className={cn(
					'flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all duration-300',
					isPlaying 
						? 'bg-gradient-to-r from-brand/20 to-brand-secondary/20 border border-brand/30 backdrop-blur-sm' 
						: 'bg-gradient-to-r from-brand to-brand-secondary text-white hover:shadow-xl'
				)}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}>
				{isPlaying ? (
					<>
						<MusicIcon className='h-5 w-5 text-brand' />
						<span className='text-sm font-medium text-brand'>随机播放中</span>
					</>
				) : (
					<>
						<PlayIcon className='h-5 w-5' />
						<span className='text-sm font-medium'>开启随机播放</span>
					</>
				)}
			</motion.button>

			{/* 展开的播放器 */}
			<AnimatePresence>
				{isPlaying && currentSong && (
					<motion.div
						className='absolute bottom-full right-0 mb-4 w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl'
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}>
					{/* 播放器头部 */}
					<div className='flex items-center justify-between border-b border-border p-4'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-secondary'>
								<MusicIcon className='h-5 w-5 text-white' />
							</div>
							<div>
								<h3 className='font-medium text-primary'>随机音乐播放器</h3>
								<p className='text-xs text-secondary'>正在播放: {currentSong.name}</p>
							</div>
						</div>
						<button
							onClick={closePlayer}
							className='flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-border hover:text-primary transition-colors'>
							×
						</button>
					</div>

					{/* iframe 容器 */}
					<div className='p-4'>
						<div className='relative overflow-hidden rounded-lg border border-border bg-white/5'>
							<div 
								className='aspect-video w-full'
								dangerouslySetInnerHTML={{ __html: currentSong.iframe }}
							/>
						</div>
					</div>

					{/* 控制按钮 */}
					<div className='flex items-center justify-between border-t border-border p-4'>
						<div className='text-xs text-secondary'>
							提示：无法控制iframe播放，请手动点击播放
						</div>
						<motion.button
							onClick={playNextRandom}
							className='flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-secondary px-4 py-2 text-white shadow-lg hover:shadow-xl transition-all'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							<ShuffleIcon className='h-4 w-4' />
							<span className='text-sm font-medium'>随机下一首</span>
						</motion.button>
					</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
