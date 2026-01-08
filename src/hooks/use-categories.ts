'use client'

import useSWR from 'swr'

export type CategoriesConfig = {
	categories: string[]
}

const fetcher = async (url: string): Promise<CategoriesConfig> => {
	const res = await fetch(url, { cache: 'no-store' })
	if (!res.ok) {
		return { categories: [] }
	}
	const data = await res.json()
	if (Array.isArray(data)) {
		return { categories: data.filter((item): item is string => typeof item === 'string') }
	}
	if (Array.isArray((data as any)?.categories)) {
		return { categories: (data as any).categories.filter((item: unknown): item is string => typeof item === 'string') }
	}
	return { categories: [] }
}

export function useCategories() {
	const { data, error, isLoading } = useSWR<CategoriesConfig>('/blogs/categories.json', fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true
	})

	return {
		categories: data?.categories ?? [],
		loading: isLoading,
		error
	}
}

