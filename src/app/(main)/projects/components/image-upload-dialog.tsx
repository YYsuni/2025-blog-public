'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'

export type ImageItem = { type: 'url'; url: string } | { type: 'file'; file: File; previewUrl: string; hash?: string }

interface ImageUploadDialogProps {
	currentImage?: string
	onClose: () => void
	onSubmit: (image: ImageItem) => void
}

export default function ImageUploadDialog({ currentImage, onClose, onSubmit }: ImageUploadDialogProps) {
	const [urlInput, setUrlInput] = useState(currentImage || '')
	const [previewFile, setPreviewFile] = useState<{ file: File; previewUrl: string } | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			toast.error('请选择图片文件')
			return
		}

		const previewUrl = URL.createObjectURL(file)
		setPreviewFile({ file, previewUrl })
		setUrlInput('')
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (previewFile) {
			onSubmit({
				type: 'file',
				file: previewFile.file,
				previewUrl: previewFile.previewUrl
			})
		} else if (urlInput.trim()) {
			onSubmit({
				type: 'url',
				url: urlInput.trim()
			})
		} else {
			toast.error('请上传图片或输入 URL')
			return
		}

		setPreviewFile(null)
		setUrlInput(currentImage || '')
		onClose()
	}

	const handleClose = () => {
		if (previewFile) {
			URL.revokeObjectURL(previewFile.previewUrl)
		}
		setPreviewFile(null)
		setUrlInput(currentImage || '')
		onClose()
	}

	return (
		<DialogModal open onClose={handleClose} className='card w-md'>
			<h2 className='mb-4 text-xl font-bold'>选择图片</h2>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='text-secondary mb-2 block text-sm font-medium'>上传图片</label>
					<input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileSelect} />
					<div
						onClick={() => fileInputRef.current?.click()}
						className='mx-auto flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-secondary/10 transition-colors hover:bg-gray-200'>
						{previewFile ? (
							<img src={previewFile.previewUrl} alt='preview' className='h-full w-full rounded-xl object-cover' />
						) : (
							<div className='text-center'>
								<Plus className='text-secondary mx-auto mb-1 h-8 w-8' />
								<p className='text-secondary text-xs'>点击上传图片</p>
							</div>
						)}
					</div>
				</div>

				<div className='relative'>
					<div className='absolute inset-0 flex items-center'>
						<div className='w-full border-t border-gray-300'></div>
					</div>
					<div className='relative flex justify-center text-sm'>
						<span className='text-secondary rounded-lg bg-white px-4 py-1'>或</span>
					</div>
				</div>

				<div>
					<label className='text-secondary mb-2 block text-sm font-medium'>图片 URL</label>
					<input
						type='url'
						value={urlInput}
						onChange={e => {
							setUrlInput(e.target.value)
							if (previewFile) {
								URL.revokeObjectURL(previewFile.previewUrl)
								setPreviewFile(null)
							}
						}}
						placeholder='https://example.com/image.png'
						className='focus:ring-brand w-full rounded-lg border border-gray-300 bg-gray-200 px-4 py-2 focus:ring-2 focus:outline-none'
					/>
				</div>

				<div className='flex gap-3 pt-2'>
					<button type='submit' className='brand-btn flex-1 justify-center rounded-lg px-6 py-2.5'>
						确认
					</button>
					<button
						type='button'
						onClick={handleClose}
						className='flex-1 rounded-lg border border-gray-300 bg-white px-6 py-2.5 transition-colors hover:bg-gray-50'>
						取消
					</button>
				</div>
			</form>
		</DialogModal>
	)
}
