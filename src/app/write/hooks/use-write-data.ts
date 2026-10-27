import { useMemo } from 'react'
import dayjs from 'dayjs'
import { useWriteStore } from '../stores/write-store'
import { extractFirstH1, stripFirstH1 } from '../lib/md-title'

export function useWriteData() {
	const { form, images } = useWriteStore()

	// Replace local-image placeholders with preview URLs; drop leading h1 (shown as title)
	const processedMarkdown = useMemo(() => {
		let mdForPreview = stripFirstH1(form.md)
		for (const img of images) {
			if (img.type === 'file') {
				const placeholder = `local-image:${img.id}`
				mdForPreview = mdForPreview.split(`(${placeholder})`).join(`(${img.previewUrl})`)
			}
		}
		return mdForPreview
	}, [form.md, images])

	const title = form.title || extractFirstH1(form.md) || 'Untitled'
	const date = dayjs(form.date).format('YYYY年 M月 D日')

	return {
		markdown: processedMarkdown,
		title,
		date
	}
}
