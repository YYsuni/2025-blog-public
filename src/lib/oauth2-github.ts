/**
 * GitHub OAuth2 认证模块
 * 提供完整的GitHub OAuth2登录流程
 */

import { GITHUB_OAUTH2_CONFIG } from '@/consts'

/**
 * GitHub用户信息接口
 */
export interface GitHubUser {
	login: string
	id: number
	avatar_url: string
	gravatar_id: string
	url: string
	html_url: string
	followers_url: string
	following_url: string
	gists_url: string
	starred_url: string
	subscriptions_url: string
	organizations_url: string
	repos_url: string
	events_url: string
	received_events_url: string
	type: string
	site_admin: boolean
	name: string | null
	company: string | null
	blog: string | null
	location: string | null
	email: string | null
	hireable: boolean | null
	bio: string | null
	twitter_username: string | null
	public_repos: number
	public_gists: number
	followers: number
	following: number
	created_at: string
	updated_at: string
}

/**
 * 生成随机状态字符串
 */
function generateState(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 保存状态到localStorage
 */
function saveState(state: string): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(GITHUB_OAUTH2_CONFIG.STATE_KEY, state)
	}
}

/**
 * 从localStorage获取状态
 */
function getState(): string | null {
	if (typeof localStorage !== 'undefined') {
		return localStorage.getItem(GITHUB_OAUTH2_CONFIG.STATE_KEY)
	}
	return null
}

/**
 * 清除状态
 */
function clearState(): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(GITHUB_OAUTH2_CONFIG.STATE_KEY)
	}
}

/**
 * 保存OAuth2 token
 */
export function saveOAuth2Token(token: string): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(GITHUB_OAUTH2_CONFIG.TOKEN_KEY, token)
	}
}

/**
 * 获取OAuth2 token
 */
export function getOAuth2Token(): Promise<string | null> {
	return new Promise((resolve) => {
		if (typeof localStorage !== 'undefined') {
			const token = localStorage.getItem(GITHUB_OAUTH2_CONFIG.TOKEN_KEY)
			resolve(token)
		} else {
			resolve(null)
		}
	})
}

/**
 * 清除OAuth2 token
 */
export function clearOAuth2Token(): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(GITHUB_OAUTH2_CONFIG.TOKEN_KEY)
	}
}

/**
 * 检查是否有OAuth2认证
 */
export function hasOAuth2Auth(): boolean {
	if (typeof localStorage !== 'undefined') {
		return !!localStorage.getItem(GITHUB_OAUTH2_CONFIG.TOKEN_KEY)
	}
	return false
}

/**
 * 发起GitHub OAuth2登录
 */
export function initiateGitHubOAuth2(): void {
	const state = generateState()
	saveState(state)

	const params = new URLSearchParams({
		client_id: GITHUB_OAUTH2_CONFIG.CLIENT_ID,
		redirect_uri: `${GITHUB_OAUTH2_CONFIG.SITE_URL}/auth/callback`,
		scope: GITHUB_OAUTH2_CONFIG.SCOPE,
		state: state
	})

	const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
	window.location.href = authUrl
}

/**
 * 处理OAuth2回调
 */
export async function handleOAuth2Callback(code: string, state: string): Promise<boolean> {
	const savedState = getState()

	// 验证状态参数
	if (!savedState || savedState !== state) {
		console.error('Invalid state parameter')
		return false
	}

	try {
		// 调用后端API交换access token
		const response = await fetch('/api/auth/github/oauth2/callback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ code, state })
		})

		const data = await response.json()

		if (data.success && data.access_token) {
			// 保存access token
			saveOAuth2Token(data.access_token)
			clearState()
			return true
		} else {
			console.error('OAuth2 callback failed:', data.error)
			return false
		}
	} catch (error) {
		console.error('Error handling OAuth2 callback:', error)
		return false
	}
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<GitHubUser | null> {
	const token = await getOAuth2Token()

	if (!token) {
		return null
	}

	try {
		const response = await fetch('https://api.github.com/user', {
			headers: {
				'Authorization': `token ${token}`,
				'Accept': 'application/vnd.github.v3+json'
			}
		})

		if (response.ok) {
			return await response.json()
		} else {
			console.error(`Failed to get user info: ${response.status}`)
			return null
		}
	} catch (error) {
		console.error('Error fetching user info:', error)
		return null
	}
}