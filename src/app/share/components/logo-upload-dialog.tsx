'use client'

import MediaUploadDialog, { type MediaItem } from '@/components/media-upload-dialog'

export type LogoItem = MediaItem

type Props = {
	currentLogo?: string
	onClose: () => void
	onSubmit: (logo: LogoItem) => void
}

export default function LogoUploadDialog({ currentLogo, onClose, onSubmit }: Props) {
	return (
		<MediaUploadDialog
			title='选择图标'
			currentUrl={currentLogo}
			urlPlaceholder='https://example.com/logo.png'
			onClose={onClose}
			onSubmit={onSubmit}
		/>
	)
}
