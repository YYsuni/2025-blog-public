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
			.replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, '$1')
			.trim()
	}
	return cur
}

/** Extract the first ATX h1 (`# title`) from markdown. */
export function extractFirstH1(md: string): string {
	const match = md.match(/^#\s+(.+)$/m)
	return stripInlineMarkdown(match?.[1] || '')
}

/** Rewrite first h1 so TipTap bold/italic marks don't leak into `# **title**`. */
export function normalizeLeadingH1(md: string): string {
	return md.replace(/^#\s+(.+)$/m, (_, title: string) => `# ${stripInlineMarkdown(title)}`)
}

/** Remove the first ATX h1 line from markdown. */
export function stripFirstH1(md: string): string {
	return md.replace(/^#\s+.+$/m, '').replace(/^\n+/, '')
}

/** Prepend `# title` when markdown has no h1 yet. */
export function ensureLeadingH1(md: string, title: string): string {
	const clean = stripInlineMarkdown(title)
	if (!clean || extractFirstH1(md)) return md
	const body = md.trimStart()
	return body ? `# ${clean}\n\n${body}` : `# ${clean}\n`
}
