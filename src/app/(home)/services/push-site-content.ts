import { toBase64Utf8, getRef, createTree, createCommit, updateRef, createBlob, type TreeItem } from '@/lib/github-client'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'sonner'
import { fileToBase64NoPrefix } from '@/lib/file-utils'
import type { SiteContent, CardStyles } from '../stores/config-store'
import type { FileItem, ArtImageUploads, SocialButtonImageUploads, BackgroundImageUploads } from '../config-dialog/site-settings'

type ArtImageConfig = SiteContent['artImages'][number]
type BackgroundImageConfig = SiteContent['backgroundImages'][number]

export async function pushSiteContent(
	siteContent: SiteContent,
	cardStyles: CardStyles,
	faviconItem?: FileItem | null,
	avatarItem?: FileItem | null,
	artImageUploads?: ArtImageUploads,
	removedArtImages?: ArtImageConfig[],
	backgroundImageUploads?: BackgroundImageUploads,
	removedBackgroundImages?: BackgroundImageConfig[],
	socialButtonImageUploads?: SocialButtonImageUploads
): Promise<void> {
	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const commitMessage = `更新站点配置`

	toast.info('正在准备文件...')

	const treeItems: TreeItem[] = []

	// Handle favicon upload
	if (faviconItem?.type === 'file') {
		toast.info('正在上传 Favicon...')
		const contentBase64 = await fileToBase64NoPrefix(faviconItem.file)
		const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
		treeItems.push({
			path: 'public/favicon.png',
			mode: '100644',
			type: 'blob',
			sha: blobData.sha
		})
	}

	// Handle avatar upload
	if (avatarItem?.type === 'file') {
		toast.info('正在上传 Avatar...')
		const contentBase64 = await fileToBase64NoPrefix(avatarItem.file)
		const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
		treeItems.push({
			path: 'public/images/avatar.png',
			mode: '100644',
			type: 'blob',
			sha: blobData.sha
		})
	}

	// Handle art images upload
	if (artImageUploads) {
		for (const [id, item] of Object.entries(artImageUploads)) {
			if (item.type !== 'file') continue

			const artConfig = siteContent.artImages?.find(art => art.id === id)
			if (!artConfig) continue

			// Ensure blob is saved under public directory while keeping URL as /images/...
			const normalizedUrlPath = artConfig.url.startsWith('/') ? artConfig.url : `/${artConfig.url}`
			const path = `public${normalizedUrlPath}`
			if (!path) continue

			toast.info(`正在上传 Art 图片 ${id}...`)
			const contentBase64 = await fileToBase64NoPrefix(item.file)
			const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
			treeItems.push({
				path,
				mode: '100644',
				type: 'blob',
				sha: blobData.sha
			})
		}
	}

	// Handle art images deletion
	if (removedArtImages && removedArtImages.length > 0) {
		for (const art of removedArtImages) {
			const normalizedUrlPath = art.url.startsWith('/') ? art.url : `/${art.url}`
			const path = `public${normalizedUrlPath}`
			treeItems.push({
				path,
				mode: '100644',
				type: 'blob',
				sha: null
			})
		}
	}

	// Handle background images upload
	if (backgroundImageUploads) {
		for (const [id, item] of Object.entries(backgroundImageUploads)) {
			if (item.type !== 'file') continue

			const bgConfig = siteContent.backgroundImages?.find(bg => bg.id === id)
			if (!bgConfig) continue

			// Only upload if URL starts with /images/background/ (local file)
			if (!bgConfig.url.startsWith('/images/background/')) continue

			const normalizedUrlPath = bgConfig.url.startsWith('/') ? bgConfig.url : `/${bgConfig.url}`
			const path = `public${normalizedUrlPath}`
			if (!path) continue

			toast.info(`正在上传背景图片 ${id}...`)
			const contentBase64 = await fileToBase64NoPrefix(item.file)
			const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
			treeItems.push({
				path,
				mode: '100644',
				type: 'blob',
				sha: blobData.sha
			})
		}
	}

	// Handle background images deletion
	if (removedBackgroundImages && removedBackgroundImages.length > 0) {
		for (const bg of removedBackgroundImages) {
			// Only delete if URL starts with /images/background/ (local file)
			if (!bg.url.startsWith('/images/background/')) continue

			const normalizedUrlPath = bg.url.startsWith('/') ? bg.url : `/${bg.url}`
			const path = `public${normalizedUrlPath}`
			treeItems.push({
				path,
				mode: '100644',
				type: 'blob',
				sha: null
			})
		}
	}

	// Handle social button images upload
	if (socialButtonImageUploads) {
		for (const [buttonId, item] of Object.entries(socialButtonImageUploads)) {
			if (item.type !== 'file') continue

			const button = siteContent.socialButtons?.find(btn => btn.id === buttonId)
			if (!button) continue

			// Only upload if URL starts with /images/social-buttons/ (local file)
			if (!button.value.startsWith('/images/social-buttons/')) continue

			const normalizedUrlPath = button.value.startsWith('/') ? button.value : `/${button.value}`
			const path = `public${normalizedUrlPath}`
			if (!path) continue

			toast.info(`正在上传社交按钮图片 ${buttonId}...`)
			const contentBase64 = await fileToBase64NoPrefix(item.file)
			const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
			treeItems.push({
				path,
				mode: '100644',
				type: 'blob',
				sha: blobData.sha
			})
		}
	}

	// Handle site content JSON
	const siteContentJson = JSON.stringify(siteContent, null, '\t')
	const siteContentBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(siteContentJson), 'base64')
	treeItems.push({
		path: 'src/config/site-content.json',
		mode: '100644',
		type: 'blob',
		sha: siteContentBlob.sha
	})

	// Handle card styles JSON
	const cardStylesJson = JSON.stringify(cardStyles, null, '\t')
	const cardStylesBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(cardStylesJson), 'base64')
	treeItems.push({
		path: 'src/config/card-styles.json',
		mode: '100644',
		type: 'blob',
		sha: cardStylesBlob.sha
	})

	toast.info('正在创建文件树...')
	const treeData = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)

	toast.info('正在创建提交...')
	const commitData = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, commitMessage, treeData.sha, [latestCommitSha])

	toast.info('正在更新分支...')
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commitData.sha)

	toast.success('保存成功！')
}
