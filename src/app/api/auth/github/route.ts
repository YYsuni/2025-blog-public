// GitHub OAuth 登录 - 重定向到 GitHub
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
	try {
		const clientId = process.env.GITHUB_CLIENT_ID
		const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://0n0.uk'
		const redirectUri = `${siteUrl}/api/auth/callback`

		if (!clientId) {
			return new Response(JSON.stringify({ error: '缺少 GITHUB_CLIENT_ID 配置' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			scope: 'read:user user:email',
		})

		const url = `https://github.com/login/oauth/authorize?${params}`

		return new Response(null, {
			status: 302,
			headers: { Location: url },
		})
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}
}
