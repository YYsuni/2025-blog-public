'use client'

import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import displacement1 from './displacement-1.png'
import displacement2 from './displacement-2.png'
import borderImg from './border.png'
import { useEffect, useRef, useState } from 'react'

const width = 210
const height = 150

export default function LiquidGrass() {
	const bodyRef = useRef(document.body)
	const [show, setShow] = useState(false)

	useEffect(() => {
		setTimeout(() => {
			setShow(true)
		}, 1000)
	}, [])

	if (!show) return null

	return createPortal(
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			drag
			dragConstraints={bodyRef}
			style={{ width, height }}
			className='fixed top-16 right-1/2 z-90 select-none'
			whileTap={{
				scale: 1.1
			}}>
			<svg colorInterpolationFilters='sRGB' style={{ display: 'none' }}>
				<defs>
					<filter id='magnifying-glass-filter'>
						<feImage href={displacement1.src} x='0' y='0' width={width} height={height} result='magnifying_displacement_map' />
						<feDisplacementMap
							in='SourceGraphic'
							in2='magnifying_displacement_map'
							scale='24'
							xChannelSelector='R'
							yChannelSelector='G'
							result='magnified_source'
						/>
						<feGaussianBlur in='magnified_source' stdDeviation='0' result='blurred_source' />
						<feImage href={displacement2.src} x='0' y='0' width={width} height={height} result='displacement_map' />
						<feDisplacementMap in='blurred_source' in2='displacement_map' scale='80' xChannelSelector='R' yChannelSelector='G' result='displaced' />
						<feColorMatrix in='displaced' type='saturate' result='displaced_saturated' values='9'></feColorMatrix>
						<feImage href={borderImg.src} x='0' y='0' width={width} height={height} result='specular_layer'></feImage>
						<feComposite in='displaced_saturated' in2='specular_layer' operator='in' result='specular_saturated'></feComposite>
						<feComponentTransfer in='specular_layer' result='specular_faded'>
							<feFuncA type='linear' slope='0.5'></feFuncA>
						</feComponentTransfer>
						<feBlend in='specular_saturated' in2='displaced' mode='normal' result='withSaturation'></feBlend>
						<feBlend in='specular_faded' in2='withSaturation' mode='normal'></feBlend>
					</filter>
				</defs>
			</svg>

			<div
				className='absolute inset-0 rounded-full'
				style={{
					backdropFilter: 'url(#magnifying-glass-filter)',
					boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 9px, rgba(0, 0, 0, 0.05) 0px 2px 24px inset, rgba(255, 255, 255, 0.2) 0px -2px 24px inset'
				}}></div>
		</motion.div>,
		document.body
	)
}
