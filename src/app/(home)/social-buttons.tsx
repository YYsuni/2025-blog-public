import { useCenterStore } from '@/hooks/use-center'
import GithubSVG from '@/svgs/ym.svg'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { styles as hiCardStyles } from './hi-card'
import JuejinSVG from '@/svgs/juejin.svg'
import EmailSVG from '@/svgs/email.svg'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSize } from '@/hooks/use-size'

export const styles = {
	width: 315,
	height: 48,
	order: 6
}

let delay = 100

export default function SocialButtons() {
	const center = useCenterStore()
	const { maxSM, init } = useSize()
	if (maxSM && init) {
		styles.order = 0
		delay = 0
	}
	const [show, setShow] = useState(false)
	const [secondaryShow, setSecondaryShow] = useState(false)
	const [tertiaryShow, setTertiaryShow] = useState(false)
	useEffect(() => {
		setTimeout(() => setShow(true), styles.order * ANIMATION_DELAY * 1000)
		setTimeout(() => setSecondaryShow(true), styles.order * ANIMATION_DELAY * 1000 + 1 * delay)
		setTimeout(() => setTertiaryShow(true), styles.order * ANIMATION_DELAY * 1000 + 2 * delay)
	}, [])

	if (show)
		return (
			<motion.div
				className='absolute max-sm:static'
				animate={{ left: center.x + hiCardStyles.width / 2, top: center.y + hiCardStyles.height / 2 + CARD_SPACING }}
				initial={{ left: center.x + hiCardStyles.width / 2, top: center.y + hiCardStyles.height / 2 + CARD_SPACING }}>
				<div className='absolute top-0 right-0 flex items-center gap-3 max-sm:static'>
					{tertiaryShow && (
						<motion.a
							href='https://www.imibtc.com'
							target='_blank'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='card relative flex items-center gap-2 rounded-xl px-3 py-2.5 font-medium whitespace-nowrap'>
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
							资源库
						</motion.a>
					)}

					<motion.button
						onClick={() => {
							navigator.clipboard.writeText('hdxiaoke@126.com').then(() => {
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
