'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useCenterInit, useCenterStore } from '@/hooks/use-center'
import { Picture } from '../page'
import siteContent from '@/config/site-content.json'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'

interface RandomLayoutProps {
	pictures: Picture[]
	isEditMode?: boolean
	onDeleteSingle?: (pictureId: string, imageIndex: number | 'single') => void
	onDeleteGroup?: (picture: Picture) => void
}

type PositionedItem = {
	x: number
	y: number
	rotation: number
}

type OriginalSize = {
	width: number
	height: number
}

interface FloatingImageProps {
	url: string
	index: number
	groupIndex: number
	position: PositionedItem
	description?: string
	uploadedAt?: string
	pictureId: string
	imageIndex: number | 'single'
	isEditMode?: boolean
	onDeleteSingle?: (pictureId: string, imageIndex: number | 'single') => void
	onDeleteGroup?: () => void
}

type UrlItem = {
	url: string
	groupIndex: number
	description?: string
	uploadedAt?: string
	pictureId: string
	imageIndex: number | 'single'
}

const buildUrlList = (pictures: Picture[]): UrlItem[] => {
	const result: UrlItem[] = []

	for (const [index, picture] of pictures.entries()) {
		if (picture.image) {
			result.push({
				url: picture.image,
				groupIndex: index,
				description: picture.description,
				uploadedAt: picture.uploadedAt,
				pictureId: picture.id,
				imageIndex: 'single'
			})
		}

		if (picture.images && picture.images.length > 0) {
			result.push(
				...picture.images.map((url, imageIndex) => ({
					url,
					groupIndex: index,
					description: picture.description,
					uploadedAt: picture.uploadedAt,
					pictureId: picture.id,
					imageIndex: imageIndex
				}))
			)
		}
	}

	return result
}

let lastZIndex = 10
const TOP_Z_INDEX = 9999

const formatUploadedAt = (uploadedAt?: string) => {
	if (!uploadedAt) return ''
	const date = new Date(uploadedAt)
	if (Number.isNaN(date.getTime())) return uploadedAt

	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')

	return `${year}-${month}-${day} ${hours}:${minutes}`
}

const loadSavedOffset = (url: string): { x: number; y: number } => {
	try {
		const saved = localStorage.getItem(`picture-offset-${url}`)
		if (saved) {
			const parsed = JSON.parse(saved)
			return { x: parsed.x || 0, y: parsed.y || 0 }
		}
	} catch (error) {
		console.error('Failed to load saved offset:', error)
	}
	return { x: 0, y: 0 }
}

const saveOffset = (url: string, offset: { x: number; y: number }) => {
	try {
		localStorage.setItem(`picture-offset-${url}`, JSON.stringify(offset))
	} catch (error) {
		console.error('Failed to save offset:', error)
	}
}

