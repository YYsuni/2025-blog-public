'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { INIT_DELAY } from '@/consts'
import ShortLineSVG from '@/svgs/short-line.svg'
import JuejinSVG from '@/svgs/juejin.svg'
import { useBlogIndex, type BlogIndexItem } from '@/hooks/use-blog-index'
import { useCategories } from '@/hooks/use-categories'
import { useReadArticles } from '@/hooks/use-read-articles'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { readFileAsText } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { saveBlogEdits } from './services/save-blog-edits'

type YearGroup = { year: string; items: BlogIndexItem[] }

function groupByYear(list: BlogIndexItem[]): YearGroup[] {
	const sorted = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	const groups: YearGroup[] = []
	for (const item of sorted) {
		const year = dayjs(item.date).format('YYYY')
		const last = groups[groups.length - 1]
		if (last?.year === year) last.items.push(item)
		else groups.push({ year, items: [item] })
	}
	return groups
}

export default function BlogPage() {
	const { items, loading } = useBlogIndex()
	const { categories } = useCategories()
	const { isRead } = useReadArticles()
	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const keyInputRef = useRef<HTMLInputElement>(null)
	const [editMode, setEditMode] = useState(false)
	const [editableItems, setEditableItems] = useState<BlogIndexItem[]>([])
	const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!editMode) setEditableItems(items)
	}, [items, editMode])

	const displayItems = editMode ? editableItems : items
	const groups = useMemo(() => groupByYear(displayItems), [displayItems])

	const selectedCount = selectedSlugs.size
	const allSelected = editableItems.length > 0 && selectedCount === editableItems.length

	const exitEditMode = useCallback(() => {
		setEditableItems(items)
		setSelectedSlugs(new Set())
		setEditMode(false)
	}, [items])

	const toggleSelect = useCallback((slugs: string[], select: boolean) => {
		setSelectedSlugs(prev => {
			const next = new Set(prev)
			slugs.forEach(slug => (select ? next.add(slug) : next.delete(slug)))
			return next
		})
	}, [])

	const handleDeleteSelected = useCallback(() => {
		if (selectedCount === 0) return
		setEditableItems(prev => prev.filter(item => !selectedSlugs.has(item.slug)))
		setSelectedSlugs(new Set())
	}, [selectedCount, selectedSlugs])

	const handleSave = useCallback(async () => {
		if (editableItems.length === items.length) {
			toast.info('没有需要保存的改动')
			return
		}
		try {
			setSaving(true)
			await saveBlogEdits(items, editableItems, categories || [])
			setEditMode(false)
			setSelectedSlugs(new Set())
		} catch (error: any) {
			console.error(error)
			toast.error(error?.message || '保存失败')
		} finally {
			setSaving(false)
		}
	}, [items, editableItems, categories])

	const handleSaveClick = useCallback(() => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}
		void handleSave()
	}, [handleSave, isAuth])

	const handlePrivateKeySelection = useCallback(
		async (file: File) => {
			try {
				setPrivateKey(await readFileAsText(file))
				toast.success('密钥导入成功，请再次点击保存')
			} catch (error) {
				console.error(error)
				toast.error('读取密钥失败')
			}
		},
		[setPrivateKey]
	)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!editMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setEditableItems(items)
				setEditMode(true)
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [editMode, items])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handlePrivateKeySelection(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='flex flex-col items-center gap-6 px-6 pt-24 pb-12'>
				{groups.map(group => {
					const slugs = group.items.map(it => it.slug)
					const groupAllSelected = slugs.every(slug => selectedSlugs.has(slug))

					return (
						<motion.section
							key={group.year}
							initial={{ opacity: 0, y: 12 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: INIT_DELAY / 2 }}
							className='card relative w-full max-w-[840px]'>
							<header className='mb-3 flex items-center justify-between gap-3'>
								<div className='flex items-baseline gap-3'>
									<h2 className='text-lg font-medium'>{group.year}</h2>
									<span className='text-secondary text-sm'>{group.items.length} 篇</span>
								</div>
								{editMode && (
									<button
										onClick={() => toggleSelect(slugs, !groupAllSelected)}
										className='text-secondary hover:text-brand text-xs transition-colors'>
										{groupAllSelected ? '取消全选' : '全选本年'}
									</button>
								)}
							</header>

							<div>
								{group.items.map(it => {
									const isSelected = selectedSlugs.has(it.slug)
									return (
										<Link
											href={`/blog/${it.slug}`}
											key={it.slug}
											onClick={event => {
												if (!editMode) return
												event.preventDefault()
												toggleSelect([it.slug], !isSelected)
											}}
											className={cn(
												'group flex min-h-10 items-center gap-3 py-3 transition-colors',
												editMode && 'rounded-lg px-2',
												editMode && (isSelected ? 'bg-brand/5' : 'hover:bg-white/60')
											)}>
											{editMode && (
												<span
													className={cn(
														'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
														isSelected ? 'border-brand bg-brand text-white' : 'border-[#D9D9D9] text-transparent'
													)}>
													<Check className='h-3 w-3' />
												</span>
											)}
											<span className='text-secondary w-[44px] shrink-0 text-sm font-medium'>{dayjs(it.date).format('MM-DD')}</span>
											<div className='relative flex h-2 w-2 items-center justify-center'>
												<div className='bg-secondary group-hover:bg-brand h-[5px] w-[5px] rounded-full transition-all group-hover:h-4'></div>
												<ShortLineSVG className='absolute bottom-4' />
											</div>
											<div className={cn('flex-1 truncate text-sm font-medium transition-all', !editMode && 'group-hover:text-brand group-hover:translate-x-2')}>
												{it.title || it.slug}
												{isRead(it.slug) && <span className='text-secondary ml-2 text-xs'>[已读]</span>}
											</div>
											<div className='flex flex-wrap items-center gap-2 max-sm:hidden'>
												{(it.tags || []).map(t => (
													<span key={t} className='text-secondary text-sm'>
														#{t}
													</span>
												))}
											</div>
										</Link>
									)
								})}
							</div>
						</motion.section>
					)
				})}

				{items.length > 0 && (
					<a
						href='https://juejin.cn/user/2427311675422382/posts'
						target='_blank'
						rel='noreferrer'
						className='card text-secondary hover:text-brand static inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs transition-colors'>
						<JuejinSVG className='h-4 w-4' />
						更多
					</a>
				)}

				{!loading && items.length === 0 &&<div className='text-secondary py-6 text-center text-sm'>暂无文章</div>}
				{loading && <div className='text-secondary py-6 text-center text-sm'>加载中...</div>}
			</div>

			<div className='absolute top-4 right-6 flex items-center gap-3 max-sm:hidden'>
				{editMode ? (
					<>
						<button onClick={exitEditMode} disabled={saving} className='rounded-xl border bg-white/60 px-5 py-2 text-sm'>
							取消
						</button>
						<button
							onClick={() => toggleSelect(editableItems.map(it => it.slug), !allSelected)}
							className='rounded-xl border bg-white/60 px-4 py-2 text-sm hover:bg-white/80'>
							{allSelected ? '取消全选' : '全选'}
						</button>
						<button
							onClick={handleDeleteSelected}
							disabled={selectedCount === 0}
							className='rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 disabled:opacity-50'>
							删除{selectedCount > 0 ? ` (${selectedCount})` : ''}
						</button>
						<button onClick={handleSaveClick} disabled={saving} className='brand-btn px-6'>
							{saving ? '保存中...' : isAuth ? '保存' : '导入密钥'}
						</button>
					</>
				) : (
					!hideEditButton && (
						<button
							onClick={() => {
								setEditableItems(items)
								setEditMode(true)
							}}
							className='bg-card rounded-xl border px-6 py-2 text-sm backdrop-blur-sm hover:bg-white/80'>
							编辑
						</button>
					)
				)}
			</div>
		</>
	)
}
