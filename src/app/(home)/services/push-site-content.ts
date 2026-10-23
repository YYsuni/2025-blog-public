import { commitFiles, fileTreeItem } from '@/lib/github-commit'
import type { TreeItem } from '@/lib/github-client'
import { fileToBase64NoPrefix } from '@/lib/file-utils'
import { toast } from 'sonner'
import type { SiteContent, CardStyles } from '../stores/config-store'
import type { FileItem, ArtImageUploads, SocialButtonImageUploads, BackgroundImageUploads } from '../config-dialog/site-settings'

type ArtImageConfig = SiteContent['artImages'][number]
type BackgroundImageConfig = SiteContent['backgroundImages'][number]

function toPublicRepoPath(url: string): string {
	const normalized = url.startsWith('/') ? url : `/${url}`
	return `public${normalized}`
}

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
	await commitFiles({
		message: '更新站点配置',
		successMessage: '保存成功！',
		prepare: async ctx => {
			const treeItems: TreeItem[] = []

			if (faviconItem?.type === 'file') {
				toast.info('正在上传 Favicon...')
				const sha = await ctx.blobFromBase64(await fileToBase64NoPrefix(faviconItem.file))
				treeItems.push(fileTreeItem('public/favicon.png', sha))
			}

			if (avatarItem?.type === 'file') {
				toast.info('正在上传 Avatar...')
				const sha = await ctx.blobFromBase64(await fileToBase64NoPrefix(avatarItem.file))
				treeItems.push(fileTreeItem('public/images/avatar.png', sha))
			}

			if (artImageUploads) {
				for (const [id, item] of Object.entries(artImageUploads)) {
					if (item.type !== 'file') continue
					const artConfig = siteContent.artImages?.find(art => art.id === id)
					if (!artConfig) continue

					const path = toPublicRepoPath(artConfig.url)
					if (!path) continue

					toast.info(`正在上传 Art 图片 ${id}...`)
					const sha = await ctx.blobFromBase64(await fileToBase64NoPrefix(item.file))
					treeItems.push(fileTreeItem(path, sha))
				}
			}

			if (removedArtImages?.length) {
				for (const art of removedArtImages) {
					treeItems.push(fileTreeItem(toPublicRepoPath(art.url), null))
				}
			}

			if (backgroundImageUploads) {
				for (const [id, item] of Object.entries(backgroundImageUploads)) {
					if (item.type !== 'file') continue
					const bgConfig = siteContent.backgroundImages?.find(bg => bg.id === id)
					if (!bgConfig?.url.startsWith('/images/background/')) continue

					const path = toPublicRepoPath(bgConfig.url)
					toast.info(`正在上传背景图片 ${id}...`)
					const sha = await ctx.blobFromBase64(await fileToBase64NoPrefix(item.file))
					treeItems.push(fileTreeItem(path, sha))
				}
			}

			if (removedBackgroundImages?.length) {
				for (const bg of removedBackgroundImages) {
					if (!bg.url.startsWith('/images/background/')) continue
					treeItems.push(fileTreeItem(toPublicRepoPath(bg.url), null))
				}
			}

			if (socialButtonImageUploads) {
				for (const [buttonId, item] of Object.entries(socialButtonImageUploads)) {
					if (item.type !== 'file') continue
					const button = siteContent.socialButtons?.find(btn => btn.id === buttonId)
					if (!button?.value.startsWith('/images/social-buttons/')) continue

					const path = toPublicRepoPath(button.value)
					toast.info(`正在上传社交按钮图片 ${buttonId}...`)
					const sha = await ctx.blobFromBase64(await fileToBase64NoPrefix(item.file))
					treeItems.push(fileTreeItem(path, sha))
				}
			}

			treeItems.push(fileTreeItem('src/config/site-content.json', await ctx.blobFromJson(siteContent)))
			treeItems.push(fileTreeItem('src/config/card-styles.json', await ctx.blobFromJson(cardStyles)))

			return { treeItems }
		}
	})
}
