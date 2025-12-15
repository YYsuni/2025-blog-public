'use client'

import { useState } from 'react'

import { type AvatarItem } from './components/avatar-upload-dialog'
import { BloggerCard } from './components/blogger-card'

export interface Blogger {
	name: string
	avatar: string
	url: string
	description: string
	stars: number
}

interface GridViewProps {
	bloggers: Blogger[]
	isEditMode?: boolean
	onUpdate?: (blogger: Blogger, oldBlogger: Blogger, avatarItem?: AvatarItem) => void
	onDelete?: (blogger: Blogger) => void
}

export default function GridView({ bloggers, isEditMode = false, onUpdate, onDelete }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')

	const filteredBloggers = bloggers.filter(
		blogger => blogger.name.toLowerCase().includes(searchTerm.toLowerCase()) || blogger.description.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pt-24 pb-12'>
			<div className='mb-8'>
				<input
					type='text'
					placeholder='搜索博主...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='focus:ring-brand mx-auto block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none'
				/>
			</div>

			<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
				{filteredBloggers.map(blogger => (
					<BloggerCard key={blogger.url} blogger={blogger} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(blogger)} />
				))}
			</div>

			{filteredBloggers.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关博主</p>
				</div>
			)}
		</div>
	)
}
