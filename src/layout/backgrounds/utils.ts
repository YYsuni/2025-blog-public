// Simplex noise implementation (small, inline) adapted from Jonas Wagner (public domain)
// https://github.com/jwagner/simplex-noise.js (trimmed for 2D)
export function makeNoise2D(random = Math.random) {
	const p = new Uint8Array(256)
	for (let i = 0; i < 256; i++) p[i] = (random() * 256) | 0
	function grad2(hash: number, x: number, y: number) {
		const h = hash & 7
		const u = h < 4 ? x : y
		const v = h < 4 ? y : x
		return (h & 1 ? -u : u) + (h & 2 ? -2 * v : 2 * v)
	}
	const G2 = (3.0 - Math.sqrt(3.0)) / 6.0
	const F2 = 0.5 * (Math.sqrt(3.0) - 1.0)
	return function noise2D(xin: number, yin: number) {
		let n0 = 0,
			n1 = 0,
			n2 = 0
		const s = (xin + yin) * F2
		const i = Math.floor(xin + s)
		const j = Math.floor(yin + s)
		const t = (i + j) * G2
		const X0 = i - t
		const Y0 = j - t
		const x0 = xin - X0
		const y0 = yin - Y0

		const i1 = x0 > y0 ? 1 : 0
		const j1 = x0 > y0 ? 0 : 1

		const x1 = x0 - i1 + G2
		const y1 = y0 - j1 + G2
		const x2 = x0 - 1 + 2 * G2
		const y2 = y0 - 1 + 2 * G2

		const ii = i & 255
		const jj = j & 255

		const t0 = 0.5 - x0 * x0 - y0 * y0
		if (t0 >= 0) {
			const gi0 = p[ii + p[jj]]
			const t0_4 = t0 * t0 * t0 * t0
			n0 = t0_4 * grad2(gi0, x0, y0)
		}

		const t1 = 0.5 - x1 * x1 - y1 * y1
		if (t1 >= 0) {
			const gi1 = p[ii + i1 + p[jj + j1]]
			const t1_4 = t1 * t1 * t1 * t1
			n1 = t1_4 * grad2(gi1, x1, y1)
		}

		const t2 = 0.5 - x2 * x2 - y2 * y2
		if (t2 >= 0) {
			const gi2 = p[ii + 1 + p[jj + 1]]
			const t2_4 = t2 * t2 * t2 * t2
			n2 = t2_4 * grad2(gi2, x2, y2)
		}

		return 40 * (n0 + n1 + n2)
	}
}

export function rand(a: number, b: number) {
	return a + Math.random() * (b - a)
}
