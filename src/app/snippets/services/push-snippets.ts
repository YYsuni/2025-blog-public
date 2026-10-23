import { commitFiles, fileTreeItem } from '@/lib/github-commit'

export type PushSnippetsParams = {
	snippets: string[]
}

export async function pushSnippets(params: PushSnippetsParams): Promise<void> {
	const { snippets } = params

	await commitFiles({
		message: '更新句子列表',
		prepare: async ctx => {
			const sha = await ctx.blobFromJson(snippets)
			return { treeItems: [fileTreeItem('src/app/snippets/list.json', sha)] }
		}
	})
}
