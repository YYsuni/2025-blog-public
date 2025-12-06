'use client'

import { create } from 'zustand'
import { useConfigStore, type CardStyles } from './config-store'

type CardKey = keyof CardStyles

interface LayoutEditState {
	editing: boolean
	snapshot: CardStyles | null
	startEditing: () => void
	cancelEditing: () => void
	saveEditing: () => void
	setOffset: (key: CardKey, offsetX: number | null, offsetY: number | null) => void
	setSize: (key: CardKey, width: number | undefined, height: number | undefined) => void
}

export const useLayoutEditStore = create<LayoutEditState>((set, get) => ({
	editing: false,
	snapshot: null,
	startEditing: () => {
		const { cardStyles } = useConfigStore.getState()
		set({
			editing: true,
			snapshot: { ...cardStyles }
		})
	},
	cancelEditing: () => {
		const { snapshot } = get()
		if (!snapshot) {
			set({ editing: false, snapshot: null })
			return
		}

		const { setCardStyles } = useConfigStore.getState()
		setCardStyles(snapshot)

		set({
			editing: false,
			snapshot: null
		})
	},
	saveEditing: () => {
		set({
			editing: false,
			snapshot: null
		})
	},
	setOffset: (key, offsetX, offsetY) => {
		const { cardStyles, setCardStyles } = useConfigStore.getState()

		const next: CardStyles = {
			...cardStyles,
			[key]: {
				...cardStyles[key],
				offsetX,
				offsetY
			}
		}

		setCardStyles(next)
	},
	setSize: (key, width, height) => {
		const { cardStyles, setCardStyles } = useConfigStore.getState()

		const next: CardStyles = {
			...cardStyles,
			[key]: {
				...cardStyles[key],
				width,
				height
			}
		}

		setCardStyles(next)
	}
}))

