// Simple color conversion utilities for hex mode

export interface HSVA {
	h: number
	s: number
	v: number
	a: number
}

export interface HSL {
	h: number
	s: number
	l: number
}

export interface RGB {
	r: number
	g: number
	b: number
}

export interface RGBA extends RGB {
	a: number
}

// Convert 6-digit hex to RGB (no alpha)
export function hexToRgb(hex: string): RGB {
	const cleaned = hex.replace('#', '')
	const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleaned)
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: { r: 0, g: 0, b: 0 }
}

// Convert hex (6 or 8 digits) to RGBA
export function hexToRgba(hex: string): RGBA {
	const cleaned = hex.replace('#', '')

	if (cleaned.length === 6) {
		const r = parseInt(cleaned.slice(0, 2), 16)
		const g = parseInt(cleaned.slice(2, 4), 16)
		const b = parseInt(cleaned.slice(4, 6), 16)

		return { r, g, b, a: 1 }
	}

	if (cleaned.length === 8) {
		const r = parseInt(cleaned.slice(0, 2), 16)
		const g = parseInt(cleaned.slice(2, 4), 16)
		const b = parseInt(cleaned.slice(4, 6), 16)
		const a = parseInt(cleaned.slice(6, 8), 16) / 255

		return { r, g, b, a }
	}

	// Fallback
	return { r: 0, g: 0, b: 0, a: 1 }
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): HSL {
	r /= 255
	g /= 255
	b /= 255

	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	let h = 0
	let s = 0
	const l = (max + min) / 2

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6
				break
			case g:
				h = ((b - r) / d + 2) / 6
				break
			case b:
				h = ((r - g) / d + 4) / 6
				break
		}
	}

	return {
		h: h * 360,
		s: s,
		l: l
	}
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
	h /= 360
	let r, g, b

	if (s === 0) {
		r = g = b = l
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1
			if (t > 1) t -= 1
			if (t < 1 / 6) return p + (q - p) * 6 * t
			if (t < 1 / 2) return q
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
			return p
		}

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s
		const p = 2 * l - q

		r = hue2rgb(p, q, h + 1 / 3)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h - 1 / 3)
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	}
}

// Convert HSL to HSV
export function hslToHsv(h: number, s: number, l: number): HSVA {
	const v = l + s * Math.min(l, 1 - l)
	const s2 = v === 0 ? 0 : 2 * (1 - l / v)

	return {
		h: h,
		s: s2,
		v: v,
		a: 1
	}
}

// Convert HSV to HSL
export function hsvToHsl(h: number, s: number, v: number) {
	let l = (v * (2 - s)) / 2
	if (l != 0) {
		if (l == 1) {
			s = 0
		} else if (l < 0.5) {
			s = (s * v) / (l * 2)
		} else {
			s = (s * v) / (2 - l * 2)
		}
	}

	return { h, s, l }
}

// Convert hex to HSVA
export function hexToHsva(hex: string): HSVA {
	const rgba = hexToRgba(hex)
	const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b)
	const hsv = hslToHsv(hsl.h, hsl.s, hsl.l)

	return {
		h: hsv.h,
		s: hsv.s,
		v: hsv.v,
		a: rgba.a
	}
}

// Convert HSVA to hex (outputs #RRGGBB or #RRGGBBAA when alpha < 1)
export function hsvaToHex(h: number, s: number, v: number, a: number = 1): string {
	const hsl = hsvToHsl(h, s, v)
	const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
	const baseHex = rgbToHex(rgb.r, rgb.g, rgb.b)

	// Normalize alpha between 0 and 1
	const alpha = clamp(a, 0, 1)

	// If fully opaque, keep legacy 6-digit hex for compatibility
	if (alpha >= 1) {
		return baseHex
	}

	const alphaHex = Math.round(alpha * 255)
		.toString(16)
		.padStart(2, '0')

	return `${baseHex}${alphaHex}`
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

// Format number to fixed decimal places
export function toFixed(value: number, decimals: number = 2): number {
	return Number(value.toFixed(decimals))
}
