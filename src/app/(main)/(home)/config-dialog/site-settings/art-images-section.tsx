'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { hashFileSHA256 } from '@/lib/file-utils'
import type { SiteContent } from '../../stores/config-store'
import type { ArtImageUploads, FileItem } from './types'

interface ArtImagesSectionProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
	artImageUploads: ArtImageUploads
	setArtImageUploads: React.Dispatch<React.SetStateAction<ArtImageUploads>>
}

export function ArtImagesSection({ formData, setFormData, artImageUploads, setArtImageUploads }: ArtImagesSectionProps) {
	const artInputRef = useRef<HTMLInputElement>(null)
	const [artUrlInput, setArtUrlInput] = useState('')

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

		setArtUrlInput('')
		if (e.currentTarget) e.currentTarget.value = ''
	}

	const handleArtUrlSubmit = () => {
		if (!artUrlInput.trim()) {
			toast.error('请输入图片 URL')
			return
		}

		const id = `url-${Date.now()}`
		setFormData(prev => {
			const existing = prev.artImages ?? []
			const artImages = [...existing, { id, url: artUrlInput.trim() }]
			return {
				...prev,
				artImages,
				currentArtImageId: prev.currentArtImageId || id
			}
		})

		setArtUrlInput('')
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
			<div className='mt-3 flex gap-2'>
				<input
					type='url'
					value={artUrlInput}
					onChange={e => setArtUrlInput(e.target.value)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault()
							handleArtUrlSubmit()
						}
					}}
					placeholder='输入图片 URL'
					className='bg-secondary/10 flex-1 rounded-lg border px-3 py-1.5 text-xs'
				/>
				<button type='button' onClick={handleArtUrlSubmit} className='bg-card rounded-lg border px-3 py-1.5 text-xs font-medium'>
					添加 URL
				</button>
			</div>
		</div>
	)
}
