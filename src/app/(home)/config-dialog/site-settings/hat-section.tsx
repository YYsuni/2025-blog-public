'use client'

import type { SiteContent } from '../../stores/config-store'

interface HatSectionProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
}

export function HatSection({ formData, setFormData }: HatSectionProps) {
	const currentHatIndex = formData.currentHatIndex ?? 1
	const hatCount = 24

	const handleSetHatIndex = (index: number) => {
		setFormData(prev => ({
			...prev,
			currentHatIndex: index
		}))
	}

	return (
		<div>
			<label className='mb-2 block text-sm font-medium'>帽子图片</label>
			<div className='grid grid-cols-6 gap-3 max-sm:grid-cols-4'>
				{Array.from({ length: hatCount }, (_, i) => i + 1).map(index => {
					const isActive = currentHatIndex === index

					return (
						<div key={index} className='relative'>
							<button
								type='button'
								onClick={() => handleSetHatIndex(index)}
								className={`block w-full overflow-hidden rounded-xl border bg-white/60 transition-all ${
									isActive ? 'ring-brand shadow-md ring-2' : 'hover:border-brand/60'
								}`}>
								<img src={`/images/hats/${index}.webp`} alt={`hat ${index}`} className='h-20 w-full object-contain' />
							</button>
							{isActive && (
								<span className='bg-brand pointer-events-none absolute top-1 left-1 rounded-full px-2 py-0.5 text-[10px] text-white shadow'>当前使用</span>
							)}
						</div>
					)
				})}
			</div>
			<div className='mt-3'>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.hatFlipped ?? false}
						onChange={e => setFormData({ ...formData, hatFlipped: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>左右翻转</span>
				</label>
			</div>
		</div>
	)
}
