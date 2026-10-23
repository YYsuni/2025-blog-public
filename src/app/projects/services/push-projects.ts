import { commitFiles, addHashedImage, fileTreeItem } from '@/lib/github-commit'
import type { TreeItem } from '@/lib/github-client'
import type { Project } from '../components/project-card'
import type { MediaItem } from '@/components/media-upload-dialog'
import { toast } from 'sonner'

export type PushProjectsParams = {
	projects: Project[]
	imageItems?: Map<string, MediaItem>
}

export async function pushProjects(params: PushProjectsParams): Promise<void> {
	const { projects, imageItems } = params

	await commitFiles({
		message: '更新项目列表',
		prepare: async ctx => {
			const treeItems: TreeItem[] = []
			const uploadedHashes = new Set<string>()
			let updatedProjects = [...projects]

			if (imageItems && imageItems.size > 0) {
				toast.info('正在上传图片...')
				for (const [url, imageItem] of imageItems.entries()) {
					if (imageItem.type !== 'file') continue

					const { publicPath, treeItem } = await addHashedImage(ctx, imageItem.file, 'images/project', uploadedHashes)
					if (treeItem) treeItems.push(treeItem)
					updatedProjects = updatedProjects.map(p => (p.url === url ? { ...p, image: publicPath } : p))
				}
			}

			const sha = await ctx.blobFromJson(updatedProjects)
			treeItems.push(fileTreeItem('src/app/projects/list.json', sha))
			return { treeItems }
		}
	})
}
