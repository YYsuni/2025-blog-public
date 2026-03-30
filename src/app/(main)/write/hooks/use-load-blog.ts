import { useEffect } from 'react'
import { useWriteStore } from '../stores/write-store'
import { toast } from 'sonner'

export function useLoadBlog(slug?: string) {
	const { loadBlogForEdit, loading } = useWriteStore()

	useEffect(() => {
		if (slug) {
			loadBlogForEdit(slug).catch(err => {
				console.error('Failed to load blog:', err)
				toast.error('加载博客失败')
			})
		}
	}, [slug, loadBlogForEdit])

	return { loading }
}
