// GitHub OAuth 登录 - 重定向到 GitHub
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
        try {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
                const clientId =
                        process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || ''
                const redirectUri = `${siteUrl}/api/auth/callback`

                if (!clientId) {
                        return NextResponse.redirect(`${siteUrl}?error=missing_github_client_id`)
                }

                const params = new URLSearchParams({
                        client_id: clientId,
                        redirect_uri: redirectUri,
                        scope: 'read:user user:email',
                })

                const url = `https://github.com/login/oauth/authorize?${params}`

                return NextResponse.redirect(url)
        } catch (error: any) {
                return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                })
        }
}
