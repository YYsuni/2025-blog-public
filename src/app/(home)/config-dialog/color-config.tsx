'use client'

import { motion } from 'motion/react'
import { ColorPicker } from '@/components/color-picker'
import { XIcon } from 'lucide-react'
import type { SiteContent } from '../stores/config-store'
import siteContent from '@/config/site-content.json'

interface ColorConfigProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
}

const DEFAULT_THEME_COLORS = siteContent.theme

type ColorPreset = {
	name: string
	theme: Partial<SiteContent['theme']>
	backgroundColors: string[]
}

const COLOR_PRESETS: ColorPreset[] = [
	{
		name: '春暖',
		theme: {
			colorBrand: '#35bfab',
			colorBrandSecondary: '#1fc9e7',
			colorPrimary: '#334f52',
			colorSecondary: '#7b888e',
			colorBg: '#eeeeee',
			colorBorder: '#ffffff',
			colorCard: '#ffffff66',
			colorArticle: '#ffffffcc'
		},
		backgroundColors: ['#EDDD62', '#9EE7D1', '#84D68A', '#EDDD62', '#88E6E5', '#a7f3d0']
	},
	{
		name: '秋实',
		theme: {
			colorPrimary: '#4E3F42',
			colorBrand: '#de4331',
			colorBrandSecondary: '#FCC841'
		},
		backgroundColors: ['#FCC841', '#DFEFFC', '#DEDE92', '#DE4331', '#FE9750', '#FCC841']
	},
	{
		name: '深夜',
		theme: {
			colorBrand: '#2a48f3',
			colorPrimary: '#e6e8e8',
			colorSecondary: '#acadae',
			colorBrandSecondary: '#51d0b9',
			colorBg: '#0a051f',
			colorBorder: '#8a8a8a5e',
			colorCard: '#ffffff0e',
			colorArticle: '#6f6f6f33'
		},
		backgroundColors: ['#16007b']
	}
]

