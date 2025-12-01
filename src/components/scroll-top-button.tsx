'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import TopSVG from '@/svgs/top.svg'
import { cn } from '@/lib/utils'

type ScrollTopButtonProps = {
	className?: string
	delay?: number
}

export function ScrollTopButton({ className, delay }: ScrollTopButtonProps) {
	const [show, setShow] = useState(false)
	const [active, setActive] = useState(false)
	useEffect(() => {
		setTimeout(() => setShow(true), delay || 1000)
	}, [delay])

	useEffect(() => {
		const handleScroll = () => {
			setActive(window.scrollY > 200)
		}
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	if (!show || !active) return null

	const handleClick = useCallback(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
		setTimeout(() => setActive(false), 1000)
	}, [])

	return (
		<motion.button
			initial={{ opacity: 0, scale: 0.4 }}
			animate={{ opacity: 1, scale: 1 }}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={handleClick}
			aria-label='Scroll to top'
			className={cn('card text-secondary static gap-2 rounded-full p-3 text-sm', className)}>
			<TopSVG className='w-7' />
		</motion.button>
	)
}
