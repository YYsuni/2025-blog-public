import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const clientId = process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:2025'}/auth/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 500 }
      )
    }

    // 交换授权码获取访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      })
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token
    if (!accessToken) {
      throw new Error('No access token received')
    }

    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    return NextResponse.json({
      success: true,
      access_token: accessToken,
      user: userData
    })

  } catch (error) {
    console.error('OAuth2 callback error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
