'use client'

import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import Link from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extensions'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import { useWriteStore } from '../stores/write-store'
import { INIT_DELAY } from '@/consts'
import { ResolvedImage } from '../extensions/resolved-image'
import { extractFirstH1, normalizeLeadingH1 } from '../lib/md-title'
import type { ImageItem } from '../types'
import { EditorToolbar, setLink } from './editor-toolbar'

function imagesToMarkdown(items: ImageItem[]) {
	return items.map(item => (item.type === 'url' ? `![](${item.url})` : `![](local-image:${item.id})`)).join('\n')
}

const MARKDOWN_PATTERN =
	/^(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|\|.*\|\s*$|\s*[-*_]{3,}\s*$)|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|`[^`\n]+`|!?\[[^\]\n]+\]\([^)\n]+\)/m

/** 粗略判断一段文本是否包含 Markdown 语法(用于粘贴时决定是否按 Markdown 解析) */
function looksLikeMarkdown(text: string) {
	return MARKDOWN_PATTERN.test(text)
}

function insertMarkdownAt(editor: Editor, markdown: string, pos?: number) {
	const target = pos ?? editor.state.selection.from
	editor.chain().focus().insertContentAt(target, markdown, { contentType: 'markdown' }).run()
}

export function WriteEditor() {
	const { form, updateForm, addFiles } = useWriteStore()
	const addFilesRef = useRef(addFiles)
	const editorRef = useRef<Editor | null>(null)
	const lastEmittedMd = useRef(form.md)

	addFilesRef.current = addFiles

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3, 4] },
				link: false
			}),
			Link.configure({
				openOnClick: false,
				autolink: true,
				HTMLAttributes: {
					class: 'text-blue-500 underline underline-offset-2'
				}
			}),
			ResolvedImage,
			Table.configure({ resizable: false }),
			TableRow,
			TableHeader,
			TableCell,
			Placeholder.configure({
				placeholder: '用 # 标题 开始写作…'
			}),
			Markdown.configure({
				indentation: { style: 'space', size: 2 }
			})
		],
		content: form.md,
		contentType: 'markdown',
		onCreate: ({ editor: e }) => {
			editorRef.current = e
			lastEmittedMd.current = e.getMarkdown()
		},
		onDestroy: () => {
			editorRef.current = null
		},
		onUpdate: ({ editor: e }) => {
			// TipTap keeps bold marks inside h1 as `# **title**` — normalize before storing
			const md = normalizeLeadingH1(e.getMarkdown())
			lastEmittedMd.current = md
			const title = extractFirstH1(md)
			// Keep existing title if leading h1 is temporarily missing (e.g. mid-edit)
			updateForm(title ? { md, title } : { md })
		},
		editorProps: {
			attributes: {
				class: 'prose tiptap-editor min-h-[600px] w-full outline-none'
			},
			handleKeyDown: (_view, event) => {
				if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
					event.preventDefault()
					const current = editorRef.current
					if (current) setLink(current)
					return true
				}
				return false
			},
			handlePaste: (_view, event) => {
				const items = event.clipboardData?.items
				if (!items) return false

				const imageFiles: File[] = []
				for (let i = 0; i < items.length; i++) {
					const item = items[i]
					if (item.type.startsWith('image/')) {
						const file = item.getAsFile()
						if (file) imageFiles.push(file)
					}
				}

				if (imageFiles.length === 0) {
					// 粘贴的纯文本如果是 Markdown 语法,按 Markdown 解析而不是原样插入
					const text = event.clipboardData?.getData('text/plain') ?? ''
					const current = editorRef.current
					if (!current || current.isActive('codeBlock') || !looksLikeMarkdown(text)) return false

					event.preventDefault()
					current.chain().focus().insertContent(text, { contentType: 'markdown' }).run()
					return true
				}

				event.preventDefault()
				addFilesRef.current(imageFiles).then(resultImages => {
					const current = editorRef.current
					if (!current || resultImages.length === 0) return
					insertMarkdownAt(current, imagesToMarkdown(resultImages))
				})
				return true
			},
			handleDrop: (view, event, _slice, moved) => {
				if (moved) return false

				const files = event.dataTransfer?.files
				if (files && files.length > 0) {
					const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
					if (imageFiles.length > 0) {
						event.preventDefault()
						const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
						addFilesRef.current(imageFiles).then(resultImages => {
							const current = editorRef.current
							if (!current || resultImages.length === 0) return
							insertMarkdownAt(current, imagesToMarkdown(resultImages), coords?.pos)
						})
						return true
					}
				}

				const md = event.dataTransfer?.getData('text/markdown') || event.dataTransfer?.getData('text/plain') || ''
				const trimmed = md.trim()
				if (trimmed && /^!\[[^\]]*\]\([^)]+\)/.test(trimmed)) {
					event.preventDefault()
					const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
					const current = editorRef.current
					if (current) {
						insertMarkdownAt(current, trimmed, coords?.pos)
					}
					return true
				}

				return false
			}
		}
	})

	// Sync external markdown changes (import MD / load blog)
	useEffect(() => {
		if (!editor) return
		if (form.md === lastEmittedMd.current) return
		lastEmittedMd.current = form.md
		editor.commands.setContent(form.md, { contentType: 'markdown', emitUpdate: false })
		const title = extractFirstH1(form.md)
		if (title) updateForm({ title })
	}, [form.md, editor, updateForm])

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: INIT_DELAY }}
			className='bg-card flex min-h-[800px] w-[800px] flex-col rounded-[40px] border p-6 shadow'>
			<EditorToolbar editor={editor} />
			<div className='h-[650px] w-full flex-1 overflow-y-auto rounded-xl text-sm'>
				<EditorContent editor={editor} />
			</div>
		</motion.div>
	)
}
