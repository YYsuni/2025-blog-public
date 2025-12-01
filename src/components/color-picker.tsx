'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { ColorPickerPanel } from './color-picker-panel'

interface ColorPickerProps {
	value?: string
	onChange?: (color: string) => void
	className?: string
}

export function ColorPicker({ value = '#000000', onChange, className }: ColorPickerProps) {
	const [open, setOpen] = useState(false)
	const [mounted, setMounted] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const [position, setPosition] = useState({ top: 0, left: 0 })

	useEffect(() => {
		setMounted(true)
	}, [])

	// Calculate position when opening
	useEffect(() => {
		if (open && triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect()
			setPosition({
				top: rect.top - 240,
				left: rect.left
			})
		}
	}, [open])

	// Close on outside click
	useEffect(() => {
		if (!open) return

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node
			if (triggerRef.current && !triggerRef.current.contains(target)) {
				const panel = document.querySelector('[data-color-picker-panel]')
				if (panel && !panel.contains(target)) {
					setOpen(false)
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [open])

	return (
		<>
			<button
				ref={triggerRef}
				type='button'
				onClick={() => setOpen(!open)}
				className={cn('h-10 w-10 rounded-lg border-2 border-white/20 shadow-sm transition-all hover:scale-105', className)}
				style={{ backgroundColor: value }}>
				<span className='sr-only'>Select color</span>
			</button>

			{mounted &&
				open &&
				position.top > 0 &&
				createPortal(
					<ColorPickerPanel
						value={value}
						onChange={onChange}
						style={{
							position: 'fixed',
							top: `${position.top}px`,
							left: `${position.left}px`,
							zIndex: 1000
						}}
					/>,
					document.body
				)}
		</>
	)
}
