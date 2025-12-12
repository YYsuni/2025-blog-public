'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleOAuth2Callback } from '@/lib/oauth2-github'
import { useAuthStore } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Suspense } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOAuth2Auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // 处理OAuth错误
      if (errorParam) {
        setError(errorDescription || errorParam)
        toast.error(`GitHub授权失败: ${errorDescription || errorParam}`)
        setIsLoading(false)
        setTimeout(() => {
          router.push('/')
        }, 3000)
        return
      }

      // 检查必需参数
      if (!code || !state) {
        setError('缺少必需的授权参数')
        toast.error('授权参数不完整')
        setIsLoading(false)
        setTimeout(() => {
          router.push('/')
        }, 3000)
        return
      }

      // 处理OAuth回调
      const success = await handleOAuth2Callback(code, state)

      if (success) {
        // 设置OAuth2认证状态
        await setOAuth2Auth()
        toast.success('GitHub OAuth2 登录成功')
        // 登录成功，重定向到首页
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setError('登录失败，请重试')
        toast.error('登录失败，请重试')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      }

      setIsLoading(false)
    }

    handleCallback()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">正在处理GitHub登录...</h2>
          <p className="text-gray-600">请稍候，我们正在验证您的授权信息</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">登录失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">将在3秒后自动跳转到首页...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">登录成功！</h2>
        <p className="text-gray-600">正在跳转到首页...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}