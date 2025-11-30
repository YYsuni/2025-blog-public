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

// Convert hex to RGB
export function hexToRgb(hex: string): RGB {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: { r: 0, g: 0, b: 0 }
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
export function hsvToHsl(h: number, s: number, v: number): HSL {
	const l = v * (1 - s / 2)
	const s2 = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)

	return {
		h: h,
		s: s2,
		l: l
	}
}

// Convert hex to HSVA
export function hexToHsva(hex: string): HSVA {
	const rgb = hexToRgb(hex)
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
	const hsv = hslToHsv(hsl.h, hsl.s, hsl.l)

	return {
		h: hsv.h,
		s: hsv.s,
		v: hsv.v,
		a: 1
	}
}

// Convert HSVA to hex
export function hsvaToHex(h: number, s: number, v: number, a: number = 1): string {
	const hsl = hsvToHsl(h, s, v)
	const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
	return rgbToHex(rgb.r, rgb.g, rgb.b)
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

// Format number to fixed decimal places
export function toFixed(value: number, decimals: number = 2): number {
	return Number(value.toFixed(decimals))
}

