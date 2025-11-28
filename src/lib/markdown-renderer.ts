import { marked } from 'marked'
import type { Tokens } from 'marked'
import { codeToHtml } from 'shiki'

export type TocItem = { id: string; text: string; level: number }

export interface MarkdownRenderResult {
	html: string
	toc: TocItem[]
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
}

export async function renderMarkdown(markdown: string): Promise<MarkdownRenderResult> {
	// Parse TOC from markdown
	const toc: TocItem[] = []
	for (const line of markdown.split('\n')) {
		const m = /^(#{1,3})\s+(.+)$/.exec(line.trim())
		if (m) {
			const level = m[1].length
			const text = m[2].trim()
			const id = slugify(text)
			toc.push({ id, text, level })
		}
	}

	// Pre-process code blocks with Shiki
	const codeBlockMap = new Map<string, { html: string; original: string }>()
	const tokens = marked.lexer(markdown)

	for (const token of tokens) {
		if (token.type === 'code') {
			const codeToken = token as Tokens.Code
			const originalCode = codeToken.text
			try {
				const html = await codeToHtml(originalCode, {
					lang: codeToken.lang || 'text',
					theme: 'one-light'
				})
				const key = `__SHIKI_CODE_${codeBlockMap.size}__`
				codeBlockMap.set(key, { html, original: originalCode })
				codeToken.text = key
			} catch {
				// Keep original if highlighting fails
				const key = `__SHIKI_CODE_${codeBlockMap.size}__`
				codeBlockMap.set(key, { html: '', original: originalCode })
				codeToken.text = key
			}
		}
	}

	// Render HTML with heading ids
	const renderer = new marked.Renderer()

	renderer.heading = (token: Tokens.Heading) => {
		const id = slugify(token.text || '')
		return `<h${token.depth} id="${id}">${token.text}</h${token.depth}>`
	}

	renderer.code = (token: Tokens.Code) => {
		// Check if this code block was pre-processed
		const codeData = codeBlockMap.get(token.text)
		if (codeData) {
			// Add data-code attribute with original code for copy functionality
			// Escape HTML entities for attribute value
			const escapedCode = codeData.original
				.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
			if (codeData.html) {
				// Shiki highlighted code
				return `<pre data-code="${escapedCode}">${codeData.html}</pre>`
			}
			// Fallback for failed highlighting
			return `<pre data-code="${escapedCode}"><code>${codeData.original}</code></pre>`
		}
		// Fallback to default (inline code, not code block)
		return `<code>${token.text}</code>`
	}

	renderer.listitem = (token: Tokens.ListItem) => {
		// Render inline markdown inside list items (e.g. links, emphasis)
		const inner = token.tokens ? (marked.parser(token.tokens) as string) : token.text

		if (token.task) {
			const checkbox = token.checked ? '<input type="checkbox" checked disabled />' : '<input type="checkbox" disabled />'
			return `<li class="task-list-item">${checkbox} ${inner}</li>\n`
		}

		return `<li>${inner}</li>\n`
	}

	marked.use({
		renderer
	})
	const html = (marked.parser(tokens) as string) || ''

	return { html, toc }
}
