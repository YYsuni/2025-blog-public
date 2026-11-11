'use client'

import { useRef } from 'react'
import { motion } from 'motion/react'
import { useWriteStore } from '../../stores/write-store'
import { formatBytes } from '@/lib/utils'

type AttachmentsSectionProps = {
	delay?: number
}

export function AttachmentsSection({ delay = 0 }: AttachmentsSectionProps) {
	const { attachments, addAttachments, deleteAttachment } = useWriteStore()
	const fileInputRef = useRef<HTMLInputElement>(null)

	return (
		<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className='card relative py-8'>
			<div className='mb-3 text-sm font-medium'>附件</div>

			<input
				ref={fileInputRef}
				type='file'
				multiple
				className='hidden'
				onChange={e => {
					const files = e.target.files
					if (files && files.length > 0) {
						addAttachments(files)
					}
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div
				className='bg-card hover:bg-secondary/20 flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-3 py-6 text-sm text-neutral-400'
				onClick={() => fileInputRef.current?.click()}
				onDragOver={e => e.preventDefault()}
				onDrop={e => {
					e.preventDefault()
					const files = e.dataTransfer.files
					if (files && files.length) addAttachments(files)
				}}>
				点击或拖拽上传附件
			</div>

			{attachments.length > 0 && (
				<ul className='mt-3 space-y-2'>
					{attachments.map(item => {
						const name = item.name
						const size = item.size
						const href = item.type === 'url' ? item.url : undefined

						return (
							<li key={item.id} className='bg-card flex items-center gap-2 rounded-lg border px-3 py-2 text-sm'>
								{href ? (
									<a href={href} target='_blank' rel='noreferrer' className='min-w-0 flex-1 truncate underline-offset-2 hover:underline'>
										{name}
									</a>
								) : (
									<span className='min-w-0 flex-1 truncate'>{name}</span>
								)}
								{typeof size === 'number' && size > 0 && <span className='text-secondary shrink-0 text-xs'>{formatBytes(size)}</span>}
								<button type='button' className='shrink-0 rounded-md px-1.5 py-0.5 text-xs hover:bg-white/80' onClick={() => deleteAttachment(item.id)}>
									删除
								</button>
							</li>
						)
					})}
				</ul>
			)}
		</motion.div>
	)
}
