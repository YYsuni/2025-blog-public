'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { styles as hiCardStyles } from './hi-card'
import { styles as socialButtonsStyles } from './social-buttons'
import { CARD_SPACING } from '@/consts'
import shareList from '@/app/share/list.json'
import Link from 'next/link'
import { useSize } from '@/hooks/use-size'

export const styles = {
	width: 200,
	order: 7
}

type ShareItem = {
	name: string
	url: string
	logo: string
	description: string
	tags: string[]
	stars: number
}

export default function ShareCard() {
	const center = useCenterStore()
	const [randomItem, setRandomItem] = useState<ShareItem | null>(null)
	const { maxSM, init } = useSize()

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * shareList.length)
		setRandomItem(shareList[randomIndex])
	}, [])

	if (!randomItem) {
		return null
	}

	// 在移动端使用与HiCard相同的宽度
	const cardWidth = maxSM && init ? hiCardStyles.width : styles.width

	return (
		<Card
			order={styles.order}
			width={cardWidth}
			x={center.x + hiCardStyles.width / 2 - socialButtonsStyles.width}
			y={center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING}
			className='space-y-2 max-sm:static'>
			<h2 className='text-secondary text-sm'>随机分享</h2>

			<a href={randomItem.url} target='_blank' rel='noopener noreferrer' className='mt-2 block space-y-2'>
				<div className='flex items-center'>
					<div className='relative mr-3 h-12 w-12 shrink-0 overflow-hidden rounded-xl'>
						<img src={randomItem.logo} alt={randomItem.name} className='h-full w-full object-contain' />
					</div>
					<h3 className='text-sm font-medium'>{randomItem.name}</h3>
				</div>

				<p className='text-secondary line-clamp-3 text-xs'>{randomItem.description}</p>
			</a>
		</Card>
	)
}
