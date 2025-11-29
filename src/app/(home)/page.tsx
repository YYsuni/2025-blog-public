'use client'

import HiCard from '@/app/(home)/hi-card'
import ArtCard from '@/app/(home)/art-card'
import ClockCard from '@/app/(home)/clock-card'
import CalendarCard from '@/app/(home)/calendar-card'
import MusicCard from '@/app/(home)/music-card'
import SocialButtons from '@/app/(home)/social-buttons'
import ShareCard from '@/app/(home)/share-card'
import AritcleCard from '@/app/(home)/aritcle-card'
import WriteButtons from '@/app/(home)/write-buttons'
import LikePosition from './like-position'
import { useSize } from '@/hooks/use-size'

export default function Home() {
	const { maxSM } = useSize()

	return (
		<div className='max-sm:flex max-sm:flex-col max-sm:items-center max-sm:gap-6 max-sm:pt-28 max-sm:pb-20'>
			<ArtCard />
			<HiCard />
			{!maxSM && <ClockCard />}
			{!maxSM && <CalendarCard />}
			{!maxSM && <MusicCard />}
			<SocialButtons />
			{!maxSM && <ShareCard />}
			<AritcleCard />
			{!maxSM && <WriteButtons />}
			<LikePosition />
		</div>
	)
}
