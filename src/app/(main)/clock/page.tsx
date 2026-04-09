'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type TimerMode = 'stopwatch' | 'timer'

export default function ClockPage() {
	const [mode, setMode] = useState<TimerMode>('stopwatch')
	const [stopwatchTime, setStopwatchTime] = useState(0)
	const [timerTime, setTimerTime] = useState(0)
	const [timerInput, setTimerInput] = useState({ hours: 0, minutes: 0, seconds: 0 })
	const [isRunning, setIsRunning] = useState(false)
	const [laps, setLaps] = useState<number[]>([])
	const intervalRef = useRef<number | null>(null)
	const startTimeRef = useRef<number | null>(null)
	const pausedTimeRef = useRef<number>(0)
	const initialTimerTimeRef = useRef<number>(0)
	const stopwatchTimeRef = useRef<number>(0)
	const timerTimeRef = useRef<number>(0)

	// Sync refs with state
	stopwatchTimeRef.current = stopwatchTime
	timerTimeRef.current = timerTime

	useEffect(() => {
		if (isRunning) {
			const now = performance.now()
			if (startTimeRef.current === null) {
				// Starting fresh
				startTimeRef.current = now
				if (mode === 'timer') {
					initialTimerTimeRef.current = timerTimeRef.current
				}
			} else {
				// Resuming from pause
				if (mode === 'stopwatch') {
					startTimeRef.current = now - pausedTimeRef.current
				} else {
					startTimeRef.current = now - (initialTimerTimeRef.current - timerTimeRef.current)
				}
			}

			const updateTime = () => {
				const currentTime = performance.now()
				const elapsed = currentTime - startTimeRef.current!

				if (mode === 'stopwatch') {
					setStopwatchTime(Math.floor(elapsed))
				} else {
					const remaining = initialTimerTimeRef.current - elapsed
					if (remaining <= 0) {
						setTimerTime(0)
						setIsRunning(false)
						startTimeRef.current = null
						return
					}
					setTimerTime(Math.floor(remaining))
				}

				intervalRef.current = requestAnimationFrame(updateTime)
			}

			intervalRef.current = requestAnimationFrame(updateTime)
		} else {
			if (intervalRef.current !== null) {
				cancelAnimationFrame(intervalRef.current)
				intervalRef.current = null
			}
			if (startTimeRef.current !== null) {
				if (mode === 'stopwatch') {
					pausedTimeRef.current = stopwatchTimeRef.current
				}
			}
		}

		return () => {
			if (intervalRef.current !== null) {
				cancelAnimationFrame(intervalRef.current)
			}
		}
	}, [isRunning, mode])

	const handleStartPause = () => {
		if (mode === 'timer' && timerTime === 0) {
			const totalMs = timerInput.hours * 3600000 + timerInput.minutes * 60000 + timerInput.seconds * 1000
			if (totalMs <= 0) return
			setTimerTime(totalMs)
			initialTimerTimeRef.current = totalMs
		}
		if (!isRunning) {
			startTimeRef.current = null
		}
		setIsRunning(prev => !prev)
	}

	const handleReset = () => {
		setIsRunning(false)
		startTimeRef.current = null
		pausedTimeRef.current = 0
		initialTimerTimeRef.current = 0
		if (mode === 'stopwatch') {
			setStopwatchTime(0)
			setLaps([])
		} else {
			setTimerTime(0)
			setTimerInput({ hours: 0, minutes: 0, seconds: 0 })
		}
	}

	const handleLap = () => {
		if (mode === 'stopwatch' && isRunning) {
			setLaps(prev => [stopwatchTime, ...prev])
		}
	}

	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60
		const milliseconds = Math.floor((ms % 1000) / 10)

		if (hours > 0) {
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
		}
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
	}

	const displayTime = mode === 'stopwatch' ? stopwatchTime : timerTime
	const canStart = mode === 'timer' ? timerTime > 0 || timerInput.hours > 0 || timerInput.minutes > 0 || timerInput.seconds > 0 : true

	return (
		<div className='flex flex-col items-center px-6 pt-32 pb-12'>
			<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='w-full max-w-[600px] space-y-8'>
				{/* Mode Selector */}
				<div className='card relative flex gap-4 rounded-xl p-2'>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => {
							setMode('stopwatch')
							setIsRunning(false)
							setTimerTime(0)
							setTimerInput({ hours: 0, minutes: 0, seconds: 0 })
							startTimeRef.current = null
							pausedTimeRef.current = 0
							initialTimerTimeRef.current = 0
						}}
						className={cn(
							`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all`,
							mode === 'stopwatch' ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand'
						)}>
						秒表
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => {
							setMode('timer')
							setIsRunning(false)
							setStopwatchTime(0)
							setLaps([])
							startTimeRef.current = null
							pausedTimeRef.current = 0
							initialTimerTimeRef.current = 0
						}}
						className={cn(
							`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all`,
							mode === 'timer' ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand'
						)}>
						计时器
					</motion.button>
				</div>

				<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='card relative p-4'>
					<div className='bg-secondary/20 flex items-center justify-center rounded-4xl p-8'>
						<TimeDisplay time={displayTime} key={mode} />
					</div>
				</motion.div>

				{/* Timer Input (only for timer mode when not running) */}
				{mode === 'timer' && !isRunning && timerTime === 0 && (
					<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='card relative space-y-4'>
						<div className='flex items-center justify-center gap-4'>
							<div className='flex flex-col items-center gap-2'>
								<label className='text-secondary text-xs'>时</label>
								<input
									type='number'
									min='0'
									max='23'
									value={timerInput.hours}
									onChange={e => setTimerInput({ ...timerInput, hours: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) })}
									className='no-spinner w-20 rounded-xl border bg-white/60 px-4 py-3 text-center text-2xl font-bold backdrop-blur-sm focus:bg-white/80'
								/>
							</div>
							<div className='text-secondary mt-8 text-2xl font-bold'>:</div>
							<div className='flex flex-col items-center gap-2'>
								<label className='text-secondary text-xs'>分</label>
								<input
									type='number'
									min='0'
									max='59'
									value={timerInput.minutes}
									onChange={e => setTimerInput({ ...timerInput, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
									className='no-spinner w-20 rounded-xl border bg-white/60 px-4 py-3 text-center text-2xl font-bold backdrop-blur-sm focus:bg-white/80'
								/>
							</div>
							<div className='text-secondary mt-8 text-2xl font-bold'>:</div>
							<div className='flex flex-col items-center gap-2'>
								<label className='text-secondary text-xs'>秒</label>
								<input
									type='number'
									min='0'
									max='59'
									value={timerInput.seconds}
									onChange={e => setTimerInput({ ...timerInput, seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
									className='no-spinner w-20 rounded-xl border bg-white/60 px-4 py-3 text-center text-2xl font-bold backdrop-blur-sm focus:bg-white/80'
								/>
							</div>
						</div>
					</motion.div>
				)}

				{/* Control Buttons */}
				<div className='flex items-center justify-center gap-4'>
					{mode === 'stopwatch' && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleLap}
							disabled={!isRunning}
							className='flex h-16 w-16 items-center justify-center rounded-full border bg-white/60 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50'>
							计次
						</motion.button>
					)}
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleStartPause}
						disabled={!canStart}
						className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
							isRunning ? 'bg-brand-secondary hover:bg-brand-secondary/80' : 'bg-brand hover:bg-brand/80'
						}`}>
						{isRunning ? <Pause className='h-8 w-8' /> : <Play className='h-8 w-8' />}
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleReset}
						disabled={isRunning && mode === 'stopwatch'}
						className='flex h-16 w-16 items-center justify-center rounded-full border bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50'>
						<RotateCcw className='h-5 w-5' />
					</motion.button>
				</div>

				{mode === 'stopwatch' && laps.length > 0 && (
					<div className='grid grid-cols-3 gap-3'>
						{laps.map((lap, index) => (
							<motion.div
								layout
								initial={{ opacity: 0, scale: 0.6 }}
								animate={{ opacity: 1, scale: 1 }}
								key={lap}
								className='bg-card flex items-center justify-center rounded-2xl px-6 py-4'>
								<span className='font-mono text-sm font-medium'>
									<span className='text-secondary'>{laps.length - index}.</span> {formatTime(lap)}
								</span>
							</motion.div>
						))}
					</div>
				)}
			</motion.div>
		</div>
	)
}

interface TimeDisplayProps {
	time: number
}

function TimeDisplay({ time }: TimeDisplayProps) {
	const totalSeconds = Math.floor(time / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const milliseconds = Math.floor((time % 1000) / 10)

	const hoursStr = hours.toString().padStart(2, '0')
	const minutesStr = minutes.toString().padStart(2, '0')
	const secondsStr = seconds.toString().padStart(2, '0')
	const millisecondsStr = milliseconds.toString().padStart(2, '0')

	return (
		<div className='flex items-center justify-center gap-1.5'>
			{hours > 0 && (
				<>
					<SevenSegmentDigit value={parseInt(hoursStr[0])} />
					<SevenSegmentDigit value={parseInt(hoursStr[1])} />
					<Colon />
				</>
			)}
			<SevenSegmentDigit value={parseInt(minutesStr[0])} />
			<SevenSegmentDigit value={parseInt(minutesStr[1])} />
			<Colon />
			<SevenSegmentDigit value={parseInt(secondsStr[0])} />
			<SevenSegmentDigit value={parseInt(secondsStr[1])} />
			<Colon />
			<SevenSegmentDigit value={parseInt(millisecondsStr[0])} />
			<SevenSegmentDigit value={parseInt(millisecondsStr[1])} />
		</div>
	)
}

interface SevenSegmentDigitProps {
	value: number
	className?: string
}

function SevenSegmentDigit({ value, className }: SevenSegmentDigitProps) {
	const segmentMap = {
		0: [true, true, true, true, true, true, false],
		1: [false, true, true, false, false, false, false],
		2: [true, true, false, true, true, false, true],
		3: [true, true, true, true, false, false, true],
		4: [false, true, true, false, false, true, true],
		5: [true, false, true, true, false, true, true],
		6: [true, false, true, true, true, true, true],
		7: [true, true, true, false, false, false, false],
		8: [true, true, true, true, true, true, true],
		9: [true, true, true, true, false, true, true]
	}

	const segments = segmentMap[value as keyof typeof segmentMap] || segmentMap[0]
	const activeColor = 'var(--color-primary)'
	const inactiveColor = 'rgba(0, 0, 0, 0.05)'

	return (
		<svg width='29' height='52' viewBox='0 0 29 52' fill='none' xmlns='http://www.w3.org/2000/svg' className={className}>
			<path
				d='M4.20248 3.49482C2.82797 2.27303 3.69218 0 5.53121 0H22.6867C24.5522 0 25.4019 2.32821 23.975 3.52982L23.5791 3.86316C23.2186 4.16681 22.7623 4.33333 22.2909 4.33333H5.90621C5.41638 4.33333 4.94359 4.15358 4.57748 3.82815L4.20248 3.49482Z'
				fill={segments[0] ? activeColor : inactiveColor}
			/>
			<path
				d='M3.85122 24.13C4.16644 23.936 4.5293 23.8333 4.89942 23.8333H23.3022C23.6503 23.8333 23.9923 23.9242 24.2945 24.0969L24.5862 24.2635C25.9298 25.0313 25.9298 26.9687 24.5862 27.7365L24.2945 27.9032C23.9923 28.0758 23.6503 28.1667 23.3022 28.1667H4.89942C4.5293 28.1667 4.16644 28.064 3.85122 27.87L3.58039 27.7033C2.31131 26.9224 2.31132 25.0777 3.58039 24.2967L3.85122 24.13Z'
				fill={segments[6] ? activeColor : inactiveColor}
			/>
			<path
				d='M3.06 23.5458C1.7279 24.3784 -8.31295e-08 23.4207 -1.47217e-07 21.8498L-8.06095e-07 5.69981C-8.77526e-07 3.94893 2.09055 3.04323 3.36788 4.24073L3.70121 4.55323C4.10452 4.93133 4.33333 5.45949 4.33333 6.01231L4.33333 21.6415C4.33333 22.3311 3.97809 22.972 3.39333 23.3375L3.06 23.5458Z'
				fill={segments[5] ? activeColor : inactiveColor}
			/>
			<path
				d='M24.8497 4.25654C26.1428 3.12502 28.1667 4.04338 28.1667 5.76169L28.1667 21.8498C28.1667 23.4207 26.4388 24.3784 25.1067 23.5458L24.7734 23.3375C24.1886 22.972 23.8334 22.3311 23.8334 21.6415L23.8334 6.05336C23.8334 5.47663 24.0823 4.92798 24.5163 4.54821L24.8497 4.25654Z'
				fill={segments[1] ? activeColor : inactiveColor}
			/>
			<path
				d='M23.9259 48.6321C25.1234 49.9094 24.2177 52 22.4669 52L5.69978 52C3.9489 52 3.04321 49.9094 4.24071 48.6321L4.55321 48.2988C4.9313 47.8955 5.45947 47.6667 6.01228 47.6667L22.1544 47.6667C22.7072 47.6667 23.2353 47.8955 23.6134 48.2988L23.9259 48.6321Z'
				fill={segments[3] ? activeColor : inactiveColor}
			/>
			<path
				d='M25.1862 28.489C26.5194 27.7391 28.1667 28.7025 28.1667 30.2322L28.1667 46.6299C28.1667 48.4117 26.0124 49.3041 24.7525 48.0441L24.4191 47.7108C24.0441 47.3357 23.8334 46.827 23.8334 46.2966L23.8334 30.4197C23.8334 29.6971 24.2231 29.0308 24.8528 28.6765L25.1862 28.489Z'
				fill={segments[2] ? activeColor : inactiveColor}
			/>
			<path
				d='M3.4564 47.7859C2.21509 49.1048 4.23823e-07 48.2263 6.6133e-07 46.4152L2.79423e-06 30.1501C3.00022e-06 28.5793 1.72791 27.6216 3.06 28.4541L3.39333 28.6625C3.9781 29.028 4.33334 29.6689 4.33334 30.3585L4.33333 46.061C4.33333 46.5705 4.13891 47.0607 3.78973 47.4317L3.4564 47.7859Z'
				fill={segments[4] ? activeColor : inactiveColor}
			/>
		</svg>
	)
}

function Colon({ className }: { className?: string }) {
	return (
		<div className={`flex flex-col justify-center gap-2 ${className}`}>
			<div className='bg-primary h-1.5 w-1.5' />
			<div className='bg-primary h-1.5 w-1.5' />
		</div>
	)
}
