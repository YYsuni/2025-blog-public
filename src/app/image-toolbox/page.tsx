'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Download, ImagePlus, Loader2, Play, Trash2, X } from 'lucide-react'
import { INIT_DELAY } from '@/consts'
import { DialogModal } from '@/components/dialog-modal'
import { cn } from '@/lib/utils'

type OutputFormat = 'image/webp' | 'image/jpeg' | 'image/png'

const FORMATS: { value: OutputFormat; label: string; ext: string }[] = [
	{ value: 'image/webp', label: 'WEBP', ext: 'webp' },
	{ value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
	{ value: 'image/png', label: 'PNG', ext: 'png' }
]

type Result = { url: string; size: number; width: number; height: number; key: string }

type Item = {
	id: string
	file: File
	preview: string
	width: number
	height: number
	result?: Result
	errorKey?: string
}

function formatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function baseName(name: string) {
	return name.replace(/\.[^.]+$/, '')
}

async function convertImage(file: File, format: OutputFormat, quality: number, maxWidth: number | null) {
	const bitmap = await createImageBitmap(file)
	let { width, height } = bitmap
	if (maxWidth && width > maxWidth) {
		height = Math.round((height * maxWidth) / width)
		width = maxWidth
	}
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('无法初始化画布')
	if (format === 'image/jpeg') {
		// JPG 不支持透明，铺白底
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, width, height)
	}
	ctx.drawImage(bitmap, 0, 0, width, height)
	bitmap.close()
	const blob = await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(b => (b ? resolve(b) : reject(new Error('导出失败'))), format, quality)
	})
	return { blob, width, height }
}

function downloadUrl(url: string, filename: string) {
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	link.remove()
}

