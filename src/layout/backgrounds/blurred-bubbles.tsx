import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import siteContent from '@/config/site-content.json'
import { makeNoise2D, rand } from './utils'

/**
 * Blurred Floating Circles Background
 * - Circles spawn with blue-noise-ish spacing
 * - Movement = Perlin/Simplex flow field + soft separation
 * - Coverage control: low-occupancy attraction prevents big empty holes
 * - Constrained to bottom band (e.g. 55%–100% height)
 */
export default function BlurredBubblesBackground({
	count = 6,
	colors = siteContent.backgroundColors,
	minRadius = 250,
	maxRadius = 400,
	bottomBandStart = 0.8,
	speed = 0.12,
	noiseScale = 0.0008,
	noiseTimeScale = 0.00015,
	targetFps = 6,
	debugFps = false,
	startDelayMs = 1500,
	regenerateKey = 0
}) {
	const ref = useRef<HTMLCanvasElement>(null)
	const noise = useRef(makeNoise2D())
	const animRef = useRef(0)

	useEffect(() => {
		const canvas = ref.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')!
		let width = (canvas.width = canvas.clientWidth)
		let height = (canvas.height = canvas.clientHeight)

		const DPR = Math.min(2, window.devicePixelRatio || 1)
		canvas.width = Math.floor(width * DPR)
		canvas.height = Math.floor(height * DPR)
		ctx.scale(DPR, DPR)

		const effectiveFps = Math.max(1, targetFps)

		// 1s debounce for resize observer
		let resizeTimer: number | null = null
		const handleResize: ResizeObserverCallback = () => {
			if (!canvas || !ctx) return
			const nextWidth = canvas.clientWidth
			const nextHeight = canvas.clientHeight
			if (nextWidth === width && nextHeight === height) return
			width = nextWidth
			height = nextHeight
			canvas.width = Math.floor(width * DPR)
			canvas.height = Math.floor(height * DPR)
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			ctx.scale(DPR, DPR)
			// Recompute occupancy grid on resize
			allocateGrid()
			draw()
		}
		const onResize: ResizeObserverCallback = (...args) => {
			if (resizeTimer !== null) window.clearTimeout(resizeTimer)
			resizeTimer = window.setTimeout(() => {
				handleResize(...args)
				resizeTimer = null
			}, 1000)
		}
		const ro = new ResizeObserver(onResize)
		ro.observe(canvas)

		// --- Occupancy grid (for coverage guidance) ---
		const gridCell = 80 // px
		let gridCols = 0,
			gridRows = 0,
			grid: Float32Array

		function allocateGrid() {
			gridCols = Math.max(1, Math.ceil(width / gridCell))
			gridRows = Math.max(1, Math.ceil(height / gridCell))
			grid = new Float32Array(gridCols * gridRows)
		}
		function stampOccupancy(x: number, y: number, r: number) {
			// Add a small amount to nearby cells so paths get balanced over time
			const c0 = Math.floor((x - r) / gridCell)
			const c1 = Math.floor((x + r) / gridCell)
			const r0 = Math.floor((y - r) / gridCell)
			const r1 = Math.floor((y + r) / gridCell)
			for (let cy = r0; cy <= r1; cy++) {
				for (let cx = c0; cx <= c1; cx++) {
					if (cx < 0 || cy < 0 || cx >= gridCols || cy >= gridRows) continue
					const idx = cy * gridCols + cx
					grid[idx] += 0.5 // weight
				}
			}
		}
		function lowestOccupancyTarget() {
			// Find the lowest occupancy cell inside the bottom band
			const startRow = Math.floor(gridRows * bottomBandStart)
			let bestIdx = startRow * gridCols
			let bestVal = Infinity
			for (let cy = startRow; cy < gridRows; cy++) {
				for (let cx = 0; cx < gridCols; cx++) {
					const idx = cy * gridCols + cx
					const v = grid[idx]
					if (v < bestVal) {
						bestVal = v
						bestIdx = idx
					}
				}
			}
			const ty = (Math.floor(bestIdx / gridCols) + 0.5) * gridCell
			const tx = ((bestIdx % gridCols) + 0.5) * gridCell
			return { tx, ty }
		}
		allocateGrid()

		// Poisson-ish initial placement to avoid clusters
		const bubbles: { x: number; y: number; r: number; color: string; vx: number; vy: number; jitter: number; blur: number }[] = []
		const minDist = Math.max(minRadius * 0.2, 80)
		const maxTries = 5000
		let tries = 0
		while (bubbles.length < count && tries < maxTries) {
			tries++
			const r = rand(minRadius, maxRadius)
			const x = rand(-r / 2, width + r / 2)
			const y = rand(height * bottomBandStart, height * 1.2)
			let ok = true
			for (let b of bubbles) {
				const dx = b.x - x
				const dy = b.y - y
				if (Math.hypot(dx, dy) < (b.r + r) * 0.6 || Math.hypot(dx, dy) < minDist) {
					ok = false
					break
				}
			}
			if (ok) {
				bubbles.push({
					x,
					y,
					r,
					color: colors[bubbles.length % colors.length | 0],
					vx: rand(-0.2, 0.2),
					vy: rand(-0.2, 0.2),
					jitter: rand(0.6, 1.2),
					blur: rand(200, 400)
				})
			}
		}
		// console.log('[bg] tries:', tries)
		// console.log('[bg] bubbles count:', bubbles.length)

		// --- Animation loop ---
		const FRAME_INTERVAL = 1000 / effectiveFps
		let lastTime = 0
		let accumulatedTime = 0
		let fpsCounter = 0
		let fpsStart = 0

		function updatePhysics(t: number) {
			const { tx, ty } = lowestOccupancyTarget()

			// Update physics
			for (let i = 0; i < bubbles.length; i++) {
				const b = bubbles[i]

				// 1) Flow field (smooth wandering)
				const n = noise.current(b.x * noiseScale, b.y * noiseScale + t * noiseTimeScale)
				const angle = n * Math.PI * 2
				const fx = Math.cos(angle) * speed * b.jitter
				const fy = Math.sin(angle) * speed * b.jitter

				// 2) Separation (avoid clumping)
				let sx = 0,
					sy = 0
				for (let j = 0; j < bubbles.length; j++)
					if (j !== i) {
						const o = bubbles[j]
						const dx = b.x - o.x
						const dy = b.y - o.y
						const d2 = dx * dx + dy * dy
						const minD = (b.r + o.r) * 0.4
						if (d2 < minD * minD && d2 > 0.001) {
							const d = Math.sqrt(d2)
							const push = (minD - d) / minD // 0..1
							sx += (dx / d) * push * 0.8
							sy += (dy / d) * push * 0.8
						}
					}

				// 3) Coverage bias (drift toward emptier cells)
				const dxT = tx - b.x
				const dyT = ty - b.y
				const dT = Math.hypot(dxT, dyT) + 1e-3
				const cx = (dxT / dT) * 0.05 // gentle
				const cy = (dyT / dT) * 0.05

				// 4) Vertical band constraint
				const bandMin = height * bottomBandStart
				const bandMax = height * 1.5
				let bx = 0,
					by = 0
				if (b.y < bandMin) by += (bandMin - b.y) * 0.01
				if (b.y > bandMax) by -= (b.y - bandMax) * 0.01

				// Combine forces
				b.vx += fx + sx + cx + bx
				b.vy += fy + sy + cy + by

				// Apply damping to prevent velocity accumulation
				const damping = 0.95
				b.vx *= damping
				b.vy *= damping

				// Velocity limits to prevent runaway motion
				const maxVel = 2
				const vel = Math.hypot(b.vx, b.vy)
				if (vel > maxVel) {
					b.vx = (b.vx / vel) * maxVel
					b.vy = (b.vy / vel) * maxVel
				}

				// Integrate
				b.x += b.vx
				b.y += b.vy

				// Soft wrap horizontally to avoid bunching at edges
				if (b.x < -b.r - b.blur / 3) b.x = width + b.r + b.blur / 3
				if (b.x > width + b.r + b.blur / 3) b.x = -b.r - b.blur / 3

				// Keep a little padding from exact edge vertically
				b.y = Math.min(Math.max(b.y, bandMin - b.r * 0.25), bandMax + b.r * 0.25)

				// Occupancy stamp
				stampOccupancy(b.x, b.y, b.r * 0.6)
			}
		}
		function draw() {
			for (const b of bubbles) {
				ctx.save()
				ctx.filter = `blur(${b.blur}px)`
				ctx.globalAlpha = 0.8
				ctx.beginPath()
				ctx.fillStyle = b.color
				ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
				ctx.fill()
				ctx.restore()
			}
		}

		function frame(t: number) {
			if (!ctx) return

			// Rate limiting
			{
				if (document.hidden) {
					animRef.current = requestAnimationFrame(frame)
					return
				}

				// Frame rate limiting
				const deltaTime = lastTime ? t - lastTime : 0
				lastTime = t
				accumulatedTime += deltaTime

				if (accumulatedTime < FRAME_INTERVAL) {
					animRef.current = requestAnimationFrame(frame)
					return
				}

				accumulatedTime = 0
			}

			ctx.clearRect(0, 0, width, height)

			updatePhysics(t)

			draw()

			// FPS measurement (optional)
			if (debugFps) {
				if (fpsStart === 0) fpsStart = t
				fpsCounter++
				if (t - fpsStart >= 1000) {
					// Log measured fps vs target
					// eslint-disable-next-line no-console
					console.log('[blurred-bubbles] fps=', fpsCounter, 'target=', effectiveFps)
					fpsCounter = 0
					fpsStart = t
				}
			}

			animRef.current = requestAnimationFrame(frame)
		}

		if (window.innerWidth < 640) {
			setTimeout(() => {
				animRef.current = requestAnimationFrame(frame)
			}, startDelayMs)
		}

		draw()

		return () => {
			cancelAnimationFrame(animRef.current)
			ro.disconnect()
			if (resizeTimer !== null) window.clearTimeout(resizeTimer)
		}
	}, [colors, regenerateKey])

	return (
		<motion.div
			animate={{ opacity: 1 }}
			initial={{ opacity: 0 }}
			transition={{ duration: 1 }}
			className='fixed inset-0 z-0 overflow-hidden'
			style={{ filter: 'blur(50px)' }}>
			<canvas ref={ref} className='h-full w-full' style={{ display: 'block' }} />
		</motion.div>
	)
}
