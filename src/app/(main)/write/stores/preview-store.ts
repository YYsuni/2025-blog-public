import { create } from 'zustand'

type PreviewStore = {
	isPreview: boolean
	openPreview: () => void
	closePreview: () => void
	togglePreview: () => void
}

export const usePreviewStore = create<PreviewStore>(set => ({
	isPreview: false,
	openPreview: () => set({ isPreview: true }),
	closePreview: () => set({ isPreview: false }),
	togglePreview: () => set(state => ({ isPreview: !state.isPreview }))
}))
