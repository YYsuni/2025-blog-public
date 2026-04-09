'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import AvatarUploadDialog, { type AvatarItem } from './avatar-upload-dialog'
import { DialogModal } from '@/components/dialog-modal'

interface Blogger {
	name: string
	avatar: string
	url: string
	description: string
	stars: number
}

interface CreateDialogProps {
	blogger: Blogger | null
	onClose: () => void
	onSave: (blogger: Blogger) => void
}

export default function CreateDialog({ blogger, onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<Blogger>({
		name: '',
		avatar: '',
		url: '',
		description: '',
		stars: 3
	})
	const [showAvatarDialog, setShowAvatarDialog] = useState(false)

	useEffect(() => {
		if (blogger) {
			setFormData(blogger)
		} else {
			setFormData({
				name: '',
				avatar: '',
				url: '',
				description: '',
				stars: 3
			})
		}
	}, [blogger])

	const handleAvatarSubmit = (avatar: AvatarItem) => {
		const avatarUrl = avatar.type === 'url' ? avatar.url : avatar.previewUrl
		setFormData({ ...formData, avatar: avatarUrl })
	}

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.avatar.trim() || !formData.url.trim() || !formData.description.trim()) {
			toast.error('请填写所有必填项')
			return
		}

		onSave(formData)
		onClose()
		toast.success(blogger ? '更新成功' : '添加成功')
	}

	return (
		<DialogModal open onClose={onClose} className='card w-sm'>
			{/* 卡片样式的内容 */}
			<div>
				<div className='mb-4 flex items-center gap-4'>
					<div className='group relative cursor-pointer' onClick={() => setShowAvatarDialog(true)}>
						{formData.avatar ? (
							<>
								<img src={formData.avatar} alt={formData.name} className='h-16 w-16 rounded-full object-cover' />
								<div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
									<span className='text-xs text-white'>更换</span>
								</div>
							</>
						) : (
							<div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-200'>
								<Plus className='h-6 w-6 text-gray-500' />
							</div>
						)}
					</div>
					<div className='flex-1'>
						<input
							type='text'
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							placeholder='博主名称'
							className='w-full text-lg font-bold focus:outline-none'
						/>
						<input
							type='url'
							value={formData.url}
							onChange={e => setFormData({ ...formData, url: e.target.value })}
							placeholder='https://example.com'
							className='text-secondary mt-1 w-full truncate text-xs focus:outline-none'
						/>
					</div>
				</div>

				{/* 星级评分 */}
				<div className='flex items-center gap-0.5'>
					{[1, 2, 3, 4, 5].map(index => (
						<div key={index} onClick={() => setFormData({ ...formData, stars: index })} className='cursor-pointer'>
							<svg width='16' height='16' viewBox='0 0 24 24' className={index <= formData.stars ? 'fill-yellow-400' : 'fill-gray-300'}>
								<path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
							</svg>
						</div>
					))}
				</div>

				<textarea
					value={formData.description}
					onChange={e => setFormData({ ...formData, description: e.target.value })}
					placeholder='博主介绍...'
					className='mt-3 w-full resize-none text-sm leading-relaxed focus:outline-none'
					rows={4}
				/>
			</div>

			{/* 操作按钮 */}
			<div className='mt-6 flex gap-3'>
				<button onClick={onClose} className='flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50'>
					取消
				</button>
				<button onClick={handleSubmit} className='brand-btn flex-1 justify-center px-4'>
					{blogger ? '保存' : '添加'}
				</button>
			</div>

			{showAvatarDialog && <AvatarUploadDialog currentAvatar={formData.avatar} onClose={() => setShowAvatarDialog(false)} onSubmit={handleAvatarSubmit} />}
		</DialogModal>
	)
}
