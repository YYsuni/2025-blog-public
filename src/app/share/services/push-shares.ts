import { commitFiles, addHashedImage, fileTreeItem, type CommitContext } from '@/lib/github-commit'
import type { TreeItem } from '@/lib/github-client'
import type { Share } from '../components/share-card'
import type { MediaItem } from '@/components/media-upload-dialog'
import { toast } from 'sonner'

export type PushSharesParams = {
	shares: Share[]
	logoItems?: Map<string, MediaItem>
}

async function uploadLogos(
	ctx: CommitContext,
	shares: Share[],
	logoItems: Map<string, MediaItem> | undefined
): Promise<{ updatedShares: Share[]; treeItems: TreeItem[] }> {
	const treeItems: TreeItem[] = []
	const uploadedHashes = new Set<string>()
	let updatedShares = [...shares]

	if (!logoItems || logoItems.size === 0) {
		return { updatedShares, treeItems }
	}

	toast.info('正在上传图标...')
	for (const [url, logoItem] of logoItems.entries()) {
		if (logoItem.type !== 'file') continue

		const { publicPath, treeItem } = await addHashedImage(ctx, logoItem.file, 'images/share', uploadedHashes)
		if (treeItem) treeItems.push(treeItem)
		updatedShares = updatedShares.map(s => (s.url === url ? { ...s, logo: publicPath } : s))
	}

	return { updatedShares, treeItems }
}

export async function pushShares(params: PushSharesParams): Promise<Share[]> {
	const { shares, logoItems } = params

	const blobShares = shares.filter(s => s.logo.startsWith('blob:'))
	if (blobShares.length > 0) {
		const missing = blobShares.filter(s => !logoItems?.has(s.url))
		if (missing.length > 0) {
			throw new Error(`图标未上传完成：${missing.map(s => s.name).join('、')}`)
		}
	}

	return commitFiles<Share[]>({
		message: '更新分享列表',
		prepare: async ctx => {
			const { updatedShares, treeItems } = await uploadLogos(ctx, shares, logoItems)
			const sha = await ctx.blobFromJson(updatedShares)
			treeItems.push(fileTreeItem('src/app/share/list.json', sha))
			return { treeItems, result: updatedShares }
		}
	})
}
