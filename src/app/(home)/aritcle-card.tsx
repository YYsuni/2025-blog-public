import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { styles as hiCardStyles } from './hi-card'
import { styles as socialButtonsStyles } from './social-buttons'
import { CARD_SPACING } from '@/consts'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useSize } from '@/hooks/use-size'

export const styles = {
	width: 266,
	order: 8
}

export default function ArticleCard() {
	const center = useCenterStore()
	const { items, loading } = useBlogIndex()
	const { maxSM, init } = useSize()
	
	// 获取最新的1篇文章
	const latestBlog = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

	// 在移动端使用比HiCard稍小的宽度
	const cardWidth = maxSM && init ? 320 : styles.width

	return (
		<Card
			order={styles.order}
			width={cardWidth}
			x={center.x + hiCardStyles.width / 2 - socialButtonsStyles.width - CARD_SPACING - styles.width}
			y={center.y + hiCardStyles.height / 2 + CARD_SPACING}
			className='space-y-2 max-sm:static'>
			<h2 className='text-secondary text-sm'>最新文章</h2>

			{loading ? (
			<div className='flex h-[60px] items-center justify-center'>
				<span className='text-secondary text-xs'>加载中...</span>
			</div>
		) : latestBlog ? (
			<Link 
				href={`/blog/${latestBlog.slug}`} 
				className='flex transition-opacity hover:opacity-80'
			>
				{latestBlog.cover ? (
					<img src={latestBlog.cover} alt='cover' className='mr-3 h-12 w-12 shrink-0 rounded-xl border object-cover' />
				) : (
					<div className='text-secondary mr-3 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/60'>+</div>
				)}
				<div className='flex-1 min-w-0'>
					<h3 className='line-clamp-1 text-sm font-medium'>{latestBlog.title || latestBlog.slug}</h3>
					{latestBlog.summary && <p className='text-secondary mt-1 line-clamp-3 text-xs'>{latestBlog.summary}</p>}
					<p className='text-secondary mt-3 text-xs'>{dayjs(latestBlog.date).format('YYYY/M/D')}</p>
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
