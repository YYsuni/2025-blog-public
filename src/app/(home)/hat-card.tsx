import { ANIMATION_DELAY } from '@/consts'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useConfigStore } from './stores/config-store'
import { useCenterStore } from '@/hooks/use-center'
import { useSize } from '@/hooks/use-size'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function HatCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { maxSM } = useSize()
	const styles = cardStyles.hatCard

	const [show, setShow] = useState(false)
	const [number, setNumber] = useState(1)

	useEffect(() => {
		setTimeout(() => setShow(true), styles.order * ANIMATION_DELAY * 1000)
	}, [styles.order])

	const hatIndex = siteContent.currentHatIndex ?? 1
	const hatFlipped = siteContent.hatFlipped ?? false

	if (maxSM) return null

	if (!show) return null

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - styles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - styles.height

	return (
		<HomeDraggableLayer cardKey='hatCard' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div
				initial={{ opacity: 0, scale: 0.6, left: x, top: y, width: styles.width, height: styles.height }}
				animate={{ opacity: 1, scale: 1, left: x, top: y, width: styles.width, height: styles.height }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => setNumber(number + 1)}
				className='absolute flex h-full w-full items-center justify-center'>
				{new Array(number)
					.fill(0)
					.map((_, index) =>
						index === 0 ? (
							<img
								key={index}
								src={`/images/hats/${hatIndex}.webp`}
								alt='hat'
								className='h-full w-full object-contain'
								style={{ width: styles.width, height: styles.height, transform: hatFlipped ? 'scaleX(-1)' : 'none' }}
							/>
						) : (
							<img
								key={index}
								src={`/images/hats/${hatIndex}.webp`}
								alt='hat'
								className='absolute h-full w-full object-contain'
								style={{ width: styles.width, height: styles.height, transform: hatFlipped ? 'scaleX(-1)' : 'none', bottom: index * 16 }}
							/>
						)
					)}
			</motion.div>
		</HomeDraggableLayer>
	)
}
