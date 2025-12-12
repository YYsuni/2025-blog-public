export const INIT_DELAY = 0.3
export const ANIMATION_DELAY = 0.1
export const CARD_SPACING = 36
export const CARD_SPACING_SM = 24
export const BLOG_SLUG_KEY = process.env.BLOG_SLUG_KEY || ''

/**
 * GitHub 仓库配置
 */
export const GITHUB_CONFIG = {
	OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER || 'yysuni',
	REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || '2025-blog-public',
	BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
	APP_ID: process.env.NEXT_PUBLIC_GITHUB_APP_ID || '-',
	ENCRYPT_KEY: process.env.NEXT_PUBLIC_GITHUB_ENCRYPT_KEY || 'wudishiduomejimo',
} as const

/**
 * GitHub OAuth2 配置
 */
export const GITHUB_OAUTH2_CONFIG = {
	CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_OAUTH2_CLIENT_ID || '',
	CLIENT_SECRET: process.env.GITHUB_OAUTH2_CLIENT_SECRET || '',
	SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
	SCOPE: 'repo',
	STATE_KEY: 'github_oauth_state',
	TOKEN_KEY: 'github_oauth_token',
} as const
