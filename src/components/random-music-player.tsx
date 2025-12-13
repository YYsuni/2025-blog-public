'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { ShuffleIcon, PlayIcon, MusicIcon, XIcon, EditIcon, PlusIcon, TrashIcon, SaveIcon } from 'lucide-react'
import { list } from '@/app/music/list'
import { cn } from '@/lib/utils'
import { pushMusicPlaylist, type MusicItem, type MusicPlaylist } from '@/app/music/services/push-music-playlist'
import { useAuthStore } from '@/hooks/use-auth'

export default function RandomMusicPlayer() {
	const [isPlaying, setIsPlaying] = useState(false)
	const [currentSong, setCurrentSong] = useState<MusicItem | null>(null)
	const [isExpanded, setIsExpanded] = useState(false)
	const [isMinimized, setIsMinimized] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [playHistory, setPlayHistory] = useState<MusicItem[]>([])
	const [musicList, setMusicList] = useState<MusicItem[]>(list)
	const [originalMusicList, setOriginalMusicList] = useState<MusicItem[]>(list)
	const [newSong, setNewSong] = useState({ name: '', iframe: '' })
	const [isSaving, setIsSaving] = useState(false)
	const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
	const [isHomePage, setIsHomePage] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const buttonText = isAuth ? '保存歌单' : '导入密钥'

	// 检测是否在首页（客户端hydration后）
	useEffect(() => {
		setIsHomePage(window.location.pathname === '/')
	}, [])

	// 加载用户歌单
	const loadUserPlaylist = async () => {
		try {
			// 直接读取本地JSON文件，不需要GitHub认证
			const response = await fetch('/music/user-playlist.json')
			if (response.ok) {
				const playlist = await response.json()
				if (playlist && playlist.songs && playlist.songs.length > 0) {
					setMusicList(playlist.songs)
					setOriginalMusicList(playlist.songs)
					console.log('已加载用户自定义歌单')
					return
				}
			}
		} catch (error) {
			console.log('读取用户歌单失败，使用默认歌单:', error)
		}

		// 如果没有用户歌单或读取失败，使用默认歌单
		setMusicList(list)
		setOriginalMusicList(list)
		console.log('使用默认歌单')
	}

	// 选择私钥文件
	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			// 导入密钥后不立即保存，让用户手动点击保存
			toast.success('密钥导入成功，请点击保存按钮')
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	// 处理保存点击
	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	// 保存用户歌单
	const handleSave = async () => {
		setIsSaving(true)
		setSaveStatus('saving')

		try {
			const playlist: MusicPlaylist = {
				songs: musicList,
				lastUpdated: new Date().toISOString()
			}

			await pushMusicPlaylist(playlist)
			setOriginalMusicList(musicList)
			setSaveStatus('saved')
			toast.success('歌单保存成功！')
			setTimeout(() => setSaveStatus('idle'), 2000)
		} catch (error: any) {
			console.error('保存歌单失败:', error)
			setSaveStatus('error')
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
			setTimeout(() => setSaveStatus('idle'), 2000)
		} finally {
			setIsSaving(false)
		}
	}

	// 取消编辑
	const handleCancel = () => {
		setMusicList(originalMusicList)
		setIsEditing(false)
	}

	// 组件加载时获取用户歌单
	useEffect(() => {
		loadUserPlaylist()
	}, [])

	// 获取随机歌曲（避免重复）
	const getRandomSong = (): MusicItem => {
		const availableSongs = musicList.filter(song =>
			!playHistory.some(history => history.name === song.name)
		)

		// 如果所有歌曲都播放过了，重置历史
		const songsToChoose = availableSongs.length > 0 ? availableSongs : musicList
		const randomIndex = Math.floor(Math.random() * songsToChoose.length)
		return songsToChoose[randomIndex]
	}

	// 添加新歌曲
	const addSong = () => {
		if (newSong.name.trim() && newSong.iframe.trim()) {
			setMusicList([...musicList, { ...newSong }])
			setNewSong({ name: '', iframe: '' })
		}
	}

	// 删除歌曲
	const deleteSong = (index: number) => {
		setMusicList(musicList.filter((_, i) => i !== index))
	}

	// 切换编辑模式
	const toggleEdit = () => {
		setIsEditing(!isEditing)
	}

	// 开始随机播放
	const startRandomPlay = () => {
		const song = getRandomSong()
		setCurrentSong(song)
		setPlayHistory([song])
		setIsPlaying(true)
		setIsExpanded(true)
		setIsMinimized(false)
	}

	// 播放下一首随机歌曲
	const playNextRandom = () => {
		const song = getRandomSong()
		setCurrentSong(song)
		setPlayHistory(prev => [...prev.slice(-4), song]) // 保留最近5首的历史
	}

	// 最小化播放器（点击叉叉）
	const minimizePlayer = () => {
		setIsExpanded(false)
		setIsMinimized(true)
	}

	// 完全关闭播放器
	const closePlayer = () => {
		setIsExpanded(false)
		setIsMinimized(false)
		setTimeout(() => {
			setIsPlaying(false)
			setCurrentSong(null)
			setPlayHistory([])
		}, 300)
	}

	// 恢复展开播放器
	const restorePlayer = () => {
		setIsExpanded(true)
		setIsMinimized(false)
	}

	// 处理iframe内容，移除自动播放参数
	const processIframeContent = (iframe: string): string => {
		// 移除网易云音乐的auto=1参数
		return iframe
			.replace(/auto=1/g, 'auto=0')
			.replace(/&auto=\d+/g, '')
			.replace(/\?auto=\d+&/g, '?')
			.replace(/\?auto=\d+/g, '')
	}

	// 处理后的iframe内容
	const processedIframeContent = currentSong?.iframe ? processIframeContent(currentSong.iframe) : ''

	// 导出全局访问函数，供首页MusicCard使用
	useEffect(() => {
		// 将播放器实例暴露到全局，供其他组件调用
		;(window as any).musicPlayer = {
			startRandomPlay,
			playNextRandom,
			isPlaying,
			currentSong
		}

		return () => {
			delete (window as any).musicPlayer
		}
	}, [startRandomPlay, playNextRandom, isPlaying, currentSong])

	return (
		<>
			{/* 隐藏的文件输入 */}
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='fixed bottom-6 right-6 z-50'>
			{/* 主按钮 - 只在非首页且未播放时显示 */}
			<AnimatePresence>
				{!isPlaying && !isHomePage && (
					<motion.button
						onClick={startRandomPlay}
						className={cn(
							'flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all duration-300',
							'bg-gradient-to-r from-brand to-brand-secondary text-white hover:shadow-xl'
						)}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						transition={{ duration: 0.3 }}>
						<PlayIcon className='h-5 w-5' />
						<span className='text-sm font-medium'>开启随机播放</span>
					</motion.button>
				)}
			</AnimatePresence>

			{/* 展开的播放器 */}
			<AnimatePresence>
				{isPlaying && currentSong && isExpanded && (
					<motion.div
						className='absolute bottom-0 right-0 w-[385px] rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl'
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
								<h3 className='text-base font-medium text-primary'>随机音乐播放器</h3>
								<p className='text-sm text-secondary'>{currentSong.name}</p>
							</div>
						</div>
						<button
							onClick={minimizePlayer}
							className='flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-border hover:text-primary transition-colors'>
							<XIcon className='h-4 w-4' />
						</button>
					</div>

					{/* iframe 容器 */}
					<div className='p-4'>
						<div className='relative overflow-hidden rounded-lg border border-border bg-white/5 flex items-center justify-center' style={{ height: '112px' }}>
							<div
								style={{ width: '330px', height: '86px' }}
								dangerouslySetInnerHTML={{ __html: processedIframeContent }}
							/>
						</div>
					</div>

					{/* 控制按钮 */}
					<div className='flex items-center justify-between border-t border-border p-4'>
						<motion.button
							onClick={toggleEdit}
							className='flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-secondary hover:text-primary transition-all'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							<EditIcon className='h-4 w-4' />
							<span className='text-sm font-medium'>编辑歌单</span>
						</motion.button>
						<motion.button
							onClick={playNextRandom}
							className='flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-secondary px-4 py-2 text-white shadow-lg hover:shadow-xl transition-all'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}>
							<ShuffleIcon className='h-4 w-4' />
							<span className='text-sm font-medium'>随机下一首</span>
						</motion.button>
					</div>

					{/* 编辑歌单界面 */}
					<AnimatePresence>
						{isEditing && (
							<motion.div
								className='border-t border-border'
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}>
								<div className='p-4 space-y-3'>
									<div className='space-y-2'>
										<input
											type='text'
											placeholder='歌曲名称'
											value={newSong.name}
											onChange={(e) => setNewSong({ ...newSong, name: e.target.value })}
											className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary placeholder-secondary focus:border-brand focus:outline-none'
										/>
										<textarea
											placeholder='iframe嵌入代码'
											value={newSong.iframe}
											onChange={(e) => setNewSong({ ...newSong, iframe: e.target.value })}
											className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary placeholder-secondary focus:border-brand focus:outline-none resize-none'
											rows={2}
										/>
									</div>
									<div className='flex gap-2 items-center flex-wrap'>
										<motion.button
											onClick={addSong}
											className='flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-secondary px-3 py-1.5 text-white text-sm shadow-lg hover:shadow-xl transition-all'
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}>
											<PlusIcon className='h-3 w-3' />
											<span>添加歌曲</span>
										</motion.button>

										{/* 保存按钮 */}
										<motion.button
											onClick={handleSaveClick}
											disabled={isSaving}
											className={cn(
												'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm shadow-lg transition-all',
												saveStatus === 'saved'
													? 'bg-green-500 text-white'
													: saveStatus === 'error'
													? 'bg-red-500 text-white'
													: 'bg-blue-500 text-white hover:bg-blue-600',
												isSaving && 'opacity-50 cursor-not-allowed'
											)}
											whileHover={{ scale: isSaving ? 1 : 1.05 }}
											whileTap={{ scale: isSaving ? 1 : 0.95 }}>
											{isSaving ? (
												<>
													<div className='h-3 w-3 animate-spin rounded-full border border-white border-t-transparent' />
													<span>保存中...</span>
												</>
											) : saveStatus === 'saved' ? (
												<>
													<SaveIcon className='h-3 w-3' />
													<span>已保存</span>
												</>
											) : saveStatus === 'error' ? (
												<>
													<SaveIcon className='h-3 w-3' />
													<span>保存失败</span>
												</>
											) : (
												<>
													<SaveIcon className='h-3 w-3' />
													<span>{buttonText}</span>
												</>
											)}
										</motion.button>

										{/* 取消按钮 */}
										<motion.button
											onClick={handleCancel}
											className='flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-secondary hover:text-primary transition-all'
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}>
											<XIcon className='h-3 w-3' />
											<span>取消</span>
										</motion.button>
									</div>

									{/* 歌曲列表 */}
									<div className='max-h-40 overflow-y-auto space-y-2'>
										{musicList.map((song, index) => (
											<div key={index} className='flex items-center justify-between rounded-lg border border-border bg-card p-2'>
												<span className='text-sm text-primary truncate flex-1'>{song.name}</span>
												<motion.button
													onClick={() => deleteSong(index)}
													className='flex h-6 w-6 items-center justify-center rounded text-secondary hover:text-red-500 transition-colors'
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}>
													<TrashIcon className='h-3 w-3' />
												</motion.button>
											</div>
										))}
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
					</motion.div>
				)}
			</AnimatePresence>

			{/* 最小化的iframe悬浮窗 */}
			<AnimatePresence>
				{isPlaying && currentSong && isMinimized && (
					<motion.div
						className='fixed bottom-6 right-6 w-[385px] rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl'
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						transition={{ duration: 0.3, ease: 'easeOut' }}>
						<div className='flex items-center justify-between border-b border-border p-3'>
							<div className='flex items-center gap-3'>
								<MusicIcon className='h-4 w-4 text-brand' />
								<span className='text-sm font-medium text-primary truncate max-w-48'>{currentSong.name}</span>
							</div>
							<div className='flex items-center gap-2'>
								<motion.button
									onClick={playNextRandom}
									className='flex h-6 w-6 items-center justify-center rounded text-secondary hover:text-brand transition-colors'
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}>
									<ShuffleIcon className='h-4 w-4' />
								</motion.button>
								<motion.button
									onClick={restorePlayer}
									className='flex h-6 w-6 items-center justify-center rounded text-secondary hover:text-brand transition-colors'
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}>
									<PlayIcon className='h-4 w-4' />
								</motion.button>
								<motion.button
									onClick={closePlayer}
									className='flex h-6 w-6 items-center justify-center rounded text-secondary hover:text-red-500 transition-colors'
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}>
									<XIcon className='h-4 w-4' />
								</motion.button>
							</div>
						</div>
						<div className='relative overflow-hidden flex items-center justify-center' style={{ height: '112px' }}>
							<div
								style={{ width: '330px', height: '86px' }}
								dangerouslySetInnerHTML={{ __html: processedIframeContent }}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			</div>
		</>
	)
}