'use client'

import { useCallback, useState, type DragEvent } from 'react'
import dayjs from 'dayjs'
import type { BlogIndexItem } from '@/hooks/use-blog-index'
import { DialogModal } from '@/components/dialog-modal'
import { X } from 'lucide-react'

interface CategoryModalProps {
	open: boolean
	onClose: () => void
	categoryList: string[]
	newCategory: string
	onNewCategoryChange: (value: string) => void
	onAddCategory: () => void
	onRemoveCategory: (category: string) => void
	onReorderCategories: (nextList: string[]) => void
	editableItems: BlogIndexItem[]
	onAssignCategory: (slug: string, category?: string) => void
}

export function CategoryModal({
	open,
	onClose,
	categoryList,
	newCategory,
	onNewCategoryChange,
	onAddCategory,
	onRemoveCategory,
	onReorderCategories,
	editableItems,
	onAssignCategory
}: CategoryModalProps) {
	const [draggingIndex, setDraggingIndex] = useState<number | null>(null)

	const handleDragStart = useCallback((index: number) => {
		return () => {
			setDraggingIndex(index)
		}
	}, [])

	const handleDragOver = useCallback((index: number) => {
		return (event: DragEvent<HTMLSpanElement>) => {
			event.preventDefault()
			event.dataTransfer.dropEffect = 'move'
		}
	}, [])

	const handleDrop = useCallback(
		(index: number) => {
			return (event: DragEvent<HTMLSpanElement>) => {
				event.preventDefault()
				if (draggingIndex === null || draggingIndex === index) return

				const next = [...categoryList]
				const [moved] = next.splice(draggingIndex, 1)
				next.splice(index, 0, moved)
				onReorderCategories(next)
				setDraggingIndex(null)
			}
		},
		[categoryList, draggingIndex, onReorderCategories]
	)

	const handleDragEnd = useCallback(() => {
		setDraggingIndex(null)
	}, [])

	return (
		<DialogModal open={open} onClose={onClose} className='card w-[720px] max-w-[90vw] rounded-2xl p-6'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='text-lg font-semibold'>文章分类</div>
				<button onClick={onClose} className='text-secondary hover:text-brand text-sm'>
					关闭
				</button>
			</div>
			<div className='space-y-4'>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
					<input
						value={newCategory}
						onChange={e => onNewCategoryChange(e.target.value)}
						placeholder='输入分类名称'
						className='focus:border-brand w-full rounded-lg border px-3 py-2 text-sm outline-none'
					/>
					<button onClick={onAddCategory} className='brand-btn px-4 py-2 text-sm whitespace-nowrap'>
						新增分类
					</button>
				</div>
				<div className='flex flex-wrap gap-2 rounded-lg bg-white/60 p-3 text-sm'>
					{categoryList.length === 0 ? (
						<span className='text-secondary'>暂无分类</span>
					) : (
						categoryList.map((cat, index) => (
							<span
								key={cat}
								draggable
								onDragStart={handleDragStart(index)}
								onDragOver={handleDragOver(index)}
								onDrop={handleDrop(index)}
								onDragEnd={handleDragEnd}
								className={`bg-brand/10 flex cursor-move items-center gap-2 rounded-full border py-1 pr-1.5 pl-3 ${
									draggingIndex === index ? 'ring-brand/60 opacity-60 ring-1' : ''
								}`}>
								<span className='select-none'>{cat}</span>
								<button
									type='button'
									onClick={() => onRemoveCategory(cat)}
									className='text-secondary hover:text-brand inline-flex h-4 w-4 items-center justify-center'
									aria-label='Remove category'>
									<X className='h-3 w-3' />
								</button>
							</span>
						))
					)}
				</div>
				<div className='max-h-[360px] space-y-2 overflow-y-auto rounded-xl bg-white/60 p-3'>
					{editableItems.map(item => (
						<div key={item.slug} className='flex flex-col gap-2 rounded-lg border bg-white/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between'>
							<div className='text-sm font-medium'>
								{item.title || item.slug}
								<span className='text-secondary ml-2 text-xs'>{dayjs(item.date).format('YYYY-MM-DD')}</span>
							</div>
							<select
								value={item.category || ''}
								onChange={e => onAssignCategory(item.slug, e.target.value)}
								className='focus:border-brand rounded-lg border px-3 py-2 text-sm outline-none'>
								<option value=''>未分类</option>
								{categoryList.map(cat => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</select>
						</div>
					))}
					{editableItems.length === 0 && <div className='text-secondary text-sm'>暂无文章</div>}
				</div>
			</div>
		</DialogModal>
	)
}
