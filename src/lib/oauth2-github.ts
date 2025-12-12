'use client'

import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'sonner'

// OAuth2 配置
const OAUTH2_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID || '',
  REDIRECT_URI: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '',
  SCOPE: 'repo', // 仓库访问权限
  STATE_KEY: 'github_oauth_state',
  TOKEN_KEY: 'github_oauth_token'
}

/**
 * 生成随机状态字符串用于安全验证
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 保存状态到sessionStorage
 */
function saveState(state: string): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(OAUTH2_CONFIG.STATE_KEY, state)
  } catch (error) {
    console.error('Failed to save OAuth state:', error)
  }
}

/**
 * 验证并清除状态
 */
function validateAndClearState(returnedState: string): boolean {
  if (typeof sessionStorage === 'undefined') return false
  try {
    const savedState = sessionStorage.getItem(OAUTH2_CONFIG.STATE_KEY)
    sessionStorage.removeItem(OAUTH2_CONFIG.STATE_KEY)
    return savedState === returnedState
  } catch (error) {
    console.error('Failed to validate OAuth state:', error)
    return false
  }
}

/**
 * 获取OAuth2访问令牌
 */
export async function getOAuth2Token(): Promise<string | null> {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage.getItem(OAUTH2_CONFIG.TOKEN_KEY)
  } catch (error) {
    console.error('Failed to get OAuth2 token:', error)
    return null
  }
}

/**
 * 保存OAuth2访问令牌
 */
export function saveOAuth2Token(token: string): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(OAUTH2_CONFIG.TOKEN_KEY, token)
  } catch (error) {
    console.error('Failed to save OAuth2 token:', error)
  }
}

/**
 * 清除OAuth2访问令牌
 */
export function clearOAuth2Token(): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(OAUTH2_CONFIG.TOKEN_KEY)
  } catch (error) {
    console.error('Failed to clear OAuth2 token:', error)
  }
}

/**
 * 启动GitHub OAuth2登录流程
 */
export function initiateGitHubOAuth2(): void {
  if (!OAUTH2_CONFIG.CLIENT_ID) {
    toast.error('GitHub OAuth2客户端ID未配置')
    return
  }

  const state = generateState()
  saveState(state)

  const params = new URLSearchParams({
    client_id: OAUTH2_CONFIG.CLIENT_ID,
    redirect_uri: OAUTH2_CONFIG.REDIRECT_URI,
    scope: OAUTH2_CONFIG.SCOPE,
    state: state
  })

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
  
  toast.info('正在跳转到GitHub授权页面...')
  window.location.href = authUrl
}

/**
 * 处理OAuth2回调
 */
export async function handleOAuth2Callback(code: string, state: string): Promise<boolean> {
  // 验证状态
  if (!validateAndClearState(state)) {
    toast.error('OAuth状态验证失败，请重新登录')
    return false
  }

  try {
    toast.info('正在获取访问令牌...')
    
    // 通过API路由交换授权码获取访问令牌
    const tokenResponse = await fetch('/api/auth/github/oauth2/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, state })
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const data = await tokenResponse.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Token exchange failed')
    }

    const accessToken = data.access_token
    if (!accessToken) {
      throw new Error('No access token received')
    }

    // 保存访问令牌
    saveOAuth2Token(accessToken)
    
    toast.success('GitHub登录成功！')
    return true

  } catch (error) {
    console.error('OAuth2 callback error:', error)
    toast.error(`GitHub登录失败: ${error instanceof Error ? error.message : '未知错误'}`)
    return false
  }
}

/**
 * 检查是否有OAuth2认证
 */
export function hasOAuth2Auth(): boolean {
  return !!getOAuth2Token()
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<GitHubUser | null> {
  const token = await getOAuth2Token()
  if (!token) return null

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token过期，清除缓存
        clearOAuth2Token()
      }
      throw new Error(`Failed to get user info: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

/**
 * GitHub用户信息接口
 */
export interface GitHubUser {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  html_url: string
}
