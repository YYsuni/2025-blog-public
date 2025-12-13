import { toBase64Utf8, getRef, createTree, createCommit, updateRef, createBlob, readTextFileFromRepo, type TreeItem } from '@/lib/github-client'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { toast } from 'sonner'

export interface MusicItem {
	name: string
	iframe: string
}

export interface MusicPlaylist {
	songs: MusicItem[]
	lastUpdated: string
}

export async function pushMusicPlaylist(playlist: MusicPlaylist): Promise<void> {
	const token = await getAuthToken()

	toast.info('正在获取分支信息...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const commitMessage = `更新音乐播放列表`

	toast.info('正在准备文件...')

	const treeItems: TreeItem[] = []

	// 创建更新后的播放列表 JSON
	const playlistJson = JSON.stringify(playlist, null, '\t')
	const playlistBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(playlistJson), 'base64')
	treeItems.push({
		path: 'public/music/user-playlist.json',
		mode: '100644',
		type: 'blob',
		sha: playlistBlob.sha
	})

	toast.info('正在创建文件树...')
	const treeData = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)

	toast.info('正在创建提交...')
	const commitData = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, commitMessage, treeData.sha, [latestCommitSha])

	toast.info('正在更新分支...')
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commitData.sha)

	toast.success('音乐播放列表保存成功！')
}

export async function loadMusicPlaylist(): Promise<MusicPlaylist | null> {
	const token = await getAuthToken()

	try {
		const playlistJson = await readTextFileFromRepo(
			token,
			GITHUB_CONFIG.OWNER,
			GITHUB_CONFIG.REPO,
			'public/music/user-playlist.json',
			GITHUB_CONFIG.BRANCH
		)

		if (playlistJson) {
			return JSON.parse(playlistJson) as MusicPlaylist
		}
	} catch (error) {
		console.error('Failed to load music playlist:', error)
	}

	return null
}
