import { commitFiles, addHashedImage, fileTreeItem } from '@/lib/github-commit'
import type { TreeItem } from '@/lib/github-client'
import type { Blogger } from '../grid-view'
import type { MediaItem } from '@/components/media-upload-dialog'
import { toast } from 'sonner'

export type PushBloggersParams = {
	bloggers: Blogger[]
	avatarItems?: Map<string, MediaItem>
}

export async function pushBloggers(params: PushBloggersParams): Promise<Blogger[]> {
	const { bloggers, avatarItems } = params
	const blobBloggers = bloggers.filter(b => b.avatar.startsWith('blob:'))
	if (blobBloggers.length > 0) {
		const missing = blobBloggers.filter(b => !avatarItems?.has(b.url))
		if (missing.length > 0) {
			throw new Error(`头像未上传完成：${missing.map(b => b.name).join('、')}`)
		}
	}

	return commitFiles<Blogger[]>({
		message: '更新博主列表',
		prepare: async ctx => {
			const treeItems: TreeItem[] = []
			const uploadedHashes = new Set<string>()
			let updatedBloggers = [...bloggers]

			if (avatarItems && avatarItems.size > 0) {
				toast.info('正在上传头像...')
				for (const [url, avatarItem] of avatarItems.entries()) {
					if (avatarItem.type !== 'file') continue

					const { publicPath, treeItem } = await addHashedImage(ctx, avatarItem.file, 'images/blogger', uploadedHashes)
					if (treeItem) treeItems.push(treeItem)
					updatedBloggers = updatedBloggers.map(b => (b.url === url ? { ...b, avatar: publicPath } : b))
				}
			}

			const sha = await ctx.blobFromJson(updatedBloggers)
			treeItems.push(fileTreeItem('src/app/bloggers/list.json', sha))
			return { treeItems, result: updatedBloggers }
		}
	})
}
