'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { hashFileSHA256 } from '@/lib/file-utils'
import type { SiteContent } from '../../stores/config-store'
import type { BackgroundImageUploads, FileItem } from './types'

interface BackgroundImagesSectionProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
	backgroundImageUploads: BackgroundImageUploads
	setBackgroundImageUploads: React.Dispatch<React.SetStateAction<BackgroundImageUploads>>
}

export function BackgroundImagesSection({ formData, setFormData, backgroundImageUploads, setBackgroundImageUploads }: BackgroundImagesSectionProps) {
	const backgroundInputRef = useRef<HTMLInputElement>(null)
	const [backgroundUrlInput, setBackgroundUrlInput] = useState('')

	const handleBackgroundFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('请选择图片文件')
			return
		}

		const hash = await hashFileSHA256(file)
		const ext = file.name.split('.').pop() || 'png'
		const id = hash
		const targetPath = `/images/background/${id}.${ext}`
		const previewUrl = URL.createObjectURL(file)

		setBackgroundImageUploads(prev => ({
			...prev,
			[id]: { type: 'file', file, previewUrl, hash }
		}))

		setFormData(prev => {
			const existing = (prev.backgroundImages ?? []) as Array<{ id: string; url: string }>
			const filtered = existing.filter(item => item.id !== id)
			const backgroundImages = [...filtered, { id, url: targetPath }]
			return {
				...prev,
				backgroundImages: backgroundImages as any,
				currentBackgroundImageId: prev.currentBackgroundImageId || id
			}
		})

		setBackgroundUrlInput('')
		if (e.currentTarget) e.currentTarget.value = ''
	}

	const handleBackgroundUrlSubmit = () => {
		if (!backgroundUrlInput.trim()) {
			toast.error('请输入图片 URL')
			return
		}

		const id = `url-${Date.now()}`
		setFormData(prev => {
			const existing = (prev.backgroundImages ?? []) as Array<{ id: string; url: string }>
			const backgroundImages = [...existing, { id, url: backgroundUrlInput.trim() }]
			return {
				...prev,
				backgroundImages: backgroundImages as any,
				currentBackgroundImageId: prev.currentBackgroundImageId || id
			}
		})

		setBackgroundUrlInput('')
	}

	const handleSetCurrentBackgroundImage = (id: string) => {
		setFormData(prev => ({
			...prev,
			currentBackgroundImageId: id
		}))
	}

	const handleClearBackgroundImage = () => {
		setFormData(prev => ({
			...prev,
			currentBackgroundImageId: ''
		}))
	}

	const handleRemoveBackgroundImage = (id: string) => {
		const uploadItem = backgroundImageUploads[id]
		if (uploadItem?.type === 'file') {
			URL.revokeObjectURL(uploadItem.previewUrl)
		}

		setBackgroundImageUploads(prev => {
			const next = { ...prev }
			delete next[id]
			return next
		})

		setFormData(prev => {
			const existing = (prev.backgroundImages ?? []) as Array<{ id: string; url: string }>
			const backgroundImages = existing.filter(item => item.id !== id)
			const isCurrent = prev.currentBackgroundImageId === id
			return {
				...prev,
				backgroundImages: backgroundImages as any,
				currentBackgroundImageId: isCurrent ? backgroundImages[0]?.id || '' : prev.currentBackgroundImageId
			}
		})
	}

	return (
		<div>
			<div className='mb-2 flex items-center justify-between'>
				<label className='block text-sm font-medium'>背景图片</label>
				{formData.currentBackgroundImageId && formData.currentBackgroundImageId.trim() && (
					<button
						type='button'
						onClick={handleClearBackgroundImage}
						className='text-secondary rounded-lg border bg-white/60 px-3 py-1 text-xs font-medium hover:bg-white/80'>
						取消设置
					</button>
				)}
			</div>
			<input ref={backgroundInputRef} type='file' accept='image/*' className='hidden' onChange={handleBackgroundFileSelect} />

			<div className='grid grid-cols-4 gap-3 max-sm:grid-cols-3'>
				{((formData.backgroundImages ?? []) as Array<{ id: string; url: string }>)
					.filter(item => item.url && item.url.trim() !== '')
					.map(item => {
						const isActive = formData.currentBackgroundImageId === item.id
						const uploadItem = backgroundImageUploads[item.id]
						const src = uploadItem?.type === 'file' ? uploadItem.previewUrl : item.url

						return (
							<div key={item.id} className='group relative'>
								<button
									type='button'
									onClick={() => handleSetCurrentBackgroundImage(item.id)}
									className={`block w-full overflow-hidden rounded-xl border bg-white/60 transition-all ${
										isActive ? 'ring-brand shadow-md ring-2' : 'hover:border-brand/60'
									}`}>
									<img src={src} alt='background preview' className='h-24 w-full object-cover' />
								</button>
								{isActive && (
									<span className='bg-brand pointer-events-none absolute top-1 left-1 rounded-full px-2 py-0.5 text-[10px] text-white shadow'>当前使用</span>
								)}
								<button
									type='button'
									onClick={() => handleRemoveBackgroundImage(item.id)}
									className='text-secondary absolute top-1 right-1 hidden rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] shadow group-hover:block'>
									删除
								</button>
							</div>
						)
					})}
				<div className='flex items-center justify-center'>
					<button
						type='button'
						onClick={() => backgroundInputRef.current?.click()}
						className='hover:border-brand/60 flex h-24 w-full items-center justify-center rounded-xl border border-dashed bg-white/40 text-2xl text-gray-400 hover:bg-white/80'>
						+
					</button>
				</div>
			</div>
			<div className='mt-3 flex gap-2'>
				<input
					type='url'
					value={backgroundUrlInput}
					onChange={e => setBackgroundUrlInput(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							handleBackgroundUrlSubmit()
						}
					}}
					placeholder='输入图片 URL'
					className='bg-secondary/10 flex-1 rounded-lg border px-3 py-1.5 text-xs'
				/>
				<button type='button' onClick={handleBackgroundUrlSubmit} className='bg-card rounded-lg border px-3 py-1.5 text-xs font-medium'>
					添加 URL
				</button>
			</div>
		</div>
	)
}
