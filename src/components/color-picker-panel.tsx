'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { hexToHsva, hsvaToHex, hsvToHsl, clamp, toFixed } from '@/lib/color'

interface ColorPickerPanelProps {
	value: string
	onChange?: (color: string) => void
	style?: React.CSSProperties
	className?: string
}

const MOUSE_LEFT = 0

export function ColorPickerPanel({ value, onChange, style, className }: ColorPickerPanelProps) {
	const [show, setShow] = useState(false)
	const [hueOffset, setHueOffset] = useState(0)
	const [alphaOffset, setAlphaOffset] = useState(255)
	const [saturationOffset, setSaturationOffset] = useState(255)
	const [brightOffset, setBrightOffset] = useState(0)

	const hueRef = useRef<HTMLDivElement>(null)
	const pickerRef = useRef<HTMLDivElement>(null)
	const alphaRef = useRef<HTMLDivElement>(null)

	const [hueActive, setHueActive] = useState(false)
	const [alphaActive, setAlphaActive] = useState(false)
	const [saturationActive, setSaturationActive] = useState(false)
	const [brightActive, setBrightActive] = useState(false)

	const prevHexRef = useRef<string>(value)

	// Initialize from value (only once on mount)
	useEffect(() => {
		if (value) {
			const hsva = hexToHsva(value)
			prevHexRef.current = value
			// Use setTimeout to ensure refs are mounted
			setTimeout(() => {
				if (hueRef.current && pickerRef.current && alphaRef.current) {
					const hueWidth = hueRef.current.getBoundingClientRect().width
					const pickerWidth = pickerRef.current.getBoundingClientRect().width
					const pickerHeight = pickerRef.current.getBoundingClientRect().height
					const alphaWidth = alphaRef.current.getBoundingClientRect().width

					setHueOffset((hsva.h / 360) * hueWidth)
					setSaturationOffset(hsva.s * pickerWidth)
					setBrightOffset((1 - hsva.v) * pickerHeight)
					setAlphaOffset(hsva.a * alphaWidth)
					setShow(true)
				}
			}, 0)
		}
	}, [])

	const hue = useMemo(() => {
		if (hueRef.current) {
			const { width } = hueRef.current.getBoundingClientRect()
			return toFixed((hueOffset / width) * 360)
		}
		return 0
	}, [hueOffset, hueRef.current])

	const alpha = useMemo(() => {
		if (alphaRef.current) {
			const { width } = alphaRef.current.getBoundingClientRect()
			return clamp(toFixed(alphaOffset / width, 4), 0, 1)
		}
		return 1
	}, [alphaOffset, alphaRef.current])

	const saturation = useMemo(() => {
		if (pickerRef.current) {
			const { width } = pickerRef.current.getBoundingClientRect()
			return clamp(toFixed(saturationOffset / width, 4), 0, 1)
		}
		return 1
	}, [saturationOffset, pickerRef.current])

	const bright = useMemo(() => {
		if (pickerRef.current) {
			const { height } = pickerRef.current.getBoundingClientRect()
			return 1 - clamp(toFixed(brightOffset / height, 4), 0, 1)
		}
		return 0
	}, [brightOffset, pickerRef.current])

	const hsl = useMemo(() => {
		return hsvToHsl(hue, saturation, bright)
	}, [hue, saturation, bright])
	const hex = useMemo(() => hsvaToHex(hue, saturation, bright, alpha), [hue, saturation, bright, alpha])

	// Notify parent of color change
	useEffect(() => {
		if (onChange && hex && hex !== prevHexRef.current) {
			prevHexRef.current = hex
			onChange(hex)
		}
	}, [hex, onChange])

	// Handle mouse events
	useEffect(() => {
		const mousemoveHandler = (e: MouseEvent) => {
			if (hueActive && hueRef.current) {
				const { left, right, width } = hueRef.current.getBoundingClientRect()
				if (e.pageX < left) {
					setHueOffset(0)
				} else if (e.pageX > right) {
					setHueOffset(width)
				} else {
					setHueOffset(e.pageX - left)
				}
			}

			if (alphaActive && alphaRef.current) {
				const { left, right, width } = alphaRef.current.getBoundingClientRect()
				if (e.pageX < left) {
					setAlphaOffset(0)
				} else if (e.pageX > right) {
					setAlphaOffset(width)
				} else {
					setAlphaOffset(e.pageX - left)
				}
			}

			if ((saturationActive || brightActive) && pickerRef.current) {
				const { left, top, right, bottom, width, height } = pickerRef.current.getBoundingClientRect()

				if (saturationActive) {
					if (e.pageX < left) {
						setSaturationOffset(0)
					} else if (e.pageX > right) {
						setSaturationOffset(width)
					} else {
						setSaturationOffset(e.pageX - left)
					}
				}

				if (brightActive) {
					if (e.pageY < top) {
						setBrightOffset(0)
					} else if (e.pageY > bottom) {
						setBrightOffset(height)
					} else {
						setBrightOffset(e.pageY - top)
					}
				}
			}
		}

		const mouseupHandler = () => {
			setHueActive(false)
			setAlphaActive(false)
			setSaturationActive(false)
			setBrightActive(false)
		}

		if (hueActive || alphaActive || saturationActive || brightActive) {
			document.addEventListener('mousemove', mousemoveHandler)
			document.addEventListener('mouseup', mouseupHandler)
			document.addEventListener('mouseleave', mouseupHandler)
		}

		return () => {
			document.removeEventListener('mousemove', mousemoveHandler)
			document.removeEventListener('mouseup', mouseupHandler)
			document.removeEventListener('mouseleave', mouseupHandler)
		}
	}, [hueActive, alphaActive, saturationActive, brightActive])

	const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value

		// Support both #RRGGBB and #RRGGBBAA
		if (/^#[0-9A-Fa-f]{0,8}$/.test(inputValue)) {
			if ((inputValue.length === 7 || inputValue.length === 9) && onChange) {
				onChange(inputValue)
			}

			if (inputValue.length === 7 || inputValue.length === 9) {
				const hsva = hexToHsva(inputValue)
				if (hueRef.current && pickerRef.current && alphaRef.current) {
					const hueWidth = hueRef.current.getBoundingClientRect().width
					const pickerWidth = pickerRef.current.getBoundingClientRect().width
					const pickerHeight = pickerRef.current.getBoundingClientRect().height
					const alphaWidth = alphaRef.current.getBoundingClientRect().width

					setHueOffset((hsva.h / 360) * hueWidth)
					setSaturationOffset(hsva.s * pickerWidth)
					setBrightOffset((1 - hsva.v) * pickerHeight)
					setAlphaOffset(hsva.a * alphaWidth)
				}
			}
		}
	}

	return (
		<div
			data-color-picker-panel
			className={cn('w-56 rounded-lg border bg-white p-3 shadow-lg select-none', className, show ? 'opacity-100' : 'opacity-0')}
			style={style}>
			{/* Saturation and brightness picker */}
			<div
				ref={pickerRef}
				onMouseDown={e => {
					if (e.button === MOUSE_LEFT) {
						const { left, top, width, height } = pickerRef.current!.getBoundingClientRect()
						setSaturationOffset(clamp(e.pageX - left, 0, width))
						setBrightOffset(clamp(e.pageY - top, 0, height))
						setSaturationActive(true)
						setBrightActive(true)
					}
				}}
				className='relative h-32 w-full cursor-crosshair rounded-t-md'
				style={{
					backgroundColor: `hsl(${hue}, 100%, 50%)`,
					backgroundImage: 'linear-gradient(0deg, #000, transparent), linear-gradient(90deg, #fff, hsla(0, 0%, 100%, 0))'
				}}>
				<div
					className='absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-crosshair rounded-full border-2 border-white shadow-md'
					style={{
						backgroundColor: `hsl(${hsl.h} ${hsl.s * 100}% ${hsl.l * 100}%)`,
						left: saturationOffset,
						top: brightOffset
					}}
				/>
			</div>

			{/* Hue slider */}
			<div
				ref={hueRef}
				onMouseDown={e => {
					if (e.button === MOUSE_LEFT) {
						const { left, width } = hueRef.current!.getBoundingClientRect()
						setHueOffset(clamp(e.pageX - left, 0, width))
						setHueActive(true)
					}
				}}
				className='relative flex h-5 cursor-pointer items-center'
				style={{
					background:
						'linear-gradient(to right, rgb(255, 0, 0), rgb(255, 255, 0), rgb(0, 255, 0), rgb(0, 255, 255), rgb(0, 0, 255), rgb(255, 0, 255), rgb(255, 0, 0))'
				}}>
				<div
					className='absolute h-4 w-4 -translate-x-1/2 cursor-pointer rounded-full border-2 border-white shadow-md'
					style={{ backgroundColor: `hsl(${hue} 100% 50%)`, left: hueOffset }}
				/>
			</div>

			{/* Alpha slider */}
			<div
				style={{
					backgroundSize: '12px 12px',
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='12' height='12' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 12 0 L 0 0 0 12' fill='none' stroke='%23e5e7eb' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
				}}
				className='rounded-b-md'>
				<div
					ref={alphaRef}
					onMouseDown={e => {
						if (e.button === MOUSE_LEFT) {
							const { left, width } = alphaRef.current!.getBoundingClientRect()
							setAlphaOffset(clamp(e.pageX - left, 0, width))
							setAlphaActive(true)
						}
					}}
					className='relative flex h-5 cursor-pointer items-center'
					style={{
						background: `linear-gradient(to right, hsl(${hsl.h} ${hsl.s * 100}% ${hsl.l * 100}% / 0%), hsl(${hsl.h} ${hsl.s * 100}% ${hsl.l * 100}% / 100%))`
					}}>
					<div style={{ left: alphaOffset }} className='absolute h-4 w-4 -translate-x-1/2 cursor-pointer rounded-full border-2 border-white bg-white shadow-md'>
						<div className='h-full w-full rounded-full' style={{ backgroundColor: `hsl(${hsl.h} ${hsl.s * 100}% ${hsl.l * 100}% / ${alpha * 100}%)` }} />
					</div>
				</div>
			</div>

			{/* Hex input */}
			<input
				type='text'
				value={hex}
				onChange={handleHexInputChange}
				className='w-full rounded-md border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
				placeholder='#000000'
			/>
		</div>
	)
}