export default function Page() {
	const [items, setItems] = useState<Item[]>([])
	const [format, setFormat] = useState<OutputFormat>('image/webp')
	const [quality, setQuality] = useState(0.8)
	const [maxWidth, setMaxWidth] = useState<number | null>(null)
	const [processingId, setProcessingId] = useState<string | null>(null)
	const [compareId, setCompareId] = useState<string | null>(null)
	const [dragging, setDragging] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const itemsRef = useRef<Item[]>([])
	useEffect(() => {
		itemsRef.current = items
	}, [items])

	const ext = FORMATS.find(f => f.value === format)!.ext
	const lossless = format === 'image/png'

	const settingsKey = `${format}|${lossless ? 1 : quality}|${maxWidth ?? ''}`
	const [converting, setConverting] = useState(false)

	// 手动转换：只处理还没按当前设置转换过的图片
	const convertAll = useCallback(async () => {
		if (converting) return
		const key = settingsKey
		const [fmt, q, mw] = key.split('|')
		const targets = itemsRef.current.filter(it => it.result?.key !== key)
		if (!targets.length) return
		setConverting(true)
		let failed = 0
		for (const target of targets) {
			setProcessingId(target.id)
			try {
				const { blob, width, height } = await convertImage(target.file, fmt as OutputFormat, Number(q), mw ? Number(mw) : null)
				const url = URL.createObjectURL(blob)
				setItems(prev => {
					if (!prev.some(it => it.id === target.id)) {
						URL.revokeObjectURL(url)
						return prev
					}
					return prev.map(it => {
						if (it.id !== target.id) return it
						if (it.result) URL.revokeObjectURL(it.result.url)
						return { ...it, result: { url, size: blob.size, width, height, key }, errorKey: undefined }
					})
				})
			} catch (error) {
				console.error(error)
				failed++
				setItems(prev => prev.map(it => (it.id === target.id ? { ...it, errorKey: key } : it)))
			}
		}
		setProcessingId(null)
		setConverting(false)
		if (failed) toast.error(`${failed} 张图片转换失败`)
	}, [converting, settingsKey])

	const addFiles = useCallback(async (files: File[]) => {
		const images = files.filter(f => f.type.startsWith('image/'))
		if (!images.length) {
			if (files.length) toast.error('请选择图片文件')
			return
		}
		const added: Item[] = []
		for (const file of images) {
			const exists = itemsRef.current.some(it => it.file.name === file.name && it.file.size === file.size && it.file.lastModified === file.lastModified)
			if (exists) continue
			try {
				const bitmap = await createImageBitmap(file)
				added.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), width: bitmap.width, height: bitmap.height })
				bitmap.close()
			} catch {
				toast.error(`无法读取 ${file.name}，浏览器可能不支持该格式`)
			}
		}
		if (added.length) setItems(prev => [...prev, ...added])
	}, [])

	// 支持整页拖拽和 Ctrl+V 粘贴
	useEffect(() => {
		let depth = 0
		const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files')
		const onEnter = (e: DragEvent) => {
			if (!hasFiles(e)) return
			e.preventDefault()
			depth++
			setDragging(true)
		}
		const onOver = (e: DragEvent) => {
			if (hasFiles(e)) e.preventDefault()
		}
		const onLeave = (e: DragEvent) => {
			if (!hasFiles(e)) return
			depth = Math.max(0, depth - 1)
			if (depth === 0) setDragging(false)
		}
		const onDrop = (e: DragEvent) => {
			if (!hasFiles(e)) return
			e.preventDefault()
			depth = 0
			setDragging(false)
			void addFiles(Array.from(e.dataTransfer?.files ?? []))
		}
		const onPaste = (e: ClipboardEvent) => {
			const files = Array.from(e.clipboardData?.files ?? [])
			if (files.length) void addFiles(files)
		}
		window.addEventListener('dragenter', onEnter)
		window.addEventListener('dragover', onOver)
		window.addEventListener('dragleave', onLeave)
		window.addEventListener('drop', onDrop)
		window.addEventListener('paste', onPaste)
		return () => {
			window.removeEventListener('dragenter', onEnter)
			window.removeEventListener('dragover', onOver)
			window.removeEventListener('dragleave', onLeave)
			window.removeEventListener('drop', onDrop)
			window.removeEventListener('paste', onPaste)
		}
	}, [addFiles])

	useEffect(() => {
		return () => {
			itemsRef.current.forEach(it => {
				URL.revokeObjectURL(it.preview)
				if (it.result) URL.revokeObjectURL(it.result.url)
			})
		}
	}, [])

	const removeItem = useCallback((id: string) => {
		setItems(prev => {
			const target = prev.find(it => it.id === id)
			if (target) {
				URL.revokeObjectURL(target.preview)
				if (target.result) URL.revokeObjectURL(target.result.url)
			}
			return prev.filter(it => it.id !== id)
		})
	}, [])

	const clearAll = useCallback(() => {
		itemsRef.current.forEach(it => {
			URL.revokeObjectURL(it.preview)
			if (it.result) URL.revokeObjectURL(it.result.url)
		})
		setItems([])
	}, [])

	const isDone = (it: Item) => it.result?.key === settingsKey
	const doneItems = items.filter(isDone)
	const allDone = items.length > 0 && doneItems.length === items.length

	const downloadAll = useCallback(async () => {
		for (const it of doneItems) {
			downloadUrl(it.result!.url, `${baseName(it.file.name)}.${ext}`)
			// 浏览器会拦截过快的连续下载
			await new Promise(r => setTimeout(r, 200))
		}
	}, [doneItems, ext])

	const summary = useMemo(() => {
		const before = doneItems.reduce((acc, it) => acc + it.file.size, 0)
		const after = doneItems.reduce((acc, it) => acc + it.result!.size, 0)
		return { before, after, saved: before > 0 ? Math.round((1 - after / before) * 100) : 0 }
	}, [doneItems])

	const compareItem = items.find(it => it.id === compareId && it.result)

	return (
		<div className='relative px-6 pt-28 pb-16 text-sm max-sm:pt-24'>
			<input
				ref={inputRef}
				type='file'
				accept='image/*'
				multiple
				className='hidden'
				onChange={e => {
					void addFiles(Array.from(e.target.files ?? []))
					e.target.value = ''
				}}
			/>

			<div className='mx-auto flex max-w-3xl flex-col gap-4'>
				<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: INIT_DELAY }} className='mb-2 text-center'>
					<h1 className='text-2xl font-semibold'>图片压缩转换</h1>
					<p className='text-secondary mt-1'>全部在浏览器本地完成，图片不会上传</p>
				</motion.div>

				{/* 设置 */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: INIT_DELAY }}
					className='card relative flex flex-wrap items-center gap-x-6 gap-y-4'>
					<div className='flex items-center gap-2'>
						<span className='text-secondary text-xs'>格式</span>
						<div className='flex rounded-xl bg-white/60 p-1'>
							{FORMATS.map(f => (
								<button
									key={f.value}
									onClick={() => setFormat(f.value)}
									className={cn(
										'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
										format === f.value ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand'
									)}>
									{f.label}
								</button>
							))}
						</div>
					</div>

					<div className={cn('flex min-w-[200px] flex-1 items-center gap-3', lossless && 'pointer-events-none opacity-40')}>
						<span className='text-secondary shrink-0 text-xs'>质量</span>
						<input
							type='range'
							min={0.1}
							max={1}
							step={0.05}
							value={quality}
							disabled={lossless}
							onChange={e => setQuality(parseFloat(e.target.value))}
							className='range-track'
						/>
						<span className='w-10 text-right text-xs font-medium'>{lossless ? '无损' : `${Math.round(quality * 100)}%`}</span>
					</div>

					<WidthPicker value={maxWidth} onChange={setMaxWidth} />
				</motion.div>

				{/* 上传区 */}
				<motion.button
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: INIT_DELAY }}
					onClick={() => inputRef.current?.click()}
					className={cn(
						'card relative flex w-full items-center justify-center gap-3 border-2 border-dashed text-center transition-colors hover:border-brand/40 hover:bg-white/80',
						items.length ? 'py-4' : 'flex-col py-14',
						dragging && 'border-brand bg-white/80'
					)}>
					<ImagePlus className={cn('text-brand', items.length ? 'h-5 w-5' : 'h-10 w-10')} />
					<div>
						<p className='font-medium'>{items.length ? '继续添加图片' : '点击选择、拖入或粘贴图片'}</p>
						{!items.length && <p className='text-secondary mt-1 text-xs'>支持 PNG / JPG / WEBP / GIF 等，可多选</p>}
					</div>
				</motion.button>

				{/* 列表 */}
				{items.length > 0 && (
					<div className='card relative overflow-hidden p-0'>
						<div className='flex items-center justify-between gap-3 border-b px-7 py-4'>
							<div className='text-secondary text-xs'>
								{converting ? (
									<>
										正在转换 {doneItems.length + 1} / {items.length}
									</>
								) : allDone ? (
									<>
										{items.length} 张 · {formatBytes(summary.before)} → <span className='text-primary font-medium'>{formatBytes(summary.after)}</span>
										<span className={cn('ml-2 font-medium', summary.saved >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
											{summary.saved >= 0 ? `-${summary.saved}%` : `+${-summary.saved}%`}
										</span>
									</>
								) : (
									<>
										共 {items.length} 张，{items.length - doneItems.length} 张待转换
									</>
								)}
							</div>
							<div className='flex items-center gap-2'>
								<button
									onClick={clearAll}
									disabled={converting}
									className='text-secondary rounded-lg px-3 py-1.5 text-xs transition-colors hover:text-rose-500 disabled:opacity-50'>
									清空
								</button>
								{allDone ? (
									<button onClick={downloadAll} className='brand-btn gap-1 px-4 py-1.5 text-xs'>
										<Download className='h-3.5 w-3.5' />
										全部下载
									</button>
								) : (
									<button onClick={convertAll} disabled={converting} className='brand-btn gap-1 px-4 py-1.5 text-xs disabled:opacity-60'>
										{converting ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Play className='h-3.5 w-3.5' />}
										{converting ? '转换中' : '开始转换'}
									</button>
								)}
							</div>
						</div>

						<ul className='divide-y'>
							{items.map(it => {
								const done = isDone(it)
								const busy = processingId === it.id
								const stale = !!it.result && !done
								const failed = it.errorKey === settingsKey
								const saved = done ? Math.round((1 - it.result!.size / it.file.size) * 100) : 0
								return (
									<li key={it.id} className='group flex items-center gap-4 px-7 py-3'>
										<button
											onClick={() => done && setCompareId(it.id)}
											disabled={!done}
											title={done ? '点击对比' : undefined}
											className='h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-white/60 enabled:cursor-zoom-in'>
											<img src={it.preview} alt={it.file.name} className='h-full w-full object-cover' />
										</button>

										<div className='min-w-0 flex-1'>
											<p className='truncate font-medium'>{it.file.name}</p>
											<p className='text-secondary mt-0.5 text-xs'>
												{formatBytes(it.file.size)}
												{done && (
													<>
														{' → '}
														<span className='text-primary'>{formatBytes(it.result!.size)}</span>
														<span className={cn('ml-1.5', saved >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
															{saved >= 0 ? `-${saved}%` : `+${-saved}%`}
														</span>
													</>
												)}
												<span className='ml-2 opacity-70'>
													{done && (it.result!.width !== it.width || it.result!.height !== it.height)
														? `${it.width}×${it.height} → ${it.result!.width}×${it.result!.height}`
														: `${it.width}×${it.height}`}
												</span>
											</p>
										</div>

										<div className='flex shrink-0 items-center gap-1'>
											{busy ? (
												<Loader2 className='text-brand m-2 h-4 w-4 animate-spin' />
											) : failed ? (
												<span className='px-2 text-xs text-rose-500'>失败</span>
											) : done ? (
												<button
													onClick={() => downloadUrl(it.result!.url, `${baseName(it.file.name)}.${ext}`)}
													title='下载'
													className='text-brand hover:bg-brand/10 rounded-lg p-2 transition-colors'>
													<Download className='h-4 w-4' />
												</button>
											) : (
												<span className='text-secondary px-2 text-xs'>{stale ? '设置已改' : '待转换'}</span>
											)}
											<button onClick={() => removeItem(it.id)} title='移除' className='text-secondary rounded-lg p-2 transition-colors hover:bg-rose-50 hover:text-rose-500'>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
									</li>
								)
							})}
						</ul>
					</div>
				)}
			</div>

			{dragging && (
				<div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm'>
					<div className='border-brand text-brand rounded-2xl border-2 border-dashed bg-white/80 px-10 py-8 text-base font-medium'>松开以添加图片</div>
				</div>
			)}

			<DialogModal open={!!compareItem} onClose={() => setCompareId(null)}>
				{compareItem && <CompareView item={compareItem} label={FORMATS.find(f => f.value === format)!.label} onClose={() => setCompareId(null)} />}
			</DialogModal>
		</div>
	)
}

const WIDTH_PRESETS = [2560, 1920, 1280, 800]

function WidthPicker({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
	const isPreset = value === null || WIDTH_PRESETS.includes(value)
	const [custom, setCustom] = useState(!isPreset)
	const [draft, setDraft] = useState(!isPreset && value ? String(value) : '')

	const commit = (text: string) => {
		const v = parseInt(text)
		if (Number.isFinite(v) && v > 0) onChange(v)
	}

	const chip = (active: boolean) =>
		cn('rounded-lg px-2.5 py-1 text-xs font-medium transition-colors', active ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand')

	return (
		<div className='flex items-center gap-2'>
			<span className='text-secondary text-xs'>最大宽度</span>
			<div className='flex items-center rounded-xl bg-white/60 p-1'>
				<button
					className={chip(!custom && value === null)}
					onClick={() => {
						setCustom(false)
						onChange(null)
					}}>
					原尺寸
				</button>
				{WIDTH_PRESETS.map(w => (
					<button
						key={w}
						className={chip(!custom && value === w)}
						onClick={() => {
							setCustom(false)
							onChange(w)
						}}>
						{w}
					</button>
				))}
				{custom ? (
					<span className='bg-brand/10 ml-0.5 flex items-center rounded-lg pr-2'>
						<input
							autoFocus
							inputMode='numeric'
							value={draft}
							placeholder='宽度'
							onChange={e => {
								const text = e.target.value.replace(/\D/g, '').slice(0, 5)
								setDraft(text)
								commit(text)
							}}
							onBlur={() => !draft && (setCustom(false), onChange(null))}
							className='text-brand w-14 bg-transparent px-2 py-1 text-xs font-medium outline-none'
						/>
						<span className='text-brand/70 text-xs'>px</span>
					</span>
				) : (
					<button className={chip(false)} onClick={() => setCustom(true)}>
						自定义
					</button>
				)}
			</div>
		</div>
	)
}

function CompareView({ item, label, onClose }: { item: Item; label: string; onClose: () => void }) {
	const [pos, setPos] = useState(50)
	const ref = useRef<HTMLDivElement>(null)
	const draggingRef = useRef(false)

	const update = (e: ReactPointerEvent) => {
		const rect = ref.current?.getBoundingClientRect()
		if (!rect) return
		setPos(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)))
	}

	return (
		<div className='flex flex-col items-center gap-3' onClick={e => e.stopPropagation()}>
			<div className='text-secondary flex w-full items-center justify-between gap-6 text-xs'>
				<span>原图 · {formatBytes(item.file.size)}</span>
				<span>拖动滑块对比</span>
				<span>
					{label} · {formatBytes(item.result!.size)}
				</span>
			</div>
			<div
				ref={ref}
				onPointerDown={e => {
					draggingRef.current = true
					e.currentTarget.setPointerCapture(e.pointerId)
					update(e)
				}}
				onPointerMove={e => draggingRef.current && update(e)}
				onPointerUp={() => (draggingRef.current = false)}
				className='relative cursor-ew-resize touch-none overflow-hidden rounded-xl bg-white select-none'
				style={{ aspectRatio: `${item.width} / ${item.height}`, maxHeight: '75vh', maxWidth: '90vw', height: `min(75vh, 90vw * ${item.height / item.width})` }}>
				<img src={item.result!.url} alt='converted' className='absolute inset-0 h-full w-full object-contain' draggable={false} />
				<img
					src={item.preview}
					alt='original'
					className='absolute inset-0 h-full w-full object-contain'
					style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
					draggable={false}
				/>
				<div className='absolute inset-y-0 w-0.5 bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)]' style={{ left: `${pos}%` }}>
					<div className='absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30 backdrop-blur' />
				</div>
			</div>
			<button onClick={onClose} className='text-secondary flex items-center gap-1 text-xs hover:text-primary'>
				<X className='h-3.5 w-3.5' /> 关闭 (Esc)
			</button>
		</div>
	)
}
