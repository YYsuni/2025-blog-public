'use client'

import { useRef } from 'react'
import { toast } from 'sonner'
import { hashFileSHA256 } from '@/lib/file-utils'
import type { FileItem } from './types'

interface FaviconAvatarUploadProps {
	faviconItem: FileItem | null
	setFaviconItem: React.Dispatch<React.SetStateAction<FileItem | null>>
	avatarItem: FileItem | null
	setAvatarItem: React.Dispatch<React.SetStateAction<FileItem | null>>
}

export function FaviconAvatarUpload({ faviconItem, setFaviconItem, avatarItem, setAvatarItem }: FaviconAvatarUploadProps) {
	const faviconInputRef = useRef<HTMLInputElement>(null)
	const avatarInputRef = useRef<HTMLInputElement>(null)

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

	return (
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
					<div className='absolute inset-0' onClick={() => avatarInputRef.current?.click()} />
				</div>
			</div>
		</div>
	)
}
