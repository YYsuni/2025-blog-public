import { toBase64Utf8, getRef, createTree, createCommit, updateRef, createBlob, readTextFileFromRepo, type TreeItem } from '@/lib/github-client'
import { fileToBase64NoPrefix, hashFileSHA256 } from '@/lib/file-utils'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import type { ImageItem } from '../../projects/components/image-upload-dialog'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'
import { Picture } from '../page'

export type PushPicturesParams = {
	pictures: Picture[]
	imageItems?: Map<string, ImageItem>
}

export async function pushPictures(params: PushPicturesParams): Promise<void> {
	const { pictures, imageItems } = params

	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const commitMessage = `更新图床列表`

	toast.info('正在准备文件...')

	const treeItems: TreeItem[] = []
	const uploadedHashes = new Set<string>()
	let updatedPictures = [...pictures]

	if (imageItems && imageItems.size > 0) {
		toast.info('正在上传图片...')
		for (const [key, imageItem] of imageItems.entries()) {
			if (imageItem.type === 'file') {
				const hash = imageItem.hash || (await hashFileSHA256(imageItem.file))
				const ext = getFileExt(imageItem.file.name)
				const filename = `${hash}${ext}`
				const publicPath = `/images/pictures/${filename}`

				if (!uploadedHashes.has(hash)) {
					const path = `public/images/pictures/${filename}`
					const contentBase64 = await fileToBase64NoPrefix(imageItem.file)
					const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
					treeItems.push({
						path,
						mode: '100644',
						type: 'blob',
						sha: blobData.sha
					})
					uploadedHashes.add(hash)
				}

				const [groupId, indexStr] = key.split('::')
				const imageIndex = Number(indexStr) || 0

				updatedPictures = updatedPictures.map(p => {
					if (p.id !== groupId) return p

					const currentImages = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []

					const nextImages = currentImages.map((img, idx) => (idx === imageIndex ? publicPath : img))

					return {
						...p,
						image: undefined,
						images: nextImages
					}
				})
			}
		}
	}

	// 收集当前所有使用的图片 URL
	const currentImageUrls = new Set<string>()
	for (const picture of updatedPictures) {
		if (picture.image) {
			currentImageUrls.add(picture.image)
		}
		if (picture.images && picture.images.length > 0) {
			picture.images.forEach(url => currentImageUrls.add(url))
		}
	}

	// 读取之前的 list.json，找出不再使用的图片文件
	toast.info('正在检查需要删除的文件...')
	const previousListJson = await readTextFileFromRepo(
		token,
		GITHUB_CONFIG.OWNER,
		GITHUB_CONFIG.REPO,
		'src/app/pictures/list.json',
		GITHUB_CONFIG.BRANCH
	)

	if (previousListJson) {
		try {
			const previousPictures: Picture[] = JSON.parse(previousListJson)
			const previousImageUrls = new Set<string>()
			
			for (const picture of previousPictures) {
				if (picture.image) {
					previousImageUrls.add(picture.image)
				}
				if (picture.images && picture.images.length > 0) {
					picture.images.forEach(url => previousImageUrls.add(url))
				}
			}

			// 找出不再使用的图片 URL
			for (const url of previousImageUrls) {
				if (!currentImageUrls.has(url) && url.startsWith('/images/pictures/')) {
					// 这是一个本地图片文件，需要删除
					const filename = url.replace('/images/pictures/', '')
					const path = `public/images/pictures/${filename}`
					treeItems.push({
						path,
						mode: '100644',
						type: 'blob',
						sha: null
					})
				}
			}
		} catch (error) {
			console.error('Failed to parse previous list.json:', error)
		}
	}

	const picturesJson = JSON.stringify(updatedPictures, null, '\t')
	const picturesBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(picturesJson), 'base64')
	treeItems.push({
		path: 'src/app/pictures/list.json',
		mode: '100644',
		type: 'blob',
		sha: picturesBlob.sha
	})

	toast.info('正在创建文件树...')
	const treeData = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)

	toast.info('正在创建提交...')
	const commitData = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, commitMessage, treeData.sha, [latestCommitSha])

	toast.info('正在更新分支...')
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commitData.sha)

	toast.success('发布成功！')
}
