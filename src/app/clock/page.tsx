'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type TimerMode = 'stopwatch' | 'timer' | 'worldclock'

interface WorldClock {
    id: string
    timezone: string
    city: string
}

const DEFAULT_TIMEZONES: WorldClock[] = [
    { id: '1', timezone: 'Asia/Shanghai', city: '上海' },
    { id: '2', timezone: 'Asia/Tokyo', city: '东京' },
    { id: '3', timezone: 'Asia/Hong_Kong', city: '香港' },
    { id: '4', timezone: 'Asia/Singapore', city: '新加坡' },
    { id: '5', timezone: 'Asia/Dubai', city: '迪拜' },
    { id: '6', timezone: 'Europe/London', city: '伦敦' },
    { id: '7', timezone: 'Europe/Paris', city: '巴黎' },
    { id: '8', timezone: 'Europe/Moscow', city: '莫斯科' },
    { id: '9', timezone: 'America/New_York', city: '纽约' },
    { id: '10', timezone: 'America/Los_Angeles', city: '洛杉矶' },
    { id: '11', timezone: 'America/Chicago', city: '芝加哥' },
    { id: '12', timezone: 'Australia/Sydney', city: '悉尼' }
]

export default function ClockPage() {
    const [mode, setMode] = useState<TimerMode>('stopwatch')
    const [stopwatchTime, setStopwatchTime] = useState(0)
    const [timerTime, setTimerTime] = useState(0)
    const [timerInput, setTimerInput] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const [isRunning, setIsRunning] = useState(false)
    const [laps, setLaps] = useState<number[]>([])
    const [worldClocks, setWorldClocks] = useState<WorldClock[]>(DEFAULT_TIMEZONES)
    const [currentTime, setCurrentTime] = useState(new Date())
    const intervalRef = useRef<number | null>(null)
    const startTimeRef = useRef<number | null>(null)
    const pausedTimeRef = useRef<number>(0)
    const initialTimerTimeRef = useRef<number>(0)
    const stopwatchTimeRef = useRef<number>(0)
    const timerTimeRef = useRef<number>(0)

    // Sync refs with state
    stopwatchTimeRef.current = stopwatchTime
    timerTimeRef.current = timerTime

    // Update current time for world clock
    useEffect(() => {
        if (mode === 'worldclock') {
            const interval = setInterval(() => {
                setCurrentTime(new Date())
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [mode])

    useEffect(() => {
        if (isRunning) {
            const now = performance.now()
            if (startTimeRef.current === null) {
                startTimeRef.current = now
                if (mode === 'timer') {
                    initialTimerTimeRef.current = timerTimeRef.current
                }
            } else {
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

    const handleModeChange = (newMode: TimerMode) => {
        setMode(newMode)
        setIsRunning(false)
        startTimeRef.current = null
        pausedTimeRef.current = 0
        initialTimerTimeRef.current = 0

        if (newMode === 'stopwatch') {
            setTimerTime(0)
            setTimerInput({ hours: 0, minutes: 0, seconds: 0 })
        } else if (newMode === 'timer') {
            setStopwatchTime(0)
            setLaps([])
        } else if (newMode === 'worldclock') {
            setStopwatchTime(0)
            setTimerTime(0)
            setLaps([])
            setTimerInput({ hours: 0, minutes: 0, seconds: 0 })
        }
    }

    return (
        <div className='flex flex-col items-center px-6 pt-32 pb-12'>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='w-full max-w-[600px] space-y-8'>
                {/* Mode Selector */}
                <div className='card relative flex gap-4 rounded-xl p-2'>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeChange('stopwatch')}
                        className={cn(
                            `flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all`,
                            mode === 'stopwatch' ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand'
                        )}>
                        秒表
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeChange('timer')}
                        className={cn(
                            `flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all`,
                            mode === 'timer' ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand'
                        )}>
                        计时器
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeChange('worldclock')}
                        className={cn(
                            `flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all`,
                            mode === 'worldclock' ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand'
                        )}>
                        世界时钟
                    </motion.button>
                </div>

                {/* World Clock Mode */}
                {mode === 'worldclock' ? (
                    <div className='grid grid-cols-2 gap-4'>
                        {worldClocks.map((clock, index) => (
                            <motion.div
                                key={clock.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className='card relative p-5'>
                                <div className='space-y-2'>
                                    <h3 className='text-xl font-bold'>{clock.city}</h3>
                                    <div className='text-3xl font-bold tabular-nums'>
                                        {currentTime.toLocaleTimeString('zh-CN', {
                                            timeZone: clock.timezone,
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        })}
                                    </div>
                                    <div className='text-secondary text-xs'>
                                        {currentTime.toLocaleDateString('zh-CN', {
                                            timeZone: clock.timezone,
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short'
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='card relative p-4'>
                            <div className='bg-secondary/20 flex items-center justify-center rounded-4xl p-8'>
                                <TimeDisplay time={displayTime} key={mode} />
                            </div>
                        </motion.div>

                        {/* Timer Input with Scroll Picker */}
                        {mode === 'timer' && !isRunning && timerTime === 0 && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='card relative space-y-4'>
                                <div className='flex items-center justify-center gap-4'>
                                    <div className='flex flex-col items-center gap-2'>
                                        <label className='text-secondary text-xs'>时</label>
                                        <ScrollPicker
                                            value={timerInput.hours}
                                            onChange={hours => setTimerInput({ ...timerInput, hours })}
                                            max={23}
                                        />
                                    </div>
                                    <div className='text-secondary mt-8 text-2xl font-bold'>:</div>
                                    <div className='flex flex-col items-center gap-2'>
                                        <label className='text-secondary text-xs'>分</label>
                                        <ScrollPicker
                                            value={timerInput.minutes}
                                            onChange={minutes => setTimerInput({ ...timerInput, minutes })}
                                            max={59}
                                        />
                                    </div>
                                    <div className='text-secondary mt-8 text-2xl font-bold'>:</div>
                                    <div className='flex flex-col items-center gap-2'>
                                        <label className='text-secondary text-xs'>秒</label>
                                        <ScrollPicker
                                            value={timerInput.seconds}
                                            onChange={seconds => setTimerInput({ ...timerInput, seconds })}
                                            max={59}
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
                    </>
                )}
            </motion.div>
        </div>
    )
}

interface ScrollPickerProps {
    value: number
    onChange: (value: number) => void
    max: number
}

function ScrollPicker({ value, onChange, max }: ScrollPickerProps) {
    const [offset, setOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const [lastY, setLastY] = useState(0)
    const [velocity, setVelocity] = useState(0)
    const [lastTime, setLastTime] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number | null>(null)
    const velocityRef = useRef(0)
    const offsetRef = useRef(0)

    const itemHeight = 44
    const visibleItems = 5

    // 同步 ref 和 state
    velocityRef.current = velocity
    offsetRef.current = offset

    // 惯性滚动
    useEffect(() => {
        if (!isDragging && Math.abs(velocityRef.current) > 0.1) {
            const animate = () => {
                velocityRef.current *= 0.95 // 阻尼

                if (Math.abs(velocityRef.current) < 0.1) {
                    velocityRef.current = 0
                    // 对齐到最近的项
                    snapToNearest()
                    return
                }

                const newOffset = offsetRef.current + velocityRef.current
                setOffset(newOffset)
                animationRef.current = requestAnimationFrame(animate)
            }

            animationRef.current = requestAnimationFrame(animate)

            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
                }
            }
        }
    }, [isDragging, velocity])

    const snapToNearest = () => {
        const index = Math.round(-offsetRef.current / itemHeight)
        const snappedIndex = ((index % (max + 1)) + (max + 1)) % (max + 1)
        onChange(snappedIndex)
        setOffset(-snappedIndex * itemHeight)
        setVelocity(0)
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
        }
        setIsDragging(true)
        setStartY(e.clientY)
        setLastY(e.clientY)
        setLastTime(performance.now())
        setVelocity(0)
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return

        const currentY = e.clientY
        const currentTime = performance.now()
        const deltaY = currentY - lastY
        const deltaTime = currentTime - lastTime

        if (deltaTime > 0) {
            const newVelocity = deltaY / deltaTime * 16
            setVelocity(newVelocity)
        }

        const newOffset = offset + deltaY
        setOffset(newOffset)
        setLastY(currentY)
        setLastTime(currentTime)

        // 实时更新值
        const index = Math.round(-newOffset / itemHeight)
        const wrappedIndex = ((index % (max + 1)) + (max + 1)) % (max + 1)
        onChange(wrappedIndex)
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false)
        e.currentTarget.releasePointerCapture(e.pointerId)

        // 如果速度很小，直接对齐
        if (Math.abs(velocityRef.current) < 1) {
            snapToNearest()
        }
    }

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 1 : -1
        const newValue = (value + delta + (max + 1)) % (max + 1)
        onChange(newValue)
        setOffset(-newValue * itemHeight)
    }

    // 当外部值改变时，更新偏移
    useEffect(() => {
        if (!isDragging) {
            setOffset(-value * itemHeight)
        }
    }, [value, isDragging])

    // 渲染多个循环的项目
    const renderItems = () => {
        const items = []
        const totalItems = max + 1
        const repeatCount = 3 // 渲染3组以支持循环

        for (let repeat = 0; repeat < repeatCount; repeat++) {
            for (let i = 0; i <= max; i++) {
                const index = repeat * totalItems + i
                const yPosition = index * itemHeight + offset

                // 只渲染可见区域附近的项
                if (Math.abs(yPosition) < itemHeight * 10) {
                    const distance = Math.abs(yPosition / itemHeight)
                    const opacity = Math.max(0.2, 1 - distance * 0.3)
                    const scale = Math.max(0.7, 1 - distance * 0.15)

                    items.push(
                        <div
                            key={`${repeat}-${i}`}
                            className='absolute flex items-center justify-center w-full transition-all duration-100'
                            style={{
                                height: `${itemHeight}px`,
                                transform: `translateY(${yPosition + itemHeight * 2}px) scale(${scale})`,
                                opacity: opacity,
                                pointerEvents: 'none'
                            }}>
                            <span className='text-3xl font-bold tabular-nums'>{i.toString().padStart(2, '0')}</span>
                        </div>
                    )
                }
            }
        }

        return items
    }

    return (
        <div
            ref={containerRef}
            className='relative w-24 overflow-hidden rounded-xl border bg-white/60 backdrop-blur-sm select-none'
            style={{ height: `${itemHeight * visibleItems}px`, touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}>
            {/* 渐变遮罩 */}
            <div className='absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/90 via-white/50 to-transparent z-10 pointer-events-none' />
            <div className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 via-white/50 to-transparent z-10 pointer-events-none' />

            {/* 选中指示器 */}
            <div
                className='absolute inset-x-0 border-y-2 border-brand/20 bg-brand/5 pointer-events-none z-10'
                style={{
                    top: `${itemHeight * 2}px`,
                    height: `${itemHeight}px`
                }}
            />

            {/* 数字 */}
            <div className='relative w-full h-full' style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                {renderItems()}
            </div>
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
                d='M3.4564 47.7859C2.21509 49.1048 4.23823e-07 48.2263 6.6133e-07 46.4152L2.79423e-06 30.1501C3.00022e-06 28.5793 1.72791 27.6216 3.06 28.4541L3.39333 28.6625C3.9781 29.028 4.33334 29.6689 4.33333 30.3585L4.33333 46.061C4.33333 46.5705 4.13891 47.0607 3.78973 47.4317L3.4564 47.7859Z'
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
