import { commitFiles, fileTreeItem } from '@/lib/github-commit'
import { listRepoFilesRecursive, type TreeItem } from '@/lib/github-client'
import type { BlogIndexItem } from '@/lib/blog-index'
import { toast } from 'sonner'

export async function saveBlogEdits(originalItems: BlogIndexItem[], nextItems: BlogIndexItem[], categories: string[]): Promise<void> {
	const removedSlugs = originalItems.filter(item => !nextItems.some(next => next.slug === item.slug)).map(item => item.slug)
	const uniqueRemoved = Array.from(new Set(removedSlugs.filter(Boolean)))
	const uniqueCategories = Array.from(new Set(categories.map(c => c.trim()).filter(Boolean)))

	const actionLabels: string[] = []
	if (uniqueRemoved.length > 0) actionLabels.push(`删除:${uniqueRemoved.join(',')}`)
	actionLabels.push('更新索引')
	if (uniqueCategories.length > 0) actionLabels.push('更新分类')

	await commitFiles({
		message: actionLabels.join(' | '),
		successMessage: '保存成功！请等待页面部署后刷新',
		prepare: async ctx => {
			const treeItems: TreeItem[] = []

			for (const slug of uniqueRemoved) {
				toast.info(`正在收集 ${slug} 文件...`)
				const files = await listRepoFilesRecursive(ctx.token, ctx.owner, ctx.repo, `public/blogs/${slug}`, ctx.branch)
				for (const path of files) {
					treeItems.push(fileTreeItem(path, null))
				}
			}

			toast.info('正在更新索引...')
			const sortedItems = [...nextItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			treeItems.push(fileTreeItem('public/blogs/index.json', await ctx.blobFromJson(sortedItems, 2)))

			toast.info('正在更新分类...')
			treeItems.push(fileTreeItem('public/blogs/categories.json', await ctx.blobFromJson({ categories: uniqueCategories }, 2)))

			return { treeItems }
		}
	})
}
