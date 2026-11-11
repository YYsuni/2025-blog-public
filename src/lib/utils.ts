import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function thousandsSeparator(n: string | number | any, sign: string = ',') {
	if (typeof n === 'string' || typeof n === 'number') {
		n = String(n)
		const reg = /\B(?=(\d{3})+($|\.))/g

		if (n.includes('.')) {
			const nArr = n.split('.')
			nArr[0] = nArr[0].replace(reg, `$&${sign}`)

			return nArr.join('.')
		}

		return n.replace(reg, `$&${sign}`)
	} else return 0
}

export function getFilenameExtension(filename: string, fallback = ''): string {
	const match = filename.toLowerCase().match(/(\.[a-z0-9]{1,10})$/)
	return match ? match[1] : fallback
}

export function getFileExt(filename: string): string {
	const lower = filename.toLowerCase()
	if (lower.endsWith('.jpg')) return '.jpg'
	if (lower.endsWith('.jpeg')) return '.jpeg'
	if (lower.endsWith('.webp')) return '.webp'
	if (lower.endsWith('.png')) return '.png'
	if (lower.endsWith('.svg')) return '.svg'
	return getFilenameExtension(filename, '.png')
}

export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes < 0) return ''
	if (bytes < 1024) return `${Math.round(bytes)} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function rand(a: number, b: number) {
	return a + Math.random() * (b - a)
}
