'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface DialogModalProps {
	open: boolean
	onClose: () => void
	children: ReactNode
	className?: string
	overlayClassName?: string
	disableCloseOnOverlay?: boolean
	lockScroll?: boolean
	closeOnEsc?: boolean
}

export function DialogModal({ open, onClose, children, className, disableCloseOnOverlay = false, lockScroll = true, closeOnEsc = true }: DialogModalProps) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (!lockScroll || !open) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [lockScroll, open])

	useEffect(() => {
		if (!closeOnEsc || !open) return
		const handler = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}
		window.addEventListener('keydown', handler)
		return () => {
			window.removeEventListener('keydown', handler)
		}
	}, [closeOnEsc, onClose, open])

	if (!mounted) return null

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className={'fixed inset-0 z-50 flex items-center justify-center bg-card p-4 backdrop-blur-xl'}
					onClick={disableCloseOnOverlay ? undefined : onClose}>
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						className={cn('static', className)}
						onClick={e => e.stopPropagation()}>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
