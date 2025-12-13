'use client'

import { useMemo, useState } from 'react'
import { SvgComponent, svgItems } from '@/svgs/index'

export default function Page() {
	const [query, setQuery] = useState('')
	const [copiedKey, setCopiedKey] = useState<string | null>(null)

	const items = useMemo(
		() =>
			svgItems.map(({ key, Component }: { key: string; Component: SvgComponent }) => ({
				key,
				Component,
				label: key.replace(/^\.\//, '').replace(/\.svg$/, '')
			})),
		[]
	)

	const filteredItems = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return items
		return items.filter(i => i.label.toLowerCase().includes(q))
	}, [items, query])

	const toPascalCase = (input: string) => {
		return input
			.split(/[^a-zA-Z0-9]+/)
			.filter(Boolean)
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join('')
	}

	const handleCopy = async (label: string, key: string) => {
		try {
			const varName = `${toPascalCase(label)}SVG`
			const importCmd = `import ${varName} from '@/svgs/${label}.svg'`
			await navigator.clipboard.writeText(importCmd)
			setCopiedKey(key)
			window.setTimeout(() => setCopiedKey(null), 1500)
		} catch (_) {
			// no-op
		}
	}

	return (
		<div className='mx-auto max-w-5xl space-y-4 px-6 py-8'>
			<div className='flex items-center justify-between gap-3'>
				<h1 className='text-xl font-medium'>SVG Gallery</h1>
				<input
					type='text'
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder='Filter icons...'
					className='bg-background h-9 w-56 rounded-md border px-3 text-sm outline-none'
				/>
			</div>
			<div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
				{filteredItems.map(({ key, Component, label }: { key: string; Component: SvgComponent; label: string }) => (
					<button
						key={key}
						onClick={() => handleCopy(label, key)}
						title={'Click to copy import command'}
						type='button'
						className='bg-background group relative flex flex-col items-center rounded-md border p-3 text-left transition-colors hover:bg-slate-800/5'>
						<div className='flex h-12 items-center justify-center'>
							<Component className='h-8 w-8' />
						</div>
						<div title={label} className='text-muted-foreground mt-2 w-full overflow-hidden text-center text-xs break-all text-ellipsis whitespace-nowrap'>
							{label}
						</div>
						{copiedKey === key && (
							<span className='bg-foreground/90 text-background pointer-events-none absolute top-2 right-2 rounded px-1.5 py-0.5 text-[10px] font-medium'>
								Copied
							</span>
						)}
					</button>
				))}
			</div>
		</div>
	)
}
