'use client'

import { useState, useEffect } from 'react'
import { initiateGitHubOAuth2, getCurrentUser, clearOAuth2Token } from '@/lib/oauth2-github'
import { useAuthStore } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function OAuth2LoginButton() {
  const isOAuth2Auth = useAuthStore((state) => state.isOAuth2Auth)
  const { clearAuth } = useAuthStore()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (isOAuth2Auth) {
      getCurrentUser().then(setUser)
    }
  }, [isOAuth2Auth])

  const handleLogout = () => {
    clearAuth()
    clearOAuth2Token()
    setUser(null)
    toast.success('已退出GitHub OAuth2登录')
  }

  if (isOAuth2Auth) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.login || 'User avatar'}
            className="w-8 h-8 rounded-full border-2 border-green-300"
          />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-green-900">
            ✅ 已通过 GitHub OAuth2 登录
          </div>
          {user?.login && (
            <div className="text-xs text-green-700">@{user.login}</div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
        >
          退出
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => initiateGitHubOAuth2()}
      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      使用 GitHub OAuth2 登录
    </button>
  )
}