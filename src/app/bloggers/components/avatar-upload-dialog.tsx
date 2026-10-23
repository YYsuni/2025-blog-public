'use client'

import MediaUploadDialog, { type MediaItem } from '@/components/media-upload-dialog'

export type AvatarItem = MediaItem

type Props = {
	currentAvatar?: string
	onClose: () => void
	onSubmit: (avatar: AvatarItem) => void
}

export default function AvatarUploadDialog({ currentAvatar, onClose, onSubmit }: Props) {
	return (
		<MediaUploadDialog
			title='选择头像'
			currentUrl={currentAvatar}
			urlPlaceholder='https://example.com/avatar.png'
			shape='circle'
			onClose={onClose}
			onSubmit={onSubmit}
		/>
	)
}
