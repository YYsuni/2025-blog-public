import { toBase64Utf8, getRef, createTree, createCommit, updateRef, createBlob, type TreeItem } from '@/lib/github-client'
import { fileToBase64NoPrefix, hashFileSHA256 } from '@/lib/file-utils'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import type { Blogger } from '../grid-view'
import type { AvatarItem } from '../components/avatar-upload-dialog'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'

export type PushBloggersParams = {
	bloggers: Blogger[]
	avatarItems?: Map<string, AvatarItem>
}

export async function pushBloggers(params: PushBloggersParams): Promise<void> {
	const { bloggers, avatarItems } = params

	// 获取认证 token（自动从全局认证状态获取）
	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const commitMessage = `更新博主列表`

	toast.info('正在准备文件...')

	const treeItems: TreeItem[] = []
	const uploadedHashes = new Set<string>()
	let updatedBloggers = [...bloggers]

	// Process avatar uploads
	if (avatarItems && avatarItems.size > 0) {
		toast.info('正在上传头像...')
		for (const [url, avatarItem] of avatarItems.entries()) {
			if (avatarItem.type === 'file') {
				const hash = avatarItem.hash || (await hashFileSHA256(avatarItem.file))
				const ext = getFileExt(avatarItem.file.name)
				const filename = `${hash}${ext}`
				const publicPath = `/images/blogger/${filename}`

				if (!uploadedHashes.has(hash)) {
					const path = `public/images/blogger/${filename}`
					const contentBase64 = await fileToBase64NoPrefix(avatarItem.file)
					const blobData = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, contentBase64, 'base64')
					treeItems.push({
						path,
						mode: '100644',
						type: 'blob',
						sha: blobData.sha
					})
					uploadedHashes.add(hash)
				}

				// Update blogger avatar URL
				updatedBloggers = updatedBloggers.map(b => (b.url === url ? { ...b, avatar: publicPath } : b))
			}
		}
	}

	// Create blob for bloggers list.json
	const bloggersJson = JSON.stringify(updatedBloggers, null, '\t')
	const bloggersBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(bloggersJson), 'base64')
	treeItems.push({
		path: 'src/app/bloggers/list.json',
		mode: '100644',
		type: 'blob',
		sha: bloggersBlob.sha
	})

	// Create tree
	toast.info('正在创建文件树...')
	const treeData = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)

	// Create commit
	toast.info('正在创建提交...')
	const commitData = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, commitMessage, treeData.sha, [latestCommitSha])

	// Update branch reference
	toast.info('正在更新分支...')
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commitData.sha)

	toast.success('发布成功！')
}
