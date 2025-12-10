import useSWR from 'swr'
import { useAuthStore } from '@/hooks/use-auth'

// 保持类型同步
export type BlogIndexItem = {
    slug: string
    title: string
    tags: string[]
    date: string
    summary?: string
    cover?: string
    hidden?: boolean
}

// 改进 fetcher，抛出状态码以便处理 404
const fetcher = async (url: string) => {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
        const error: any = new Error('Fetch failed')
        error.status = res.status
        throw error
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
}

export function useBlogIndex() {
    const { isAuth } = useAuthStore()

    const adminUrl = '/blogs/index-admin.json'
    const publicUrl = '/blogs/index.json'

    // 1. 始终尝试读取 Public 数据 (作为保底)
    const publicSWR = useSWR<BlogIndexItem[]>(publicUrl, fetcher)

    // 2. 只有认证通过时，才尝试读取 Admin 数据
    // shouldRetryOnError: false 避免 404 时一直重试
    const adminSWR = useSWR<BlogIndexItem[]>(
        isAuth ? adminUrl : null, 
        fetcher,
        { shouldRetryOnError: false }
    )

    // 3. 智能判定逻辑
    let finalItems: BlogIndexItem[] = []
    let finalLoading = true
    
    if (isAuth) {
        if (adminSWR.data) {
            // Admin 文件存在 -> 用 Admin 数据
            finalItems = adminSWR.data
            finalLoading = false
        } else if (adminSWR.error?.status === 404) {
            // Admin 文件不存在 (还没生成) -> 降级使用 Public 数据
            finalItems = publicSWR.data || []
            finalLoading = publicSWR.isLoading
        } else {
            // 加载中... 优先显示 Public 防止白屏
            finalLoading = adminSWR.isLoading
            if (publicSWR.data) finalItems = publicSWR.data
        }
    } else {
        // 普通访客 -> 直接用 Public 数据
        finalItems = publicSWR.data || []
        finalLoading = publicSWR.isLoading
    }

    return {
        items: finalItems,
        loading: finalLoading,
        // 只有当真正的错误发生时才报错 (忽略 Admin 的 404)
        error: isAuth ? (adminSWR.error && adminSWR.error.status !== 404 ? adminSWR.error : publicSWR.error) : publicSWR.error
    }
}

export function useLatestBlog() {
	const { items, loading, error } = useBlogIndex()

	const latestBlog = items.length > 0 ? items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null

	return {
		blog: latestBlog,
		loading,
		error
	}
}
