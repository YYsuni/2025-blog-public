import { commitFiles, fileTreeItem } from '@/lib/github-commit'
import { listRepoFilesRecursive } from '@/lib/github-client'
import { removeBlogFromIndex } from '@/lib/blog-index'
import { toast } from 'sonner'

export async function deleteBlog(slug: string): Promise<void> {
	if (!slug) throw new Error('需要 slug')

	await commitFiles({
		message: `删除文章: ${slug}`,
		successMessage: '删除成功！请等待页面部署后刷新',
		prepare: async ctx => {
			const basePath = `public/blogs/${slug}`

			toast.info('正在收集文章文件...')
			const files = await listRepoFilesRecursive(ctx.token, ctx.owner, ctx.repo, basePath, ctx.branch)
			if (files.length === 0) {
				throw new Error('文章不存在或已删除')
			}

			const treeItems = files.map(path => fileTreeItem(path, null))

			toast.info('正在更新索引...')
			const indexJson = await removeBlogFromIndex(ctx.token, ctx.owner, ctx.repo, slug, ctx.branch)
			treeItems.push(fileTreeItem('public/blogs/index.json', await ctx.blobFromText(indexJson)))

			return { treeItems }
		}
	})
}
