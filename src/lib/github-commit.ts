import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import {
	createBlob,
	createCommit,
	createTree,
	getRef,
	toBase64Utf8,
	updateRef,
	type TreeItem
} from '@/lib/github-client'
import { fileToBase64NoPrefix, hashFileSHA256 } from '@/lib/file-utils'
import { getFileExt } from '@/lib/utils'

export type CommitContext = {
	token: string
	owner: string
	repo: string
	branch: string
	/** Create a blob from base64 content, returns sha */
	blobFromBase64: (contentBase64: string) => Promise<string>
	/** Create a blob from UTF-8 text, returns sha */
	blobFromText: (text: string) => Promise<string>
	/** Create a blob from JSON (pretty-printed with tabs), returns sha */
	blobFromJson: (data: unknown, space?: string | number) => Promise<string>
}

export type CommitFilesOptions<T = void> = {
	message: string
	successMessage?: string
	prepare: (ctx: CommitContext) => Promise<{ treeItems: TreeItem[]; result?: T }>
}

/**
 * Shared GitHub commit pipeline:
 * getAuthToken → getRef → prepare tree → createTree → createCommit → updateRef
 */
export async function commitFiles<T = void>(options: CommitFilesOptions<T>): Promise<T> {
	const { message, successMessage = '发布成功！', prepare } = options
	const { OWNER: owner, REPO: repo, BRANCH: branch } = GITHUB_CONFIG

	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, owner, repo, `heads/${branch}`)
	const latestCommitSha = refData.sha

	const blobFromBase64 = async (contentBase64: string) => {
		const { sha } = await createBlob(token, owner, repo, contentBase64, 'base64')
		return sha
	}

	const blobFromText = async (text: string) => blobFromBase64(toBase64Utf8(text))

	const blobFromJson = async (data: unknown, space: string | number = '\t') =>
		blobFromText(JSON.stringify(data, null, space))

	const ctx: CommitContext = {
		token,
		owner,
		repo,
		branch,
		blobFromBase64,
		blobFromText,
		blobFromJson
	}

	toast.info('正在准备文件...')
	const { treeItems, result } = await prepare(ctx)

	toast.info('正在创建文件树...')
	const treeData = await createTree(token, owner, repo, treeItems, latestCommitSha)

	toast.info('正在创建提交...')
	const commitData = await createCommit(token, owner, repo, message, treeData.sha, [latestCommitSha])

	toast.info('正在更新分支...')
	await updateRef(token, owner, repo, `heads/${branch}`, commitData.sha)

	toast.success(successMessage)

	return result as T
}

export function fileTreeItem(path: string, sha: string | null): TreeItem {
	return { path, mode: '100644', type: 'blob', sha }
}

/**
 * Hash a local file, upload blob once per hash, return public URL + tree item.
 * `publicDir` is the path under /public, e.g. `images/share` → `/images/share/{hash}.ext`
 */
export async function addHashedImage(
	ctx: CommitContext,
	file: File,
	publicDir: string,
	uploadedHashes: Set<string>
): Promise<{ publicPath: string; treeItem: TreeItem | null; hash: string }> {
	const hash = await hashFileSHA256(file)
	const ext = getFileExt(file.name)
	const filename = `${hash}${ext}`
	const dir = publicDir.replace(/^\/+|\/+$/g, '')
	const publicPath = `/${dir}/${filename}`
	const repoPath = `public/${dir}/${filename}`

	if (uploadedHashes.has(hash)) {
		return { publicPath, treeItem: null, hash }
	}

	const contentBase64 = await fileToBase64NoPrefix(file)
	const sha = await ctx.blobFromBase64(contentBase64)
	uploadedHashes.add(hash)

	return {
		publicPath,
		treeItem: fileTreeItem(repoPath, sha),
		hash
	}
}