export function ColorConfig({ formData, setFormData }: ColorConfigProps) {
	const theme = formData.theme ?? {}

	const handleThemeColorChange = (key: keyof typeof DEFAULT_THEME_COLORS, value: string) => {
		setFormData(prev => ({
			...prev,
			theme: {
				...prev.theme,
				[key]: value
			}
		}))
	}

	const handleBrandColorChange = (value: string) => {
		setFormData(prev => ({
			...prev,
			theme: {
				...prev.theme,
				colorBrand: value
			}
		}))
	}

	const handleColorChange = (index: number, value: string) => {
		const newColors = [...formData.backgroundColors]
		newColors[index] = value
		setFormData({ ...formData, backgroundColors: newColors })
	}

	const generateRandomColor = () => {
		const randomChannel = () => Math.floor(Math.random() * 256)
		return `#${[randomChannel(), randomChannel(), randomChannel()]
			.map(channel => channel.toString(16).padStart(2, '0'))
			.join('')
			.toUpperCase()}`
	}

	const handleRandomizeColors = () => {
		const count = Math.floor(Math.random() * 5) + 4 // 4 ~ 8 个颜色
		const backgroundColors = Array.from({ length: count }, () => generateRandomColor())
		const colorBrand = generateRandomColor()

		setFormData(prev => ({
			...prev,
			backgroundColors,
			theme: {
				...prev.theme,
				colorBrand
			}
		}))
	}

	const handleAddColor = () => {
		setFormData({
			...formData,
			backgroundColors: [...formData.backgroundColors, '#EDDD62']
		})
	}

	const handleRemoveColor = (index: number) => {
		if (formData.backgroundColors.length > 1) {
			const newColors = formData.backgroundColors.filter((_, i) => i !== index)
			setFormData({ ...formData, backgroundColors: newColors })
		}
	}

	const handlePresetChange = (preset: ColorPreset) => {
		setFormData(prev => ({
			...prev,
			backgroundColors: [...preset.backgroundColors],
			theme: {
				...prev.theme,
				...preset.theme
			}
		}))
	}

	return (
		<div className='space-y-6'>
			<div>
				<label className='mb-2 block text-sm font-medium'>基础颜色</label>
				<div className='grid grid-cols-2 gap-4'>
					<div className='flex items-center gap-3'>
						<ColorPicker value={formData.theme?.colorBrand ?? '#35bfab'} onChange={handleBrandColorChange} />
						<span className='text-xs'>主题色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker
							value={theme.colorBrandSecondary ?? DEFAULT_THEME_COLORS.colorBrandSecondary}
							onChange={value => handleThemeColorChange('colorBrandSecondary', value)}
						/>
						<span className='text-xs'>次级主题色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker value={theme.colorPrimary ?? DEFAULT_THEME_COLORS.colorPrimary} onChange={value => handleThemeColorChange('colorPrimary', value)} />
						<span className='text-xs'>主色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker
							value={theme.colorSecondary ?? DEFAULT_THEME_COLORS.colorSecondary}
							onChange={value => handleThemeColorChange('colorSecondary', value)}
						/>
						<span className='text-xs'>次色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker value={theme.colorBg ?? DEFAULT_THEME_COLORS.colorBg} onChange={value => handleThemeColorChange('colorBg', value)} />
						<span className='text-xs'>背景色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker value={theme.colorBorder ?? DEFAULT_THEME_COLORS.colorBorder} onChange={value => handleThemeColorChange('colorBorder', value)} />
						<span className='text-xs'>边框色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker value={theme.colorCard ?? DEFAULT_THEME_COLORS.colorCard} onChange={value => handleThemeColorChange('colorCard', value)} />
						<span className='text-xs'>卡片色</span>
					</div>
					<div className='flex items-center gap-3'>
						<ColorPicker value={theme.colorArticle ?? DEFAULT_THEME_COLORS.colorArticle} onChange={value => handleThemeColorChange('colorArticle', value)} />
						<span className='text-xs'>文章背景</span>
					</div>
				</div>
			</div>

			<div>
				<div className='mb-2 flex items-center justify-between gap-3'>
					<label className='block text-sm font-medium'>背景颜色</label>
					<div className='flex gap-2'>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleRandomizeColors}
							className='rounded-lg border bg-white/60 px-3 py-1 text-xs whitespace-nowrap'>
							随机配色
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleAddColor}
							className='rounded-lg border bg-white/60 px-3 py-1 text-xs whitespace-nowrap'>
							+ 添加颜色
						</motion.button>
					</div>
				</div>
				<div className='flex gap-3'>
					{formData.backgroundColors.map((color, index) => (
						<div key={index} className='flex items-center gap-2'>
							<div className='group relative'>
								<ColorPicker value={color} onChange={value => handleColorChange(index, value)} />
								{formData.backgroundColors.length > 1 && (
									<button
										onClick={() => handleRemoveColor(index)}
										className='text-secondary absolute -top-1 -right-2 rounded-lg border bg-white/60 text-xs whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100'>
										<XIcon className='size-3' />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className='flex flex-col gap-3'>
				{COLOR_PRESETS.map(preset => (
					<button
						key={preset.name}
						onClick={() => handlePresetChange(preset)}
						className='flex items-center gap-3 rounded-lg border bg-white/60 p-3 transition-colors hover:bg-white/80'>
						<div className='flex items-center gap-2'>
							<div
								className='h-10 w-10 rounded-lg border-2 border-white/20 shadow-sm'
								style={{ backgroundColor: preset.theme.colorBrand ?? DEFAULT_THEME_COLORS.colorBrand }}
							/>
							{preset.backgroundColors.map((color, index) => (
								<div key={index} className='h-10 w-10 rounded-lg border-2 border-white/20 shadow-sm' style={{ backgroundColor: color }} />
							))}
						</div>

						<span className='text-sm font-medium whitespace-nowrap'>{preset.name}</span>
					</button>
				))}
			</div>
		</div>
	)
}
