'use client'

import Image from '@tiptap/extension-image'
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'
import { cn } from '@/lib/utils'
import { useWriteStore } from '../stores/write-store'

function ResolvedImageView({ node, selected }: NodeViewProps) {
	const images = useWriteStore(s => s.images)
	const rawSrc = (node.attrs.src as string) || ''

	let src = rawSrc
	if (rawSrc.startsWith('local-image:')) {
		const id = rawSrc.slice('local-image:'.length)
		const found = images.find(img => img.id === id)
		if (found?.type === 'file') {
			src = found.previewUrl
		}
	}

	return (
		<NodeViewWrapper as='div' className={cn('my-4 flex justify-center', selected && 'rounded-xl ring-2 ring-blue-400 ring-offset-2')}>
			<img
				src={src}
				alt={(node.attrs.alt as string) || ''}
				title={(node.attrs.title as string) || undefined}
				className='max-w-[40%] rounded-xl border max-sm:max-w-full'
				draggable={false}
			/>
		</NodeViewWrapper>
	)
}

export const ResolvedImage = Image.extend({
	addNodeView() {
		return ReactNodeViewRenderer(ResolvedImageView)
	}
}).configure({
	allowBase64: false
})
