'use client'

import { useRef } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { hashFileSHA256 } from '@/lib/file-utils'
import type { SiteContent } from '../stores/config-store'

export type FileItem = { type: 'file'; file: File; previewUrl: string; hash?: string } | { type: 'url'; url: string }
export type ArtImageUploads = Record<string, FileItem>

interface SiteSettingsProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
	faviconItem: FileItem | null
	setFaviconItem: React.Dispatch<React.SetStateAction<FileItem | null>>
	avatarItem: FileItem | null
	setAvatarItem: React.Dispatch<React.SetStateAction<FileItem | null>>
	artImageUploads: ArtImageUploads
	setArtImageUploads: React.Dispatch<React.SetStateAction<ArtImageUploads>>
}

export function SiteSettings({
	formData,
	setFormData,
	faviconItem,
	setFaviconItem,
	avatarItem,
	setAvatarItem,
	artImageUploads,
	setArtImageUploads
}: SiteSettingsProps) {
	const faviconInputRef = useRef<HTMLInputElement>(null)
	const avatarInputRef = useRef<HTMLInputElement>(null)
	const artInputRef = useRef<HTMLInputElement>(null)

	const handleFaviconFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('请选择图片文件')
			return
		}

		const hash = await hashFileSHA256(file)
		const previewUrl = URL.createObjectURL(file)
		setFaviconItem({ type: 'file', file, previewUrl, hash })
		if (e.currentTarget) e.currentTarget.value = ''
	}

	const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('请选择图片文件')
			return
		}

		const hash = await hashFileSHA256(file)
		const previewUrl = URL.createObjectURL(file)
		setAvatarItem({ type: 'file', file, previewUrl, hash })
		if (e.currentTarget) e.currentTarget.value = ''
	}

	const handleRemoveFavicon = () => {
		if (faviconItem?.type === 'file') {
			URL.revokeObjectURL(faviconItem.previewUrl)
		}
		setFaviconItem(null)
	}

	const handleRemoveAvatar = () => {
		if (avatarItem?.type === 'file') {
			URL.revokeObjectURL(avatarItem.previewUrl)
		}
		setAvatarItem(null)
	}

	const handleArtFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (!files.length) return

		for (const file of files) {
			if (!file.type.startsWith('image/')) {
				toast.error('请选择图片文件')
				continue
			}

			const hash = await hashFileSHA256(file)
			const ext = file.name.split('.').pop() || 'png'
			const id = hash
			const targetPath = `/images/art/${id}.${ext}`
			const previewUrl = URL.createObjectURL(file)

			setArtImageUploads(prev => ({
				...prev,
				[id]: { type: 'file', file, previewUrl, hash }
			}))

			setFormData(prev => {
				const existing = prev.artImages ?? []
				const filtered = existing.filter(item => item.id !== id)
				const artImages = [...filtered, { id, url: targetPath }]
				return {
					...prev,
					artImages,
					currentArtImageId: prev.currentArtImageId || id
				}
			})
		}

		if (e.currentTarget) e.currentTarget.value = ''
	}

	const handleSetCurrentArtImage = (id: string) => {
		setFormData(prev => ({
			...prev,
			currentArtImageId: id
		}))
	}

	const handleRemoveArtImage = (id: string) => {
		const uploadItem = artImageUploads[id]
		if (uploadItem?.type === 'file') {
			URL.revokeObjectURL(uploadItem.previewUrl)
		}

		setArtImageUploads(prev => {
			const next = { ...prev }
			delete next[id]
			return next
		})

		setFormData(prev => {
			const existing = prev.artImages ?? []
			const artImages = existing.filter(item => item.id !== id)
			const isCurrent = prev.currentArtImageId === id
			return {
				...prev,
				artImages,
				currentArtImageId: isCurrent ? artImages[0]?.id || '' : prev.currentArtImageId
			}
		})
	}

	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='mb-2 block text-sm font-medium'>Favicon</label>
					<input ref={faviconInputRef} type='file' accept='image/*' className='hidden' onChange={handleFaviconFileSelect} />
					<div className='group relative h-20 w-20 cursor-pointer overflow-hidden rounded-lg border bg-white/60'>
						{faviconItem?.type === 'file' ? (
							<img src={faviconItem.previewUrl} alt='favicon preview' className='h-full w-full object-cover' />
						) : (
							<img src='/favicon.png' alt='current favicon' className='h-full w-full object-cover' />
						)}
						<div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
							<span className='text-xs text-white'>{faviconItem ? '更换' : '上传'}</span>
						</div>
						{faviconItem && (
							<div className='absolute top-1 right-1 hidden group-hover:block'>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={e => {
										e.stopPropagation()
										handleRemoveFavicon()
									}}
									className='rounded-md bg-white/90 px-2 py-1 text-xs text-red-500 shadow hover:bg-white'>
									清除
								</motion.button>
							</div>
						)}
						<div className='absolute inset-0' onClick={() => faviconInputRef.current?.click()} />
					</div>
				</div>

				<div>
					<label className='mb-2 block text-sm font-medium'>Avatar</label>
					<input ref={avatarInputRef} type='file' accept='image/*' className='hidden' onChange={handleAvatarFileSelect} />
					<div className='group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border bg-white/60'>
						{avatarItem?.type === 'file' ? (
							<img src={avatarItem.previewUrl} alt='avatar preview' className='h-full w-full object-cover' />
						) : (
							<img src='/images/avatar.png' alt='current avatar' className='h-full w-full object-cover' />
						)}
						<div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
							<span className='text-xs text-white'>{avatarItem ? '更换' : '上传'}</span>
						</div>
						{avatarItem && (
							<div className='absolute top-1 right-1 hidden group-hover:block'>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={e => {
										e.stopPropagation()
										handleRemoveAvatar()
									}}
									className='rounded-md bg-white/90 px-2 py-1 text-xs text-red-500 shadow hover:bg-white'>
									清除
								</motion.button>
							</div>
						)}
						<div className='absolute inset-0' onClick={() => avatarInputRef.current?.click()} />
					</div>
				</div>
			</div>

			<div>
				<label className='mb-2 block text-sm font-medium'>站点标题</label>
				<input
					type='text'
					value={formData.meta.title}
					onChange={e => setFormData({ ...formData, meta: { ...formData.meta, title: e.target.value } })}
					className='w-full rounded-lg border bg-gray-100 px-4 py-2 text-sm'
				/>
			</div>

			<div>
				<label className='mb-2 block text-sm font-medium'>站点描述</label>
				<textarea
					value={formData.meta.description}
					onChange={e => setFormData({ ...formData, meta: { ...formData.meta, description: e.target.value } })}
					rows={3}
					className='w-full rounded-lg border bg-gray-100 px-4 py-2 text-sm'
				/>
			</div>

			<div>
				<label className='mb-2 block text-sm font-medium'>首页图片</label>
				<input ref={artInputRef} type='file' accept='image/*' multiple className='hidden' onChange={handleArtFilesSelect} />
				{(formData.artImages?.length ?? 0) === 0 && <p className='mb-2 text-xs text-gray-500'>暂未配置 Art 图片，点击下方「+」添加。</p>}
				<div className='grid grid-cols-4 gap-3 max-sm:grid-cols-3'>
					{formData.artImages?.map(item => {
						const isActive = formData.currentArtImageId === item.id
						const uploadItem = artImageUploads[item.id]
						const src = uploadItem?.type === 'file' ? uploadItem.previewUrl : item.url

						return (
							<div key={item.id} className='group relative'>
								<button
									type='button'
									onClick={() => handleSetCurrentArtImage(item.id)}
									className={`block w-full overflow-hidden rounded-xl border bg-white/60 transition-all ${
										isActive ? 'ring-brand shadow-md ring-2' : 'hover:border-brand/60'
									}`}>
									<img src={src} alt='art preview' className='h-24 w-full object-cover' />
								</button>
								{isActive && (
									<span className='bg-brand pointer-events-none absolute top-1 left-1 rounded-full px-2 py-0.5 text-[10px] text-white shadow'>当前使用</span>
								)}
								<button
									type='button'
									onClick={() => handleRemoveArtImage(item.id)}
									className='text-secondary absolute top-1 right-1 hidden rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] shadow group-hover:block'>
									删除
								</button>
							</div>
						)
					})}
					<div className='flex items-center justify-center'>
						<button
							type='button'
							onClick={() => artInputRef.current?.click()}
							className='hover:border-brand/60 flex h-24 w-full items-center justify-center rounded-xl border border-dashed bg-white/40 text-2xl text-gray-400 hover:bg-white/80'>
							+
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
