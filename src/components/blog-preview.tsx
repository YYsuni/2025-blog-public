'use client'

import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useSize } from '@/hooks/use-size'
import { BlogSidebar } from '@/components/blog-sidebar'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import type { BlogAttachment } from '@/app/blog/types'
import { formatBytes } from '@/lib/utils'

type BlogPreviewProps = {
	markdown: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	slug?: string
	attachments?: BlogAttachment[]
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug, attachments }: BlogPreviewProps) {
	const { maxSM: isMobile } = useSize()
	const { content, toc, loading } = useMarkdownRender(markdown)
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false
	const list = attachments?.filter(item => item?.url && item?.name) || []

	if (loading) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>渲染中...</div>
	}

	return (
		<div className='mx-auto flex max-w-[1140px] justify-center gap-6 px-6 pt-28 pb-12 max-sm:px-0'>
			<motion.article
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: INIT_DELAY }}
				className='card bg-article static flex-1 overflow-auto rounded-xl p-8'>
				<div>
					<div className='text-center text-2xl font-semibold'>{title}</div>

					<div className='text-secondary mt-4 flex flex-wrap items-center justify-center gap-3 px-8 text-center text-sm'>
						{tags.map(t => (
							<span key={t}>#{t}</span>
						))}
					</div>

					<div className='text-secondary mt-3 text-center text-sm'>{date}</div>

					{summary && summaryInContent && <div className='text-secondary mt-6 cursor-text text-center text-sm'>“{summary}”</div>}

					<div className='prose mt-6 max-w-none cursor-text'>{content}</div>

					{list.length > 0 && (
						<div className='mt-10 border-t pt-6'>
							<div className='mb-3 text-sm font-medium'>附件</div>
							<ul className='space-y-2'>
								{list.map(item => (
									<li key={`${item.url}-${item.name}`} className='flex items-center gap-3 text-sm'>
										<a href={item.url} download={item.name} target='_blank' rel='noreferrer' className='min-w-0 truncate underline-offset-2 hover:underline'>
											{item.name}
										</a>
										{typeof item.size === 'number' && item.size > 0 && <span className='text-secondary shrink-0 text-xs'>{formatBytes(item.size)}</span>}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</motion.article>

			{!isMobile && <BlogSidebar cover={cover} summary={summary} toc={toc} slug={slug} />}
		</div>
	)
}
