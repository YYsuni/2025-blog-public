import { Marked, TextRenderer, type Token, type Tokens } from 'marked'

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

function escapeAttr(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeHtml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Collect visible plain text from inline tokens (for TOC / ids). */
function inlinePlainText(tokens?: Token[]): string {
	if (!tokens?.length) return ''
	return tokens
		.map(token => {
			if ('tokens' in token && Array.isArray(token.tokens)) {
				return inlinePlainText(token.tokens as Token[])
			}
			return 'text' in token ? String((token as { text?: string }).text || '') : ''
		})
		.join('')
}

// Lazy load shiki to handle environments where it's not available (e.g., Cloudflare Workers)
let shikiModule: typeof import('shiki') | null = null
let shikiLoadAttempted = false

async function loadShiki() {
	if (shikiLoadAttempted) {
		return shikiModule
	}
	shikiLoadAttempted = true

	try {
		shikiModule = await import('shiki')
		return shikiModule
	} catch (error) {
		console.warn('Failed to load shiki module:', error)
		return null
	}
}

// Lazy load katex to handle environments where it's not available (e.g., Cloudflare Workers)
let katexModule: typeof import('katex') | null = null
let katexLoadAttempted = false

async function loadKatex() {
	if (katexModule) return katexModule
	if (katexLoadAttempted) return null
	katexLoadAttempted = true

	try {
		// katex is published as CJS; depending on bundler/runtime the dynamic import
		// may return either the exports object directly or as `default`.
		const mod: any = await import('katex')
		katexModule = (mod?.default ?? mod) as any
		return katexModule
	} catch (error) {
		console.warn('Failed to load katex module:', error)
		return null
	}
}

function walkTokens(tokenList: Tokens.Generic[], visit: (token: Tokens.Generic) => void) {
	for (const token of tokenList) {
		visit(token)
		if ('tokens' in token && Array.isArray(token.tokens)) {
			walkTokens(token.tokens as Tokens.Generic[], visit)
		}
		if (token.type === 'list' && Array.isArray((token as Tokens.List).items)) {
			for (const item of (token as Tokens.List).items) {
				if (item.tokens) walkTokens(item.tokens as Tokens.Generic[], visit)
			}
		}
		if (token.type === 'table') {
			const table = token as Tokens.Table
			for (const cell of table.header) {
				if (cell.tokens) walkTokens(cell.tokens as Tokens.Generic[], visit)
			}
			for (const row of table.rows) {
				for (const cell of row) {
					if (cell.tokens) walkTokens(cell.tokens as Tokens.Generic[], visit)
				}
			}
		}
	}
}

export async function renderMarkdown(markdown: string): Promise<MarkdownRenderResult> {
	// Load optional renderers first so they apply on the FIRST lex/parse pass.
	const codeBlockMap = new Map<string, { html: string; original: string }>()
	const [shiki, katex] = await Promise.all([loadShiki(), loadKatex()])

	const renderMath = (content: string, displayMode: boolean) => {
		if (!katex) {
			return displayMode ? `$$${content}$$` : `$${content}$`
		}

		try {
			return katex.renderToString(content, {
				displayMode,
				throwOnError: false,
				output: 'html',
				strict: 'ignore'
			})
		} catch {
			return displayMode ? `$$${content}$$` : `$${content}$`
		}
	}

	// Isolated Marked instance — avoid mutating global marked via marked.use()
	const marked = new Marked()

	const plainTextRenderer = new TextRenderer()

	marked.use({
		renderer: {
			heading({ tokens, depth }: Tokens.Heading) {
				const plain = this.parser.parseInline(tokens, plainTextRenderer)
				const id = slugify(plain)
				const inner = this.parser.parseInline(tokens)
				return `<h${depth} id="${id}">${inner}</h${depth}>\n`
			},
			code({ text }: Tokens.Code) {
				const codeData = codeBlockMap.get(text)
				if (codeData) {
					const escapedCode = escapeAttr(codeData.original)
					if (codeData.html) {
						// shiki already returns a full <pre>...</pre>; inject data-code instead of nesting
						return codeData.html.replace(/^<pre(?=[\s>])/, `<pre data-code="${escapedCode}"`)
					}
					return `<pre data-code="${escapedCode}"><code>${escapeHtml(codeData.original)}</code></pre>\n`
				}
				// Still a fenced/indented code block — never collapse to inline <code>
				return `<pre data-code="${escapeAttr(text)}"><code>${escapeHtml(text)}</code></pre>\n`
			},
			listitem(token: Tokens.ListItem) {
				let tokens = token.tokens
				if (token.task) tokens = tokens.slice(1)
				const inner = this.parser.parse(tokens)

				if (token.task) {
					const checkbox = token.checked ? '<input type="checkbox" checked disabled />' : '<input type="checkbox" disabled />'
					return `<li class="task-list-item">${checkbox} ${inner}</li>\n`
				}

				return `<li>${inner}</li>\n`
			}
		},
		extensions: [
			{
				name: 'mathBlock',
				level: 'block',
				start(src: string) {
					return src.indexOf('$$')
				},
				tokenizer(src: string) {
					const match = src.match(/^\$\$([\s\S]+?)\$\$(?:\n+|$)/)
					if (!match) return
					return {
						type: 'mathBlock',
						raw: match[0],
						text: match[1].trim()
					} as Tokens.Generic
				},
				renderer(token) {
					return `${renderMath((token as { text?: string }).text || '', true)}\n`
				}
			},
			{
				name: 'mathInline',
				level: 'inline',
				start(src: string) {
					const idx = src.indexOf('$')
					return idx === -1 ? undefined : idx
				},
				tokenizer(src: string) {
					if (src.startsWith('$$')) return
					if (src.startsWith('\\$')) return

					const match = src.match(/^\$([^\n$]+?)\$/)
					if (!match) return

					const inner = match[1]
					if (!inner || !inner.trim()) return

					return {
						type: 'mathInline',
						raw: match[0],
						text: inner.trim()
					} as Tokens.Generic
				},
				renderer(token) {
					return renderMath((token as { text?: string }).text || '', false)
				}
			}
		]
	})

	const tokens = marked.lexer(markdown)

	const toc: TocItem[] = []
	function extractHeadings(tokenList: Token[]) {
		for (const token of tokenList) {
			if (token.type === 'heading' && token.depth <= 3) {
				const text = inlinePlainText(token.tokens as Token[] | undefined) || token.text || ''
				const id = slugify(text)
				toc.push({ id, text, level: token.depth })
			}
			if ('tokens' in token && token.tokens) {
				extractHeadings(token.tokens as Token[])
			}
			if (token.type === 'list') {
				for (const item of token.items) {
					if (item.tokens) extractHeadings(item.tokens as Token[])
				}
			}
		}
	}
	extractHeadings(tokens as Token[])

	const highlightJobs: Promise<void>[] = []
	walkTokens(tokens as Tokens.Generic[], token => {
		if (token.type !== 'code') return
		const codeToken = token as Tokens.Code
		const originalCode = codeToken.text
		const key = `__SHIKI_CODE_${codeBlockMap.size}__`
		codeBlockMap.set(key, { html: '', original: originalCode })
		codeToken.text = key

		if (!shiki) return
		highlightJobs.push(
			(async () => {
				try {
					const html = await shiki.codeToHtml(originalCode, {
						lang: codeToken.lang || 'text',
						theme: 'one-light'
					})
					codeBlockMap.set(key, { html, original: originalCode })
				} catch {
					codeBlockMap.set(key, { html: '', original: originalCode })
				}
			})()
		)
	})
	await Promise.all(highlightJobs)

	const html = (marked.parser(tokens) as string) || ''

	return { html, toc }
}
