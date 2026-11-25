import { useEffect, useState } from 'react'
import { useWriteStore } from '../stores/write-store'
import { toast } from 'sonner'

export function useLoadBlog(slug?: string) {
	const { loadBlogForEdit } = useWriteStore()
	const [hydrating, setHydrating] = useState(Boolean(slug))

	useEffect(() => {
		if (!slug) {
			setHydrating(false)
			return
		}

		let cancelled = false
		setHydrating(true)

		loadBlogForEdit(slug)
			.catch(err => {
				console.error('Failed to load blog:', err)
				toast.error('加载博客失败')
			})
			.finally(() => {
				if (!cancelled) setHydrating(false)
			})

		return () => {
			cancelled = true
		}
	}, [slug, loadBlogForEdit])

	return { loading: hydrating }
}
