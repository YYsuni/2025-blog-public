export const INIT_DELAY = 0.3
export const ANIMATION_DELAY = 0.1
export const CARD_SPACING = 36
export const CARD_SPACING_SM = 24

/**
 * GitHub 仓库配置
 */
export const GITHUB_CONFIG = {
	OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER || '77&Eleven',
	REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || '77&Eleven-blog',
	BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'release',
	APP_ID: process.env.NEXT_PUBLIC_GITHUB_APP_ID || '2343237'
} as const
