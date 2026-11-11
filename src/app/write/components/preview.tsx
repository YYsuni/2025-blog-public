import { useMemo } from 'react'
import { motion } from 'motion/react'
import { BlogPreview } from '@/components/blog-preview'
import { useWriteData } from '../hooks/use-write-data'
import { useWriteStore } from '../stores/write-store'
import type { PublishForm } from '../types'

type WritePreviewProps = {
	form: PublishForm
	coverPreviewUrl: string | null
	onClose: () => void
	slug?: string
}

export function WritePreview({ form, coverPreviewUrl, onClose, slug }: WritePreviewProps) {
	const previewData = useWriteData()
	const attachments = useWriteStore(s => s.attachments)
	const attachmentPreview = useMemo(
		() =>
			attachments.map(item => ({
				name: item.name,
				url: item.type === 'url' ? item.url : `#attachment-${item.id}`,
				size: item.size
			})),
		[attachments]
	)

	return (
		<div>
			<div onClick={e => e.stopPropagation()}>
				<BlogPreview
					markdown={previewData.markdown}
					title={previewData.title}
					tags={form.tags}
					date={previewData.date}
					summary={form.summary}
					cover={coverPreviewUrl || undefined}
					slug={slug}
					attachments={attachmentPreview}
				/>
			</div>
			<motion.button
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				className='absolute top-4 right-6 rounded-xl border bg-white/60 px-6 py-2 text-sm'
				onClick={onClose}>
				关闭预览
			</motion.button>
		</div>
	)
}
