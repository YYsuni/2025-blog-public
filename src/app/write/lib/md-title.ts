/** Strip common inline markdown markers from a plain title string. */
export function stripInlineMarkdown(text: string): string {
	let cur = text.trim()
	let prev = ''
	while (prev !== cur) {
		prev = cur
		cur = cur
			.replace(/\*\*(.+?)\*\*/g, '$1')
			.replace(/__(.+?)__/g, '$1')
			.replace(/\*(.+?)\*/g, '$1')
			.replace(/_(.+?)_/g, '$1')
			.replace(/`(.+?)`/g, '$1')
			.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1')
			.replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, '$1')
			.trim()
	}
	return cur
}

/**
 * Extract the leading ATX h1 (`# title`) from the start of markdown.
 * Only the document-leading h1 counts — `#` lines inside code fences must not.
 */
export function extractFirstH1(md: string): string {
	const match = md.trimStart().match(/^#\s+([^\n\r]+)/)
	return stripInlineMarkdown(match?.[1] || '')
}

/** Rewrite leading h1 so TipTap bold/italic marks don't leak into `# **title**`. */
export function normalizeLeadingH1(md: string): string {
	return md.replace(/^(\s*)#\s+([^\n\r]+)/, (_, ws: string, title: string) => `${ws}# ${stripInlineMarkdown(title)}`)
}

/** Remove the leading ATX h1 line from markdown. */
export function stripFirstH1(md: string): string {
	return md.replace(/^\s*#\s+[^\n\r]+(?:\r?\n)*/, '')
}

/** Prepend `# title` when markdown has no leading h1 yet. */
export function ensureLeadingH1(md: string, title: string): string {
	const clean = stripInlineMarkdown(title)
	if (!clean || extractFirstH1(md)) return md
	const body = md.trimStart()
	return body ? `# ${clean}\n\n${body}` : `# ${clean}\n`
}
