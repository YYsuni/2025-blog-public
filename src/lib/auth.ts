'use client'

// 旧的 GitHub App 认证已废弃，现在使用 GitHub OAuth
// 这个文件保留是为了兼容其他服务（pictures, projects 等）

import { useAuthStore } from '@/hooks/use-auth'

const GITHUB_TOKEN_CACHE_KEY = 'github_token'

function getTokenFromCache(): string | null {
	if (typeof sessionStorage === 'undefined') return null
	try {
		return sessionStorage.getItem(GITHUB_TOKEN_CACHE_KEY)
	} catch {
		return null
	}
}

function saveTokenToCache(token: string): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.setItem(GITHUB_TOKEN_CACHE_KEY, token)
	} catch (error) {
		console.error('Failed to save token to cache:', error)
	}
}

function clearTokenCache(): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.removeItem(GITHUB_TOKEN_CACHE_KEY)
	} catch (error) {
		console.error('Failed to clear token cache:', error)
	}
}

export function clearAllAuthCache(): void {
	clearTokenCache()
}

export function hasAuth(): boolean {
	return !!getTokenFromCache()
}

/**
 * 获取认证 Token（已废弃，保留兼容）
 * @deprecated 使用 GitHub OAuth 登录后，不再需要手动获取 token
 */
export async function getAuthToken(): Promise<string> {
	const cachedToken = getTokenFromCache()
	if (cachedToken) {
		return cachedToken
	}
	throw new Error('GitHub App 认证已废弃，请使用 GitHub OAuth 登录')
}
