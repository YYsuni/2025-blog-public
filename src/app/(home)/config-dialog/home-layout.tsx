'use client'

import type { CardStyles } from '../stores/config-store'

interface HomeLayoutProps {
	cardStylesData: CardStyles
	setCardStylesData: React.Dispatch<React.SetStateAction<CardStyles>>
}

export function HomeLayout({ cardStylesData, setCardStylesData }: HomeLayoutProps) {
	return (
		<div className='space-y-6'>
			{Object.entries(cardStylesData).map(([key, cardStyle]: [string, any]) => (
				<div key={key}>
					<h3 className='mb-3 text-sm font-medium capitalize'>{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
					<div className='grid grid-cols-5 gap-3'>
						{cardStyle.width !== undefined && (
							<div>
								<label className='text-secondary mb-1 block text-xs'>Width</label>
								<input
									type='number'
									value={cardStyle.width}
									onChange={e =>
										setCardStylesData(prev => ({
											...prev,
											[key]: { ...prev[key as keyof CardStyles], width: parseInt(e.target.value) || 0 }
										}))
									}
									className='w-full rounded-lg border bg-gray-100 px-3 py-1.5 text-sm'
								/>
							</div>
						)}
						{cardStyle.height !== undefined && (
							<div>
								<label className='text-secondary mb-1 block text-xs'>Height</label>
								<input
									type='number'
									value={cardStyle.height}
									onChange={e =>
										setCardStylesData(prev => ({
											...prev,
											[key]: { ...prev[key as keyof CardStyles], height: parseInt(e.target.value) || 0 }
										}))
									}
									className='w-full rounded-lg border bg-gray-100 px-3 py-1.5 text-sm'
								/>
							</div>
						)}
						<div>
							<label className='text-secondary mb-1 block text-xs'>Order</label>
							<input
								type='number'
								value={cardStyle.order}
								onChange={e =>
									setCardStylesData(prev => ({
										...prev,
										[key]: { ...prev[key as keyof CardStyles], order: parseInt(e.target.value) || 0 }
									}))
								}
								className='w-full rounded-lg border bg-gray-100 px-3 py-1.5 text-sm'
							/>
						</div>
						{cardStyle.offset !== undefined && (
							<div>
								<label className='text-secondary mb-1 block text-xs'>Offset</label>
								<input
									type='number'
									value={cardStyle.offset}
									onChange={e =>
										setCardStylesData(prev => ({
											...prev,
											[key]: { ...prev[key as keyof CardStyles], offset: parseInt(e.target.value) || 0 }
										}))
									}
									className='w-full rounded-lg border bg-gray-100 px-3 py-1.5 text-sm'
								/>
							</div>
						)}
						<div>
							<label className='text-secondary mb-1 block text-xs'>Offset X</label>
							<input
								type='number'
								value={cardStyle.offsetX ?? ''}
								placeholder='null'
								onChange={e => {
									const value = e.target.value === '' ? null : parseInt(e.target.value) || 0
									setCardStylesData(prev => ({
										...prev,
										[key]: { ...prev[key as keyof CardStyles], offsetX: value }
									}))
								}}
								className='w-full rounded-lg border bg-gray-100 px-3 py-1.5 text-sm'
							/>
						</div>
						<div>
							<label className='text-secondary mb-1 block text-xs'>Offset Y</label>
							<input
								type='number'
								value={cardStyle.offsetY ?? ''}
								placeholder='null'
								onChange={e => {
									const value = e.target.value === '' ? null : parseInt(e.target.value) || 0
									setCardStylesData(prev => ({
										...prev,
										[key]: { ...prev[key as keyof CardStyles], offsetY: value }
									}))
								}}
								className='w-full rounded-lg border bg-gray-100 px-3 py-1.5 text-sm'
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
