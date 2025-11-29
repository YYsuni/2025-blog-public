import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useLatestBlog } from '@/hooks/use-blog-index'
import { styles as hiCardStyles } from './hi-card'
import { styles as socialButtonsStyles } from './social-buttons'
import { CARD_SPACING } from '@/consts'
import dayjs from 'dayjs'
import Link from 'next/link'

export const styles = {
	width: 266,
	order: 8
}

export default function ArticleCard() {
	const center = useCenterStore()
	const { blog, loading } = useLatestBlog()

	return (
		<Card
			order={styles.order}
			width={styles.width}
			x={center.x + hiCardStyles.width / 2 - socialButtonsStyles.width - CARD_SPACING - styles.width}
			y={center.y + hiCardStyles.height / 2 + CARD_SPACING}
			className='space-y-2 max-sm:static'>
			<h2 className='text-secondary text-sm'>最新文章</h2>

			{loading ? (
				<div className='flex h-[60px] items-center justify-center'>
					<span className='text-secondary text-xs'>加载中...</span>
				</div>
			) : blog ? (
				<Link href={`/blog/${blog.slug}`} className='flex transition-opacity hover:opacity-80'>
					{blog.cover ? (
						<img src={blog.cover} alt='cover' className='mr-3 h-12 w-12 shrink-0 rounded-xl border object-cover' />
					) : (
						<div className='text-secondary mr-3 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/60'>+</div>
					)}
					<div className='flex-1'>
						<h3 className='line-clamp-1 text-sm font-medium'>{blog.title || blog.slug}</h3>
						{blog.summary && <p className='text-secondary mt-1 line-clamp-3 text-xs'>{blog.summary}</p>}
						<p className='text-secondary mt-3 text-xs'>{dayjs(blog.date).format('YYYY/M/D')}</p>
					</div>
				</Link>
			) : (
				<div className='flex h-[60px] items-center justify-center'>
					<span className='text-secondary text-xs'>暂无文章</span>
				</div>
			)}
		</Card>
	)
}
