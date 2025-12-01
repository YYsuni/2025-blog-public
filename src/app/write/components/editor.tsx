import { motion } from 'motion/react'
import { useWriteStore } from '../stores/write-store'
import { INIT_DELAY } from '@/consts'
import { useRef } from 'react'

const defaultText = 'text'

export function WriteEditor() {
	const { form, updateForm, images, addFiles } = useWriteStore()
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const insertText = (text: string) => {
		const textarea = textareaRef.current
		if (!textarea) return

		textarea.focus()
		// Use execCommand to preserve undo/redo stack
		const success = document.execCommand('insertText', false, text)

		if (!success) {
			// Fallback for browsers that don't support execCommand
			const { selectionStart, selectionEnd, value } = textarea
			const before = value.substring(0, selectionStart)
			const after = value.substring(selectionEnd)
			updateForm({ md: before + text + after })
			setTimeout(() => {
				textarea.setSelectionRange(selectionStart + text.length, selectionStart + text.length)
				textarea.focus()
			}, 0)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const textarea = textareaRef.current
		if (!textarea) return

		const { selectionStart, selectionEnd, value } = textarea
		const selectedText = value.substring(selectionStart, selectionEnd)

		// Ctrl/Cmd + B: Toggle Bold
		if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
			e.preventDefault()
			const before = value.substring(0, selectionStart)
			const after = value.substring(selectionEnd)

			// Check if already bold
			const isBold = before.endsWith('**') && after.startsWith('**')

			if (isBold && selectedText) {
				// Remove bold - select including markers and replace
				textarea.setSelectionRange(selectionStart - 2, selectionEnd + 2)
				insertText(selectedText)
			} else {
				// Add bold
				const text = selectedText || defaultText
				insertText(`**${text}**`)
				if (!selectedText) {
					setTimeout(() => {
						textarea.setSelectionRange(selectionStart + 2, selectionStart + 2 + defaultText.length)
					}, 0)
				}
			}
			return
		}

		// Ctrl/Cmd + I: Toggle Italic
		if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
			e.preventDefault()
			const before = value.substring(0, selectionStart)
			const after = value.substring(selectionEnd)

			// Check if already italic
			const isItalic = before.endsWith('*') && after.startsWith('*') && !(before.endsWith('**') && after.startsWith('**'))

			if (isItalic && selectedText) {
				// Remove italic and replace
				textarea.setSelectionRange(selectionStart - 1, selectionEnd + 1)
				insertText(selectedText)
			} else {
				// Add italic
				const text = selectedText || defaultText
				insertText(`*${text}*`)
				if (!selectedText) {
					// Select the default text
					setTimeout(() => {
						textarea.setSelectionRange(selectionStart + 1, selectionStart + 1 + defaultText.length)
					}, 0)
				}
			}
			return
		}

		// Ctrl/Cmd + K: Link
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			const text = selectedText || defaultText
			insertText(`[${text}](url)`)
			// Select 'url' part
			setTimeout(() => {
				const urlStart = selectionStart + text.length + 3
				textarea.setSelectionRange(urlStart, urlStart + 3)
			}, 0)
			return
		}

		// Tab: Indent
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault()
			insertText('\t')
			return
		}

		// Shift + Tab: Outdent
		if (e.key === 'Tab' && e.shiftKey) {
			e.preventDefault()
			const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
			const line = value.substring(lineStart, value.indexOf('\n', selectionStart))

			if (line.startsWith('\t')) {
				textarea.setSelectionRange(lineStart, lineStart + 1)
				insertText('')
			} else if (line.startsWith('  ')) {
				textarea.setSelectionRange(lineStart, lineStart + 2)
				insertText('')
			}
			return
		}
	}

	const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const items = e.clipboardData.items
		if (!items) return

		const imageFiles: File[] = []
		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile()
				if (file) {
					imageFiles.push(file)
				}
			}
		}

		if (imageFiles.length > 0) {
			e.preventDefault()

			const resultImages = await addFiles(imageFiles).catch(() => [])

			if (resultImages && resultImages.length > 0) {
				// 为所有处理后的图片（包括新添加和已存在的）生成 markdown
				const markdowns = resultImages.map(item => (item.type === 'url' ? `![](${item.url})` : `![](local-image:${item.id})`)).join('\n')
				insertText(markdowns)
			}
		}
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: INIT_DELAY }}
			className='flex min-h-[800px] w-[800px] flex-col rounded-[40px] border bg-white/60 p-6 shadow'>
			<div className='mb-3 flex gap-3'>
				<input
					type='text'
					placeholder='标题'
					className='flex-1 rounded-lg border bg-white/60 px-3 py-2 text-sm'
					value={form.title}
					onChange={e => updateForm({ title: e.target.value })}
				/>
				<input
					type='text'
					placeholder='slug（xx-xx）'
					className='w-[200px] rounded-lg border bg-white/60 px-3 py-2 text-sm'
					value={form.slug}
					onChange={e => updateForm({ slug: e.target.value })}
				/>
			</div>
			<textarea
				ref={textareaRef}
				placeholder='Markdown 内容'
				className='h-[650px] w-full flex-1 resize-none rounded-xl border bg-white/60 p-4 text-sm'
				value={form.md}
				onChange={e => updateForm({ md: e.target.value })}
				onKeyDown={handleKeyDown}
				onPaste={handlePaste}
			/>
		</motion.div>
	)
}
