export type PublishForm = {
	slug: string
	title: string
	md: string
	tags: string[]
	date: string
	summary: string
	hidden?: boolean
	category?: string
}

export type ImageItem = { id: string; type: 'url'; url: string } | { id: string; type: 'file'; file: File; previewUrl: string; filename: string; hash?: string }

export type AttachmentItem =
	| { id: string; type: 'url'; name: string; url: string; size?: number }
	| { id: string; type: 'file'; file: File; name: string; size: number; hash?: string }

export type AttachmentMeta = {
	name: string
	url: string
	size?: number
}
