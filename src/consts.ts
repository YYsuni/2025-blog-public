export const INIT_DELAY = 0.3
export const ANIMATION_DELAY = 0.1
export const CARD_SPACING = 36
export const CARD_SPACING_SM = 24

/**
 * GitHub 仓库配置
 */
export const GITHUB_CONFIG = {
	OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'yysuni',
	REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || '2025-blog-public',
	BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
	APP_ID: process.env.NEXT_PUBLIC_GITHUB_APP_ID || '2456612'
} as const
