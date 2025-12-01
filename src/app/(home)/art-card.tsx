import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { useRouter } from 'next/navigation'

export default function ArtCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const router = useRouter()
	const styles = cardStyles.artCard
	const hiCardStyles = cardStyles.hiCard

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - hiCardStyles.height / 2 - styles.height / 2 - CARD_SPACING

	const artImages = siteContent.artImages ?? []
	const currentId = siteContent.currentArtImageId
	const currentArt = (currentId ? artImages.find(item => item.id === currentId) : undefined) ?? artImages[0]
	const artUrl = currentArt?.url || '/images/art/cat.png'

	return (
		<Card className='-translate-1/2 p-2 max-sm:static max-sm:translate-0' order={styles.order} width={styles.width} height={styles.height} x={x} y={y}>
			<img onClick={() => router.push('/pictures')} src={artUrl} alt='wall art' className='h-full w-full rounded-[32px] object-cover' />
		</Card>
	)
}
