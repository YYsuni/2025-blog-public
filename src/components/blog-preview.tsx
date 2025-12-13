'use client'

import { motion } from 'motion/react'
import { INIT_DELAY } from '@/consts'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useSize } from '@/hooks/use-size'
import { BlogSidebar } from '@/components/blog-sidebar'
import { useConfigStore } from '@/app/(home)/stores/config-store'

type BlogPreviewProps = {
	markdown: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	slug?: string
}

export function BlogPreview({ markdown, title, tags, date, summary, cover, slug }: BlogPreviewProps) {
	const { maxSM: isMobile } = useSize()
	const { content, toc, loading } = useMarkdownRender(markdown)
	const { siteContent } = useConfigStore()
	const summaryInContent = siteContent.summaryInContent ?? false

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
				</div>
			</motion.article>

			{!isMobile && <BlogSidebar cover={cover} summary={summary} toc={toc} slug={slug} />}
		</div>
	)
}
