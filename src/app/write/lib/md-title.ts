/** Extract the first ATX h1 (`# title`) from markdown. */
export function extractFirstH1(md: string): string {
	const match = md.match(/^#\s+(.+)$/m)
	return match?.[1]?.trim() || ''
}

/** Remove the first ATX h1 line from markdown. */
export function stripFirstH1(md: string): string {
	return md.replace(/^#\s+.+$/m, '').replace(/^\n+/, '')
}

/** Prepend `# title` when markdown has no h1 yet. */
export function ensureLeadingH1(md: string, title: string): string {
	if (!title.trim() || extractFirstH1(md)) return md
	const body = md.trimStart()
	return body ? `# ${title.trim()}\n\n${body}` : `# ${title.trim()}\n`
}
