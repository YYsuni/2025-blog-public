'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { ANIMATION_DELAY, INIT_DELAY } from '@/consts'
import LikeButton from '@/components/like-button'
import { BlogToc } from '@/components/blog-toc'
import { ScrollTopButton } from '@/components/scroll-top-button'

type TocItem = {
	id: string
	text: string
	level: number
}

type BlogSidebarProps = {
	cover?: string
	summary?: string
	toc: TocItem[]
	slug?: string
}
const offset = 72

export function BlogSidebar({ cover, summary, toc, slug }: BlogSidebarProps) {
	const [maxOffset, setMaxOffset] = useState(0)
	const { scrollY } = useScroll()

	useEffect(() => {
		if (typeof window === 'undefined') {
			return
		}

		const updateMaxOffset = () => {
			const maxScrollable = document.documentElement.scrollHeight - window.innerHeight

			const nextMaxOffset = Math.max(0, maxScrollable - offset)

			setMaxOffset(nextMaxOffset)
		}

		const timer = setTimeout(() => {
			updateMaxOffset()
		}, 5000)

		updateMaxOffset()
		window.addEventListener('resize', updateMaxOffset)

		return () => {
			window.removeEventListener('resize', updateMaxOffset)
			clearTimeout(timer)
		}
	}, [])

	const adjustedScrollY = useTransform(scrollY, value => {
		const adjusted = Math.max(0, value - offset)
		return Math.min(adjusted, maxOffset)
	})
	const sidebarY = useSpring(adjustedScrollY, {
		stiffness: 100,
		damping: 15,
		mass: 0.6,
		restDelta: 0.5
	})

	return (
		<motion.div className='relative flex w-[200px] shrink-0 flex-col items-start gap-4 self-start max-sm:hidden' style={{ y: sidebarY }}>
			{cover && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 1 }}
					className='w-full rounded-xl bg-white/40 p-3'>
					<img src={cover} alt='cover' className='h-auto w-full rounded-xl border object-cover' />
				</motion.div>
			)}

			{summary && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: INIT_DELAY + ANIMATION_DELAY * 2 }}
					className='w-full rounded-xl border bg-white/40 p-3 text-sm'>
					<h2 className='text-secondary mb-2 font-medium'>摘要</h2>
					<div className='text-secondary cursor-text'>{summary}</div>
				</motion.div>
			)}

			<BlogToc toc={toc} delay={INIT_DELAY + ANIMATION_DELAY * 3} />

			<LikeButton slug={slug} delay={(INIT_DELAY + ANIMATION_DELAY * 4) * 1000} />

			<ScrollTopButton delay={INIT_DELAY + ANIMATION_DELAY * 5} />
		</motion.div>
	)
}
