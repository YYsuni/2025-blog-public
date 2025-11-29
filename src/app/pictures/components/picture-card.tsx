'use client'

import { motion } from 'motion/react'

export interface Picture {
	id: string
	uploadedAt: string
	description?: string
	image?: string
	images?: string[]
}

interface PictureCardProps {
	picture: Picture
	onDelete?: () => void
	isEditMode?: boolean
}

export function PictureCard({ picture, onDelete, isEditMode }: PictureCardProps) {
	const imageList = picture.images && picture.images.length > 0 ? picture.images : picture.image ? [picture.image] : []

	if (imageList.length === 0) {
		return null
	}

	return (
		<motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className='card relative flex flex-col gap-3'>
			{isEditMode && (
				<button onClick={onDelete} className='absolute top-3 right-3 rounded-lg px-2 py-1.5 text-xs text-red-400 transition-colors hover:text-red-600'>
					删除
				</button>
			)}

			<div className='relative flex h-56 items-center justify-center overflow-visible rounded-xl'>
				{imageList.length === 1 && (
					<div className='flex max-h-48 max-w-full items-center justify-center rounded-xl border-4 border-white bg-white shadow-xl'>
						<img src={imageList[0]} alt={picture.id} className='max-h-48 max-w-full rounded-lg object-contain' />
					</div>
				)}

				{imageList.length > 1 &&
					imageList.slice(0, 3).map((src, index) => (
						<div
							key={index}
							className={`absolute flex max-h-48 max-w-full items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white shadow-xl transition-transform ${
								index === 0 ? '-left-4 -translate-y-2 -rotate-6' : index === 1 ? 'z-20 rotate-1' : 'right-0 translate-y-2 rotate-6'
							}`}>
							<img src={src} alt={`${picture.id}-${index}`} className='max-h-48 max-w-full rounded-lg object-contain' />
						</div>
					))}

				{imageList.length > 3 && (
					<div className='absolute right-4 -bottom-2 rounded-full bg-black/70 px-3 py-1 text-xs text-white shadow-lg'>共 {imageList.length} 张</div>
				)}
			</div>
		</motion.div>
	)
}