const FloatingImage = ({
	url,
	index,
	groupIndex,
	position,
	description,
	uploadedAt,
	pictureId,
	imageIndex,
	isEditMode,
	onDeleteSingle,
	onDeleteGroup
}: FloatingImageProps) => {
	const { centerX, centerY } = useCenterStore()
	const { maxSM, init } = useSize()
	const bodyRef = useRef(document.body)
	const mouseDownTimeRef = useRef<number | null>(null)
	const [zIndex, setZIndex] = useState(index)
	const [show, setShow] = useState(false)
	const [dragOffset, setDragOffset] = useState(() => loadSavedOffset(url))

	useEffect(() => {
		setTimeout(() => {
			setShow(true)
		}, 200 * index)
	}, [])

	const [originalSize, setOriginalSize] = useState<OriginalSize | null>(null)

	const displaySize = useMemo(() => {
		if (!originalSize) {
			return { width: 200, height: 200 }
		}

		const ratio = originalSize.width / originalSize.height
		const minRatio = 2 / 3
		const maxRatio = 3 / 2
		const clampedRatio = Math.min(Math.max(ratio, minRatio), maxRatio)

		const baseWidth = 200

		return {
			width: baseWidth,
			height: baseWidth / clampedRatio
		}
	}, [originalSize])

	const zoomedSize = useMemo(() => {
		if (!originalSize) {
			return { width: 200, height: 200 }
		}

		if (typeof window === 'undefined') {
			return originalSize
		}

		const padding = 24
		const maxWidth = document.documentElement.clientWidth - padding * 2
		const maxHeight = document.documentElement.clientHeight - padding * 2

		const scale = Math.min(maxWidth / originalSize.width, maxHeight / originalSize.height, 1)

		return {
			width: originalSize.width * scale,
			height: originalSize.height * scale
		}
	}, [originalSize])

	const [isZoomed, setIsZoomed] = useState(false)
	const dragStartOffsetRef = useRef({ x: 0, y: 0 })

	if (!position || !show) return null

	return (
		<>
			{isZoomed && (
				<motion.div
					onClick={() => {
						setIsZoomed(false)
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					style={{ zIndex: TOP_Z_INDEX }}
					className='bg-card fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl'
				/>
			)}
			<motion.div
				drag={!isZoomed}
				dragConstraints={bodyRef}
				dragMomentum={false}
				onDragStart={() => {
					if (!isZoomed) {
						dragStartOffsetRef.current = { ...dragOffset }
					}
				}}
				onMouseDown={event => {
					lastZIndex = lastZIndex + 1
					setZIndex(lastZIndex)
					mouseDownTimeRef.current = event.timeStamp
				}}
				onMouseUp={event => {
					if (mouseDownTimeRef.current !== null) {
						const duration = event.timeStamp - mouseDownTimeRef.current
						if (duration <= 150) {
							if (!isZoomed) {
								setIsZoomed(true)
							} else if (maxSM) {
								setIsZoomed(false)
							}
						}
					}
					mouseDownTimeRef.current = null
				}}
				onDragEnd={(_, info) => {
					if (!isZoomed) {
						const newOffset = {
							x: dragStartOffsetRef.current.x + info.offset.x,
							y: dragStartOffsetRef.current.y + info.offset.y
						}
						setDragOffset(newOffset)
						saveOffset(url, newOffset)
					}
				}}
				initial={{
					width: displaySize.width,
					height: displaySize.height,
					borderWidth: 8,
					zIndex,
					left: centerX + position.x,
					top: centerY + position.y,
					rotate: position.rotation,
					scale: 0.6,
					opacity: 0,
					x: dragOffset.x,
					y: dragOffset.y
				}}
				animate={
					isZoomed
						? {
								zIndex: TOP_Z_INDEX,
								left: centerX,
								top: centerY,
								rotate: 0,
								scale: 1,
								opacity: 1,
								x: 0,
								y: 0,
								width: zoomedSize.width,
								height: zoomedSize.height,
								borderWidth: maxSM ? 12 : 24
							}
						: {
								zIndex,
								scale: 1,
								opacity: 1,
								left: centerX + position.x,
								top: centerY + position.y,
								rotate: position.rotation,
								x: dragOffset.x,
								y: dragOffset.y,
								width: displaySize.width,
								height: displaySize.height,
								borderWidth: 8
							}
				}
				transition={{ type: 'tween', ease: 'easeOut' }}
				className={cn(
					'pointer-events-auto absolute origin-center -translate-1/2 cursor-pointer shadow-xl transition-[scale]',
					!isEditMode && !isZoomed && 'hover:scale-105'
				)}>
				<motion.img
					src={url}
					onLoad={event => {
						const img = event.currentTarget
						setOriginalSize({ width: img.naturalWidth, height: img.naturalHeight })
					}}
					draggable={false}
					className={cn('h-full w-full object-cover select-none')}
				/>
				{isEditMode && !isZoomed && (
					<motion.button
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						onClick={e => {
							e.stopPropagation()
							onDeleteSingle?.(pictureId, imageIndex)
						}}
						onMouseUp={e => {
							e.stopPropagation()
						}}
						className='absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-105 hover:bg-red-600'
						style={{ zIndex: 1 }}>
						<svg xmlns='http://www.w3.org/2000/svg' className='h-3 w-3 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
						</svg>
					</motion.button>
				)}
			</motion.div>

			{isZoomed && description && (
				<motion.div
					drag
					dragConstraints={maxSM ? undefined : bodyRef}
					dragMomentum={false}
					className='fixed min-h-[150px] w-[200px] cursor-pointer p-6 shadow'
					style={{
						backgroundColor: siteContent.backgroundColors[groupIndex % siteContent.backgroundColors.length],
						zIndex: TOP_Z_INDEX + 1,
						right: maxSM ? 12 : centerX / 3,
						top: maxSM ? 12 : centerY
					}}
					initial={{ opacity: 0, scale: 0.4 }}
					animate={{ opacity: 1, scale: 1 }}>
					<div className='text-secondary mb-2 text-xs'>{formatUploadedAt(uploadedAt)}</div>
					<div className='text-sm'>{description}</div>
				</motion.div>
			)}
		</>
	)
}

// 基于唯一标识生成稳定的位置
// 使用 ref 存储稳定的位置映射
const positionCacheRef = new Map<string, PositionedItem>()
const getStablePosition = (uniqueId: string, width: number, height: number): PositionedItem => {
	// 如果已有缓存，直接返回
	if (positionCacheRef.has(uniqueId)) {
		return positionCacheRef.get(uniqueId)!
	}

	// 使用 uniqueId 的哈希值来生成稳定的索引
	let hash = 0
	for (let i = 0; i < uniqueId.length; i++) {
		const char = uniqueId.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32bit integer
	}
	const stableIndex = Math.abs(hash) % 10000

	const maxRadius = Math.min(width, height) / 2 - 100
	const goldenAngle = Math.PI * (3 - Math.sqrt(5))

	// 使用稳定索引来计算位置，而不是数组索引
	const t = (stableIndex % 1000) / 1000
	const radius = Math.pow(t, 0.8) * maxRadius
	const angle = stableIndex * goldenAngle

	const baseX = radius * Math.cos(angle)
	const baseY = radius * Math.sin(angle)

	// 使用 uniqueId 生成稳定的 jitter，确保每次都是相同的位置
	const jitterSeed = Math.abs(hash) % 1000
	const jitterRadius = 12
	const jitterX = (jitterSeed % (jitterRadius * 2)) - jitterRadius
	const jitterY = ((jitterSeed * 7) % (jitterRadius * 2)) - jitterRadius

	const rotation = ((jitterSeed * 13) % 60) - 30

	const position = {
		x: baseX + jitterX,
		y: baseY + jitterY,
		rotation
	}

	positionCacheRef.set(uniqueId, position)
	return position
}

export const RandomLayout = ({ pictures, isEditMode = false, onDeleteSingle, onDeleteGroup }: RandomLayoutProps) => {
	useCenterInit()
	const { width, height } = useCenterStore()
	const [show, setShow] = useState(false)

	useEffect(() => {
		setTimeout(() => {
			setShow(true)
		}, 1000)
	}, [])

	const urls = useMemo(() => buildUrlList(pictures), [pictures])

	const pictureMap = useMemo(() => {
		const map = new Map<string, Picture>()
		pictures.forEach(picture => {
			map.set(picture.id, picture)
		})
		return map
	}, [pictures])

	if (!urls.length || !width || !height) {
		return null
	}

	if (!show) return null

	lastZIndex = urls.length + 11

	return (
		<>
			{urls.map((item, index) => {
				const picture = pictureMap.get(item.pictureId)
				const uniqueId = item.url
				const position = getStablePosition(uniqueId, width, height)

				return (
					<FloatingImage
						key={uniqueId}
						url={item.url}
						index={index}
						groupIndex={item.groupIndex}
						position={position}
						description={item.description}
						uploadedAt={item.uploadedAt}
						pictureId={item.pictureId}
						imageIndex={item.imageIndex}
						isEditMode={isEditMode}
						onDeleteSingle={onDeleteSingle}
						onDeleteGroup={picture ? () => onDeleteGroup?.(picture) : undefined}
					/>
				)
			})}
		</>
	)
}
