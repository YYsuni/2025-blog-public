'use client'

import MediaUploadDialog, { type MediaItem } from '@/components/media-upload-dialog'

export type ImageItem = MediaItem

type Props = {
	currentImage?: string
	onClose: () => void
	onSubmit: (image: ImageItem) => void
}

export default function ImageUploadDialog({ currentImage, onClose, onSubmit }: Props) {
	return <MediaUploadDialog title='选择图片' currentUrl={currentImage} onClose={onClose} onSubmit={onSubmit} />
}
