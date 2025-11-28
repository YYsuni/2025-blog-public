'use client'

import { motion } from 'motion/react'

export interface Picture {
	id: string
	image: string
	uploadedAt: string
	description?: string
}

interface PictureCardProps {
	picture: Picture
	onDelete?: () => void
	isEditMode?: boolean
}

export function PictureCard({ picture, onDelete, isEditMode }: PictureCardProps) {
	const formattedDate = new Date(picture.uploadedAt).toLocaleString()

	return (
		<motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className='card relative flex flex-col gap-3'>
			{isEditMode && (
				<button onClick={onDelete} className='absolute top-3 right-3 rounded-lg px-2 py-1.5 text-xs text-red-400 transition-colors hover:text-red-600'>
					删除
				</button>
			)}

			<div className='overflow-hidden rounded-xl border bg-white/40'>
				<img src={picture.image} alt={picture.description || picture.id} className='h-56 w-full bg-white object-contain' />
			</div>

			<div className='flex flex-col gap-1'>
				<span className='text-secondary text-xs'>{formattedDate}</span>
				{picture.description && <p className='text-secondary text-sm leading-relaxed'>{picture.description}</p>}
			</div>
		</motion.div>
	)
}
