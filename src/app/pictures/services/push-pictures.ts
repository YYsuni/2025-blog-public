import { commitFiles, addHashedImage, fileTreeItem } from '@/lib/github-commit'
import { readTextFileFromRepo, type TreeItem } from '@/lib/github-client'
import type { MediaItem } from '@/components/media-upload-dialog'
import { toast } from 'sonner'
import { Picture } from '../page'

export type PushPicturesParams = {
	pictures: Picture[]
	imageItems?: Map<string, MediaItem>
}

function collectImageUrls(pictures: Picture[]): Set<string> {
	const urls = new Set<string>()
	for (const picture of pictures) {
		if (picture.image) urls.add(picture.image)
		picture.images?.forEach(url => urls.add(url))
	}
	return urls
}

export async function pushPictures(params: PushPicturesParams): Promise<void> {
	const { pictures, imageItems } = params

	await commitFiles({
		message: '更新图床列表',
		prepare: async ctx => {
			const treeItems: TreeItem[] = []
			const uploadedHashes = new Set<string>()
			let updatedPictures = [...pictures]

			if (imageItems && imageItems.size > 0) {
				toast.info('正在上传图片...')
				for (const [key, imageItem] of imageItems.entries()) {
					if (imageItem.type !== 'file') continue

					const { publicPath, treeItem } = await addHashedImage(ctx, imageItem.file, 'images/pictures', uploadedHashes)
					if (treeItem) treeItems.push(treeItem)

					const [groupId, indexStr] = key.split('::')
					const imageIndex = Number(indexStr) || 0

					updatedPictures = updatedPictures.map(p => {
						if (p.id !== groupId) return p

						const currentImages = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []
						const nextImages = currentImages.map((img, idx) => (idx === imageIndex ? publicPath : img))

						return { ...p, image: undefined, images: nextImages }
					})
				}
			}

			const currentImageUrls = collectImageUrls(updatedPictures)

			toast.info('正在检查需要删除的文件...')
			const previousListJson = await readTextFileFromRepo(ctx.token, ctx.owner, ctx.repo, 'src/app/pictures/list.json', ctx.branch)

			if (previousListJson) {
				try {
					const previousPictures: Picture[] = JSON.parse(previousListJson)
					const previousImageUrls = collectImageUrls(previousPictures)

					for (const url of previousImageUrls) {
						if (!currentImageUrls.has(url) && url.startsWith('/images/pictures/')) {
							const filename = url.replace('/images/pictures/', '')
							treeItems.push(fileTreeItem(`public/images/pictures/${filename}`, null))
						}
					}
				} catch (error) {
					console.error('Failed to parse previous list.json:', error)
				}
			}

			const sha = await ctx.blobFromJson(updatedPictures)
			treeItems.push(fileTreeItem('src/app/pictures/list.json', sha))
			return { treeItems }
		}
	})
}
