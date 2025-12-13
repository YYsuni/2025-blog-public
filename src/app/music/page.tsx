'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { MusicIcon, ShuffleIcon, PlayIcon, ExternalLinkIcon } from 'lucide-react'
import { list } from './list'
import RandomMusicPlayer from '@/components/random-music-player'
import { cn } from '@/lib/utils'

interface MusicItem {
	name: string
	iframe: string
}

export default function MusicPage() {
	const [selectedSong, setSelectedSong] = useState<MusicItem | null>(null)

	return (
		<div className='min-h-screen p-8'>
			<div className='mx-auto max-w-6xl'>
				{/* 页面标题 */}
				<motion.div
					className='mb-8 text-center'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}>
					<div className='mb-4 flex justify-center'>
						<div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-secondary'>
							<MusicIcon className='h-8 w-8 text-white' />
						</div>
					</div>
					<h1 className='mb-2 text-4xl font-bold text-primary'>音乐播放器</h1>
					<p className='text-secondary'>享受美妙的音乐时光</p>
				</motion.div>

				{/* 随机播放器说明 */}
				<motion.div
					className='mb-8 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}>
					<div className='flex items-center gap-3 mb-3'>
						<ShuffleIcon className='h-5 w-5 text-brand' />
						<h2 className='text-lg font-semibold text-primary'>随机音乐播放器</h2>
					</div>
					<p className='text-secondary mb-4'>
						点击右下角的"开启随机播放"按钮，即可享受随机音乐体验。播放器支持随机切换歌曲，让你发现更多好听的音乐！
					</p>
					<div className='flex flex-wrap gap-2'>
						<span className='rounded-full bg-brand/10 px-3 py-1 text-xs text-brand'>随机播放</span>
						<span className='rounded-full bg-brand/10 px-3 py-1 text-xs text-brand'>网易云音乐</span>
						<span className='rounded-full bg-brand/10 px-3 py-1 text-xs text-brand'>B站音乐</span>
					</div>
				</motion.div>

				{/* 音乐列表 */}
				<motion.div
					className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}>
					{list.map((song, index) => (
						<motion.div
							key={index}
							className={cn(
								'group cursor-pointer rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-brand/30',
								selectedSong === song && 'border-brand/50 bg-brand/5'
							)}
							onClick={() => setSelectedSong(song)}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}>
							<div className='mb-4 flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand-secondary/20'>
										<MusicIcon className='h-5 w-5 text-brand' />
									</div>
									<h3 className='font-medium text-primary group-hover:text-brand transition-colors'>
										{song.name}
									</h3>
								</div>
								<PlayIcon className='h-4 w-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity' />
							</div>
							
							<div className='text-xs text-secondary mb-3'>
								{song.iframe.includes('music.163.com') ? '网易云音乐' : 'B站音乐'}
							</div>

							{selectedSong === song && (
								<motion.div
									className='mt-4 overflow-hidden rounded-lg border border-border'
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}>
									<div 
										className='w-full'
										dangerouslySetInnerHTML={{ __html: song.iframe }}
									/>
								</motion.div>
							)}
						</motion.div>
					))}
				</motion.div>

				{/* 使用说明 */}
				<motion.div
					className='mt-12 rounded-2xl border border-border bg-card/30 p-6 backdrop-blur-sm'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}>
					<h3 className='mb-4 text-lg font-semibold text-primary flex items-center gap-2'>
						<ExternalLinkIcon className='h-5 w-5' />
						使用说明
					</h3>
					<div className='space-y-2 text-sm text-secondary'>
						<p>• 点击歌曲卡片可以展开播放器</p>
						<p>• 使用右下角的随机播放器可以随机切换歌曲</p>
						<p>• 由于iframe限制，需要手动点击播放按钮</p>
						<p>• 支持网易云音乐和B站音乐</p>
					</div>
				</motion.div>
			</div>

			{/* 全局随机播放器 */}
			<RandomMusicPlayer />
		</div>
	)
}
