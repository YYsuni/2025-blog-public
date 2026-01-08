import { create } from 'zustand'
import { toast } from 'sonner'
import { hashFileSHA256 } from '@/lib/file-utils'
import { loadBlog } from '@/lib/load-blog'
import type { PublishForm, ImageItem } from '../types'

export const formatDateTimeLocal = (date: Date = new Date()): string => {
	const pad = (n: number) => String(n).padStart(2, '0')
	const year = date.getFullYear()
	const month = pad(date.getMonth() + 1)
	const day = pad(date.getDate())
	const hours = pad(date.getHours())
	const minutes = pad(date.getMinutes())
	return `${year}-${month}-${day}T${hours}:${minutes}`
}

type WriteStore = {
	// Mode state
	mode: 'create' | 'edit'
	originalSlug: string | null
	setMode: (mode: 'create' | 'edit', originalSlug?: string) => void

	// Form state
	form: PublishForm
	updateForm: (updates: Partial<PublishForm>) => void
	setForm: (form: PublishForm) => void

	// Image state
	images: ImageItem[]
	addUrlImage: (url: string) => void
	addFiles: (files: FileList | File[]) => Promise<ImageItem[]>
	deleteImage: (id: string) => void

	// Cover state
	cover: ImageItem | null
	setCover: (cover: ImageItem | null) => void

	// Publish state
	loading: boolean
	setLoading: (loading: boolean) => void

	// Load blog for editing
	loadBlogForEdit: (slug: string) => Promise<void>

	// Reset to create mode
	reset: () => void
}

const initialForm: PublishForm = {
	slug: '',
	title: '',
	md: '',
	tags: [],
	date: formatDateTimeLocal(),
	summary: '',
	hidden: false,
	category: ''
}

export const useWriteStore = create<WriteStore>((set, get) => ({
	// Mode state
	mode: 'create',
	originalSlug: null,
	setMode: (mode, originalSlug) => set({ mode, originalSlug: originalSlug || null }),

	// Form state
	form: { ...initialForm },
	updateForm: updates => set(state => ({ form: { ...state.form, ...updates } })),
	setForm: form => set({ form }),

	// Image state
	images: [],
	addUrlImage: url => {
		const { images } = get()
		const exists = images.some(it => it.type === 'url' && it.url === url)
		if (exists) {
			toast.info('该图片已在列表中')
			return
		}
		const id = Math.random().toString(36).slice(2, 10)
		set(state => ({ images: [{ id, type: 'url', url }, ...state.images] }))
	},
	addFiles: async (files: FileList | File[]) => {
		const { images } = get()
		const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
		if (arr.length === 0) return []

		const existingHashes = new Map<string, ImageItem>(
			images
				.filter((it): it is Extract<ImageItem, { type: 'file'; hash?: string }> => it.type === 'file' && (it as any).hash)
				.map(it => [(it as any).hash as string, it])
		)

		const computed = await Promise.all(
			arr.map(async file => {
				const hash = await hashFileSHA256(file)
				return { file, hash }
			})
		)

		const seen = new Set<string>()
		const unique = computed.filter(({ hash }) => {
			if (existingHashes.has(hash)) return false
			if (seen.has(hash)) return false
			seen.add(hash)
			return true
		})

		const resultImages: ImageItem[] = []

		// 处理已存在的图片
		for (const { hash } of computed) {
			if (existingHashes.has(hash)) {
				resultImages.push(existingHashes.get(hash)!)
			}
		}

		// 处理新图片
		if (unique.length > 0) {
			const newItems: ImageItem[] = unique.map(({ file, hash }) => {
				const id = Math.random().toString(36).slice(2, 10)
				const previewUrl = URL.createObjectURL(file)
				const filename = file.name
				return { id, type: 'file', file, previewUrl, filename, hash }
			})

			set(state => ({ images: [...newItems, ...state.images] }))
			resultImages.push(...newItems)
		} else if (resultImages.length === 0) {
			toast.info('图片已存在，不重复添加')
		}

		return resultImages
	},
	deleteImage: id =>
		set(state => {
			for (const it of state.images) {
				if (it.type === 'file' && it.id === id) {
					URL.revokeObjectURL(it.previewUrl)

					if (it.id === state.cover?.id) {
						set({ cover: null })
					}
				}
			}
			return { images: state.images.filter(it => it.id !== id) }
		}),

	// Cover state
	cover: null,
	setCover: cover => set({ cover }),

	// Publish state
	loading: false,
	setLoading: loading => set({ loading }),

	// Load blog for editing
	loadBlogForEdit: async (slug: string) => {
		try {
			set({ loading: true })
			const blog = await loadBlog(slug)

			// Parse images from markdown
			const images: ImageItem[] = []
			const imageRegex = /!\[.*?\]\((.*?)\)/g
			let match
			while ((match = imageRegex.exec(blog.markdown)) !== null) {
				const url = match[1]
				// Skip cover image and only collect content images
				if (url && url !== blog.cover && !url.startsWith('local-image:')) {
					// Check if already added
					if (!images.some(img => img.type === 'url' && img.url === url)) {
						const id = Math.random().toString(36).slice(2, 10)
						images.push({ id, type: 'url', url })
					}
				}
			}

			// Set cover
			let cover: ImageItem | null = null
			if (blog.cover) {
				const coverId = Math.random().toString(36).slice(2, 10)
				cover = { id: coverId, type: 'url', url: blog.cover }
			}

			// Set form
			set({
				mode: 'edit',
				originalSlug: slug,
				form: {
					slug,
					title: blog.config.title || '',
					md: blog.markdown,
					tags: blog.config.tags || [],
					date: blog.config.date ? formatDateTimeLocal(new Date(blog.config.date)) : formatDateTimeLocal(),
					summary: blog.config.summary || '',
					hidden: blog.config.hidden || false,
					category: blog.config.category || ''
				},
				images,
				cover,
				loading: false
			})

			toast.success('博客加载成功')
		} catch (err: any) {
			console.error('Failed to load blog:', err)
			toast.error(err?.message || '加载博客失败')
			set({ loading: false })
			throw err
		}
	},

	// Reset to create mode
	reset: () => {
		// Revoke object URLs
		const { images, cover } = get()
		for (const img of images) {
			if (img.type === 'file') {
				URL.revokeObjectURL(img.previewUrl)
			}
		}
		if (cover?.type === 'file') {
			URL.revokeObjectURL(cover.previewUrl)
		}

		set({
			mode: 'create',
			originalSlug: null,
			form: { ...initialForm, date: formatDateTimeLocal() },
			images: [],
			cover: null
		})
	}
}))
