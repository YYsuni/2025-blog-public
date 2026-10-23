import { commitFiles, fileTreeItem } from '@/lib/github-commit'
import { listRepoFilesRecursive, type TreeItem } from '@/lib/github-client'
import { removeBlogsFromIndex } from '@/lib/blog-index'
import { toast } from 'sonner'

export async function batchDeleteBlogs(slugs: string[]): Promise<void> {
	const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)))
	if (uniqueSlugs.length === 0) {
		throw new Error('需要至少选择一篇文章')
	}

	const commitLabel = uniqueSlugs.length === 1 ? `删除文章: ${uniqueSlugs[0]}` : `批量删除文章: ${uniqueSlugs.join(', ')}`

	await commitFiles({
		message: commitLabel,
		successMessage: '删除成功！请等待页面部署后刷新',
		prepare: async ctx => {
			const treeItems: TreeItem[] = []

			for (const slug of uniqueSlugs) {
				toast.info(`正在收集 ${slug} 文件...`)
				const files = await listRepoFilesRecursive(ctx.token, ctx.owner, ctx.repo, `public/blogs/${slug}`, ctx.branch)
				for (const path of files) {
					treeItems.push(fileTreeItem(path, null))
				}
			}

			toast.info('正在更新索引...')
			const indexJson = await removeBlogsFromIndex(ctx.token, ctx.owner, ctx.repo, uniqueSlugs, ctx.branch)
			treeItems.push(fileTreeItem('public/blogs/index.json', await ctx.blobFromText(indexJson)))

			return { treeItems }
		}
	})
}
