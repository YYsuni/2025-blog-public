'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

type SizeState = {
	init: boolean
	maxXL: boolean
	maxLG: boolean
	maxMD: boolean
	maxSM: boolean
	maxXS: boolean
	recalc: () => void
}

const initState = {
	init: false,
	maxXL: false,
	maxLG: false,
	maxMD: false,
	maxSM: false,
	maxXS: false
}

const computeSize = (): Omit<SizeState, 'recalc'> => {
	if (typeof window !== 'undefined') {
		const width = window.innerWidth

		return {
			init: true,
			maxXL: width < 1280,
			maxLG: width < 1024,
			maxMD: width < 768,
			maxSM: width < 640,
			maxXS: width < 360
		}
	}

	return initState
}

export const useSizeStore = create<SizeState>(set => ({
	...initState,
	recalc: () => {
		set(computeSize())
	}
}))

export function useSizeInit() {
	useEffect(() => {
		const update = () => useSizeStore.getState().recalc()
		update()
		window.addEventListener('resize', update)
		return () => window.removeEventListener('resize', update)
	}, [])
}

export const useSize = useSizeStore
