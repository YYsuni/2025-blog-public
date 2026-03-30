'use client'

import { useState } from 'react'

import { type LogoItem } from './components/logo-upload-dialog'
import { ShareCard, type Share } from './components/share-card'

interface GridViewProps {
	shares: Share[]
	isEditMode?: boolean
	onUpdate?: (share: Share, oldShare: Share, logoItem?: LogoItem) => void
	onDelete?: (share: Share) => void
}

export default function GridView({ shares, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTag, setSelectedTag] = useState<string>('all')

	const allTags = Array.from(new Set(shares.flatMap(share => share.tags)))

	const filteredShares = shares.filter(share => {
		const matchesSearch = share.name.toLowerCase().includes(searchTerm.toLowerCase()) || share.description.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesTag = selectedTag === 'all' || share.tags.includes(selectedTag)
		return matchesSearch && matchesTag
	})

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pt-24 pb-12'>
			<div className='mb-8 space-y-4'>
				<input
					type='text'
					placeholder='搜索资源...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='focus:ring-brand mx-auto block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none'
				/>

				<div className='flex flex-wrap justify-center gap-2'>
					<button
						onClick={() => setSelectedTag('all')}
						className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
							selectedTag === 'all' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}>
						全部
					</button>
					{allTags.map(tag => (
						<button
							key={tag}
							onClick={() => setSelectedTag(tag)}
							className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
								selectedTag === tag ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
							}`}>
							{tag}
						</button>
					))}
				</div>
			</div>

			<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
				{filteredShares.map(share => (
					<ShareCard key={share.url} share={share} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(share)} />
				))}
			</div>

			{filteredShares.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关资源</p>
				</div>
			)}
		</div>
	)
}
