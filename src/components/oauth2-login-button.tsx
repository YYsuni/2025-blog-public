'use client'

import { useState } from 'react'
import { initiateGitHubOAuth2 } from '@/lib/oauth2-github'
import { useAuthStore } from '@/hooks/use-auth'
import { Github } from 'lucide-react'

export function OAuth2LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { authMethod, currentUser, clearAuth } = useAuthStore()

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      initiateGitHubOAuth2()
    } catch (error) {
      console.error('OAuth2 login failed:', error)
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
  }

  if (authMethod === 'oauth2' && currentUser) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <img 
          src={currentUser.avatar_url} 
          alt={currentUser.login}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">
            {currentUser.name || currentUser.login}
          </p>
          <p className="text-xs text-green-700">GitHub OAuth2 已登录</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          退出
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center gap-2 w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Github className="w-4 h-4" />
      {isLoading ? '正在跳转...' : '使用 GitHub 登录'}
    </button>
  )
}
