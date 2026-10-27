import { commitFiles, addHashedImage, fileTreeItem } from '@/lib/github-commit'
import { prepareBlogsIndex } from '@/lib/blog-index'
import type { TreeItem } from '@/lib/github-client'
import type { ImageItem } from '../types'
import { toast } from 'sonner'
import { formatDateTimeLocal } from '../stores/write-store'
import { extractFirstH1, stripFirstH1 } from '../lib/md-title'

export type PushBlogParams = {
	form: {
		slug: string
		title: string
		md: string
		tags: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: ImageItem | null
	images?: ImageItem[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

export async function pushBlog(params: PushBlogParams): Promise<void> {
	const { form, cover, images, mode = 'create', originalSlug } = params

	if (!form?.slug) throw new Error('需要 slug')

	if (mode === 'edit' && originalSlug && originalSlug !== form.slug) {
		throw new Error('编辑模式下不支持修改 slug，请保持原 slug 不变')
	}

	const basePath = `public/blogs/${form.slug}`
	const commitMessage = mode === 'edit' ? `更新文章: ${form.slug}` : `新增文章: ${form.slug}`

	await commitFiles({
		message: commitMessage,
		prepare: async ctx => {
			const allLocalImages: Array<{ img: Extract<ImageItem, { type: 'file' }>; id: string }> = []

			for (const img of images || []) {
				if (img.type === 'file') allLocalImages.push({ img, id: img.id })
			}
			if (cover?.type === 'file') {
				allLocalImages.push({ img: cover, id: cover.id })
			}

			const uploadedHashes = new Set<string>()
			let mdToUpload = form.md
			let coverPath: string | undefined
			const treeItems: TreeItem[] = []
			const title = form.title || extractFirstH1(form.md)

			if (allLocalImages.length > 0) {
				toast.info('正在上传图片...')
				for (const { img, id } of allLocalImages) {
					const { publicPath, treeItem } = await addHashedImage(ctx, img.file, `blogs/${form.slug}`, uploadedHashes)
					if (treeItem) treeItems.push(treeItem)

					const placeholder = `local-image:${id}`
					mdToUpload = mdToUpload.split(`(${placeholder})`).join(`(${publicPath})`)

					if (cover?.type === 'file' && cover.id === id) {
						coverPath = publicPath
					}
				}
			}

			if (cover?.type === 'url') {
				coverPath = cover.url
			}

			// Keep published markdown consistent with existing posts: title lives in config
			mdToUpload = stripFirstH1(mdToUpload)

			toast.info('正在创建文件...')

			treeItems.push(fileTreeItem(`${basePath}/index.md`, await ctx.blobFromText(mdToUpload)))

			const dateStr = form.date || formatDateTimeLocal()
			const config = {
				title,
				tags: form.tags,
				date: dateStr,
				summary: form.summary,
				cover: coverPath,
				hidden: form.hidden,
				category: form.category
			}

			treeItems.push(fileTreeItem(`${basePath}/config.json`, await ctx.blobFromJson(config, 2)))

			const indexJson = await prepareBlogsIndex(
				ctx.token,
				ctx.owner,
				ctx.repo,
				{
					slug: form.slug,
					title,
					tags: form.tags,
					date: dateStr,
					summary: form.summary,
					cover: coverPath,
					hidden: form.hidden,
					category: form.category
				},
				ctx.branch
			)
			treeItems.push(fileTreeItem('public/blogs/index.json', await ctx.blobFromText(indexJson)))

			return { treeItems }
		}
	})
}
