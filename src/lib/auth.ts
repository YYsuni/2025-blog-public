import { createInstallationToken, getInstallationId, signAppJwt } from './github-client'
import { GITHUB_CONFIG } from '@/consts'
import { useAuthStore } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { decrypt,encrypt } from './aes256-util'
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
const GITHUB_TOKEN_CACHE_KEY = 'github_token'
const GITHUB_PEM_CACHE_KEY = 'p_info'

function getAllowedGitHubUsers() {
  return (process.env.AUTH_GITHUB_ALLOWED_USERS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

const allowedGitHubUsers = getAllowedGitHubUsers();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubLogin: profile.login,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/forbidden",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "github") return false;
      if (!profile) return false;

      const githubLogin =
        typeof (profile as { login?: unknown }).login === "string"
          ? (profile as { login: string }).login.toLowerCase()
          : "";

      if (!githubLogin) return false;

      return allowedGitHubUsers.includes(githubLogin);
    },

    async jwt({ token, user, profile }) {
      if (user && "githubLogin" in user) {
        token.githubLogin = String(user.githubLogin);
      }

      if (profile && typeof (profile as { login?: unknown }).login === "string") {
        token.githubLogin = (profile as { login: string }).login;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.githubLogin =
          typeof token.githubLogin === "string" ? token.githubLogin : undefined;
      }
      return session;
    },

    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      const publicPaths = ["/sign-in", "/forbidden"];
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );

      const isAuthApi = pathname.startsWith("/api/auth");

      const isPublicAsset =
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/i.test(pathname);

      if (isAuthApi || isPublicAsset || isPublicPath) {
        return true;
      }

      return !!auth;
    },
  },
});

function getTokenFromCache(): string | null {
	if (typeof sessionStorage === 'undefined') return null
	try {
		return sessionStorage.getItem(GITHUB_TOKEN_CACHE_KEY)
	} catch {
		return null
	}
}

function saveTokenToCache(token: string): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.setItem(GITHUB_TOKEN_CACHE_KEY, token)
	} catch (error) {
		console.error('Failed to save token to cache:', error)
	}
}

function clearTokenCache(): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.removeItem(GITHUB_TOKEN_CACHE_KEY)
	} catch (error) {
		console.error('Failed to clear token cache:', error)
	}
}

export async function getPemFromCache(): Promise<string | null> {
	if (typeof sessionStorage === 'undefined') return null
	try {
		// 解密缓存中的 pem
		const encryptedPem = sessionStorage.getItem(GITHUB_PEM_CACHE_KEY)
		if (!encryptedPem) return null
		return await decrypt(encryptedPem, GITHUB_CONFIG.ENCRYPT_KEY)
	} catch {
		return null
	}
}

export async function savePemToCache(pem: string): Promise<void> {
	if (typeof sessionStorage === 'undefined') return
	try {
		// 加密 pem 后存储
		const encryptedPem = await encrypt(pem, GITHUB_CONFIG.ENCRYPT_KEY)
		sessionStorage.setItem(GITHUB_PEM_CACHE_KEY, encryptedPem)
	} catch (error) {
		console.error('Failed to save pem to cache:', error)
	}
}

function clearPemCache(): void {
	if (typeof sessionStorage === 'undefined') return
	try {
		sessionStorage.removeItem(GITHUB_PEM_CACHE_KEY)
	} catch (error) {
		console.error('Failed to clear pem cache:', error)
	}
}

export function clearAllAuthCache(): void {
	clearTokenCache()
	clearPemCache()
}

export async function hasAuth(): Promise<boolean> {
	return !!getTokenFromCache() || !!(await getPemFromCache())
}

/**
 * 统一的认证 Token 获取
 * 自动处理缓存、签发等逻辑
 * @returns GitHub Installation Token
 */
export async function getAuthToken(): Promise<string> {
	// 1. 先尝试从缓存获取 token
	const cachedToken = getTokenFromCache()
	if (cachedToken) {
		toast.info('使用缓存的令牌...')
		return cachedToken
	}

	// 2. 获取私钥（从缓存）
	const privateKey = useAuthStore.getState().privateKey
	if (!privateKey) {
		throw new Error('需要先设置私钥。请使用 useAuth().setPrivateKey()')
	}

	toast.info('正在签发 JWT...')
	const jwt = signAppJwt(GITHUB_CONFIG.APP_ID, privateKey)

	toast.info('正在获取安装信息...')
	const installationId = await getInstallationId(jwt, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO)

	toast.info('正在创建安装令牌...')
	const token = await createInstallationToken(jwt, installationId)

	saveTokenToCache(token)

	return token
}
