import { useCenterStore } from '@/hooks/use-center'
import GithubSVG from '@/svgs/github.svg'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { useConfigStore } from './stores/config-store'
import JuejinSVG from '@/svgs/juejin.svg'
import EmailSVG from '@/svgs/email.svg'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSize } from '@/hooks/use-size'

let delay = 100

export default function SocialButtons() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const { maxSM, init } = useSize()
	const styles = cardStyles.socialButtons
	const hiCardStyles = cardStyles.hiCard
	let order = styles.order
	if (maxSM && init) {
		order = 0
		delay = 0
	}
	const [show, setShow] = useState(false)
	const [secondaryShow, setSecondaryShow] = useState(false)
	const [tertiaryShow, setTertiaryShow] = useState(false)
	useEffect(() => {
		setTimeout(() => setShow(true), order * ANIMATION_DELAY * 1000)
		setTimeout(() => setSecondaryShow(true), order * ANIMATION_DELAY * 1000 + 1 * delay)
		setTimeout(() => setTertiaryShow(true), order * ANIMATION_DELAY * 1000 + 2 * delay)
	}, [order])

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING

	if (show)
		return (
			<motion.div className='absolute max-sm:static' animate={{ left: x, top: y }} initial={{ left: x, top: y }}>
				<div className='absolute top-0 right-0 flex items-center gap-3 max-sm:static'>
					{tertiaryShow && (
						<motion.a
							href='https://imibtc.com'
							target='_blank'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='font-averia flex items-center gap-2 rounded-xl border bg-[#070707] px-3 py-2 text-xl text-white'
							style={{ boxShadow: ' inset 0 0 12px rgba(255, 255, 255, 0.4)' }}>
							<GithubSVG />
							伊米博客
						</motion.a>
					)}

					{secondaryShow && (
						<motion.a
							href='https://www.imibtc.com/27.html'
							target='_blank'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='card relative flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium whitespace-nowrap'>
							<JuejinSVG className='h-6 w-6' />
							精品资源
						</motion.a>
					)}

					<motion.button
						onClick={() => {
							navigator.clipboard.writeText('yysuni1001@gmail.com').then(() => {
								toast.success('邮箱已复制到剪贴板')
							})
						}}
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='card btn relative rounded-xl p-1.5'>
						<EmailSVG />
					</motion.button>
				</div>
			</motion.div>
		)
	return null
}
