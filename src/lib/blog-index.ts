'use client'

import { putFile, toBase64Utf8, readTextFileFromRepo } from '@/lib/github-client'

const ADMIN_INDEX_PATH = 'public/blogs/index-admin.json'
const PUBLIC_INDEX_PATH = 'public/blogs/index.json'

export type BlogIndexItem = {
    slug: string
    title: string
    tags: string[]
    date: string
    summary?: string
    cover?: string
    hidden?: boolean
}

export async function upsertBlogsIndex(token: string, owner: string, repo: string, item: BlogIndexItem, branch: string): Promise<void> {
    const indexPath = 'public/blogs/index.json'
    let list: BlogIndexItem[] = []
    try {
        const txt = await readTextFileFromRepo(token, owner, repo, indexPath, branch)
        if (txt) list = JSON.parse(txt)
    } catch {
        // ignore parse errors and start from empty list
    }
    const map = new Map<string, BlogIndexItem>(list.map(i => [i.slug, i]))
    map.set(item.slug, item)
    const next = Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    const base64 = toBase64Utf8(JSON.stringify(next, null, 2))
    await putFile(token, owner, repo, indexPath, base64, 'Update blogs index', branch)
}

export async function prepareDualBlogsIndex(
    token: string,
    owner: string,
    repo: string,
    item: BlogIndexItem,
    branch: string
): Promise<{ adminJson: string, publicJson: string }> {
    let list: BlogIndexItem[] = []

    list = await readAdminIndexJson()

    // 更新列表 (全量)
    const map = new Map<string, BlogIndexItem>(list.map(i => [i.slug, i]))
    map.set(item.slug, item)
    const nextFullList = Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    // 生成公开列表 (过滤掉 hidden 为 true 的文章)
    const nextPublicList = nextFullList.filter(i => !i.hidden)

    return {
        adminJson: JSON.stringify(nextFullList, null, 2),
        publicJson: JSON.stringify(nextPublicList, null, 2)
    }
}

export async function readAdminIndexJson() {
    let list: BlogIndexItem[] = []
    const adminIndexPath = '/blogs/index-admin.json'
    const publicIndexPath = '/blogs/index.json'

    let txt = await readTextFileFromUrl(adminIndexPath)

    // 【关键修复】如果 Admin 索引不存在 (返回 null)，说明是第一次使用或还没生成
    // 必须强制去读取旧的 Public 索引，否则旧文章会丢失！
    if (!txt) {
        try {
            console.log('Admin index not found, falling back to public index...')
            txt = await readTextFileFromUrl(publicIndexPath)
        } catch (e) {
            console.error('Failed to read public index:', e)
        }
    }

    if (txt) {
        try {
            list = JSON.parse(txt)
        } catch (e) {
            console.error('Failed to parse index json:', e)
        }
    }
    return list
}

export async function readTextFileFromUrl(url: string): Promise<string | null> {
    const res = await fetch(url, {
        headers: {
            Accept: 'application/json',
        }
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`read file failed: ${res.status}`)
    const data: any = await res.json()
    if (Array.isArray(data) || !data.content) return null
    try {
        return decodeURIComponent(escape(atob(data.content)))
    } catch {
        return atob(data.content)
    }
}

export async function removeBlogsFromIndex(token: string, owner: string, repo: string, slugs: string[], branch: string): Promise<string> {
    const indexPath = 'public/blogs/index.json'
    let list: BlogIndexItem[] = []
    try {
        const txt = await readTextFileFromRepo(token, owner, repo, indexPath, branch)
        if (txt) list = JSON.parse(txt)
    } catch {
        // ignore parse errors and keep empty list
    }
    const slugSet = new Set(slugs.filter(Boolean))
    if (slugSet.size === 0) {
        return JSON.stringify(list, null, 2)
    }
    const next = list.filter(item => !slugSet.has(item.slug))
    return JSON.stringify(next, null, 2)
}

export async function removeBlogFromIndex(token: string, owner: string, repo: string, slug: string, branch: string): Promise<string> {
    return removeBlogsFromIndex(token, owner, repo, [slug], branch)
}