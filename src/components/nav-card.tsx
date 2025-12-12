'use client'

import Card from '@/components/card'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import ScrollOutlineSVG from '@/svgs/scroll-outline.svg'
import ScrollFilledSVG from '@/svgs/scroll-filled.svg'
import TalksOutlineSVG from '@/svgs/talks-outline.svg'
import TalksFilledSVG from '@/svgs/talks-filled.svg'
import HomeFilledSVG from '@/svgs/home-filled.svg'
import HomeOutlineSVG from '@/svgs/home-outline.svg'
import AboutFilledSVG from '@/svgs/about-filled.svg'
import AboutOutlineSVG from '@/svgs/about-outline.svg'
import PicturesFilledSVG from '@/svgs/pictures-filled.svg'
import PicturesOutlineSVG from '@/svgs/pictures-outline.svg'
import WebsiteFilledSVG from '@/svgs/website-filled.svg'
import WebsiteOutlineSVG from '@/svgs/website-outline.svg'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { HomeDraggableLayer } from '@/app/(home)/home-draggable-layer'
import { useFullscreenStore } from '@/hooks/use-fullscreen'

// PC端导航列表
const pcList = [
	{
		icon: HomeOutlineSVG,
		iconActive: HomeFilledSVG,
		label: '主页',
		href: '/'
	},
	{
		icon: ScrollOutlineSVG,
		iconActive: ScrollFilledSVG,
		label: '近期文章',
		href: '/blog'
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于网站',
		href: '/about'
	},
	{
		icon: PicturesOutlineSVG,
		iconActive: PicturesFilledSVG,
		label: '相册',
		href: '/pictures'
	},
	{
		icon: WebsiteOutlineSVG,
		iconActive: WebsiteFilledSVG,
		label: '优秀博客',
		href: '/bloggers'
	}
]

// 移动端导航列表
const mobileList = [
	{
		icon: HomeOutlineSVG,
		iconActive: HomeFilledSVG,
		label: '主页',
		href: '/'
	},
	{
		icon: TalksOutlineSVG,
		iconActive: TalksFilledSVG,
		label: '说说',
		href: '/talks'
	},
	{
		icon: AboutOutlineSVG,
		iconActive: AboutFilledSVG,
		label: '关于网站',
		href: '/about'
	},
	{
		icon: PicturesOutlineSVG,
		iconActive: PicturesFilledSVG,
		label: '相册',
		href: '/pictures'
	},
	{
		icon: WebsiteOutlineSVG,
		iconActive: WebsiteFilledSVG,
		label: '优秀博客',
		href: '/bloggers'
	}
]

const extraSize = 8

export default function NavCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const [show, setShow] = useState(false)
	const { maxSM } = useSize()
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const { siteContent, cardStyles } = useConfigStore()
	const { isFullscreen } = useFullscreenStore()
	const styles = cardStyles.navCard
	const hiCardStyles = cardStyles.hiCard

	// 根据设备选择导航列表
	const list = maxSM ? mobileList : pcList

	const activeIndex = useMemo(() => {
		const currentList = maxSM ? mobileList : pcList
		const index = currentList.findIndex(item => pathname === item.href)
		return index >= 0 ? index : undefined
	}, [pathname, maxSM])

	useEffect(() => {
		setShow(true)
	}, [])

	let form = useMemo(() => {
		if (pathname == '/') return 'full'
		else if (pathname == '/write') return 'mini'
		else return 'icons'
	}, [pathname])
	if (maxSM) form = 'icons'

	const itemHeight = form === 'full' ? 52 : 28

	let position = useMemo(() => {
		if (form === 'full') {
			const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - hiCardStyles.width / 2 - styles.width - CARD_SPACING
			const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 - styles.height
			return { x, y }
		}

		return {
			x: 24,
			y: 16
		}
	}, [form, center, styles, hiCardStyles])

	const size = useMemo(() => {
		if (form === 'mini') return { width: 64, height: 64 }
		else if (form === 'icons') return { width: 340, height: 64 }
		else return { width: styles.width, height: styles.height }
	}, [form, styles])

	// 根据当前路由设置高亮
	useEffect(() => {
		if (activeIndex !== undefined) {
			setHoveredIndex(activeIndex)
		} else {
			setHoveredIndex(null)
		}
	}, [activeIndex])

	if (maxSM) position = { x: center.x - size.width / 2, y: 16 }

	if (show && !isFullscreen)
		return (
			<HomeDraggableLayer cardKey='navCard' x={position.x} y={position.y} width={styles.width} height={styles.height}>
				<Card
					order={styles.order}
					width={size.width}
					height={size.height}
					x={position.x}
					y={position.y}
					className={clsx(
						'overflow-hidden',
						form === 'mini' && 'p-3',
						form === 'icons' && 'flex items-center gap-6 p-3 !fixed z-50',
						maxSM && '!fixed z-50 !bg-white/60 !backdrop-blur-xl !border-white/40 !shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)]'
					)}>
					<Link className='flex items-center gap-3' href='/'>
						<div className={cn('relative', pathname === '/' && 'after:absolute after:inset-[-4px] after:rounded-full after:bg-gradient-to-br after:from-amber-200/60 after:to-orange-300/40 after:blur-md after:-z-10')}>
							<Image src='/images/avatar.png' alt='avatar' width={40} height={40} style={{ boxShadow: ' 0 12px 20px -5px #E2D9CE' }} className='rounded-full' />
						</div>
						{form === 'full' && <span className='font-averia mt-1 text-2xl leading-none font-medium'>{siteContent.meta.title}</span>}
						{form === 'full' && <span className='text-brand mt-2 text-xs font-medium'>(开发中)</span>}
					</Link>

					{(form === 'full' || form === 'icons') && (
						<>
							{form !== 'icons' && <div className='text-secondary mt-6 text-sm uppercase'>General</div>}

							<div className={cn('relative mt-2 space-y-2', form === 'icons' && 'mt-0 flex items-center gap-6 space-y-0')}>
								{hoveredIndex !== null && (
									<motion.div
										className={cn(
											'absolute max-w-[230px] rounded-full border',
											maxSM && 'bg-white/50 backdrop-blur-md border-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]'
										)}
										layoutId='nav-hover'
										initial={false}
										animate={
											form === 'icons'
												? {
														left: hoveredIndex * (itemHeight + 24) - extraSize,
														top: -extraSize,
														width: itemHeight + extraSize * 2,
														height: itemHeight + extraSize * 2
													}
												: { top: hoveredIndex * (itemHeight + 8), left: 0, width: '100%', height: itemHeight }
										}
										transition={{
											type: 'spring',
											stiffness: 400,
											damping: 30
										}}
										style={!maxSM ? { backgroundImage: 'linear-gradient(to right bottom, var(--color-border) 60%, var(--color-card) 100%)' } : undefined}
									/>
								)}

								{list.map((item, index) => (
									<Link
										key={item.href}
										href={item.href}
										className={cn('text-secondary text-md relative z-10 flex items-center gap-3 rounded-full px-5 py-3', form === 'icons' && 'p-0')}
										>
										<div className='flex h-7 w-7 items-center justify-center'>
											{hoveredIndex == index ? <item.iconActive className='text-brand absolute h-7 w-7' /> : <item.icon className='absolute h-7 w-7 text-gray-600' />}
										</div>
										{form !== 'icons' && <span className={clsx(index == hoveredIndex && 'text-primary font-medium')}>{item.label}</span>}
									</Link>
								))}
							</div>
						</>
					)}
				</Card>
			</HomeDraggableLayer>
		)
}
