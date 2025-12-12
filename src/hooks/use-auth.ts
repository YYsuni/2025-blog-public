import { create } from 'zustand'
import { clearAllAuthCache, getAuthToken as getToken, hasAuth as checkAuth, getPemFromCache, savePemToCache } from '@/lib/auth'
import { getOAuth2Token, hasOAuth2Auth, clearOAuth2Token } from '@/lib/oauth2-github'
import { useConfigStore } from '@/app/(home)/stores/config-store'
interface AuthStore {
	// State
	isAuth: boolean
	isOAuth2Auth: boolean
	privateKey: string | null

	// Actions
	setPrivateKey: (key: string) => void
	setOAuth2Auth: () => Promise<void>
	clearAuth: () => void
	refreshAuthState: () => Promise<void>
	getAuthToken: () => Promise<string>
}

/**
 * 检查是否有任何有效的认证（App认证或OAuth2认证）
 */
export function hasAnyAuth(): boolean {
	const state = useAuthStore.getState()
	return !!state.privateKey || !!state.isOAuth2Auth || hasOAuth2Auth()
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	isOAuth2Auth: false,
	privateKey: null,

	setPrivateKey: async (key: string) => {
		set({ isAuth: true, privateKey: key })
		const { siteContent } = useConfigStore.getState()
		if (siteContent?.isCachePem) {
			await savePemToCache(key)
		}
	},

	setOAuth2Auth: async () => {
		const isAuth = hasOAuth2Auth()
		set({ isOAuth2Auth: isAuth })
	},

	clearAuth: () => {
		clearAllAuthCache()
		clearOAuth2Token()
		set({ isAuth: false, isOAuth2Auth: false })
	},

	refreshAuthState: async () => {
		const isAppAuth = await checkAuth()
		const isOAuth2 = hasOAuth2Auth()
		set({ isAuth: isAppAuth, isOAuth2Auth: isOAuth2 })
	},

	getAuthToken: async () => {
		// 优先使用OAuth2 token
		const oauth2Token = await getOAuth2Token()
		if (oauth2Token) {
			get().refreshAuthState()
			return oauth2Token
		}

		// 回退到App token
		const token = await getToken()
		get().refreshAuthState()
		return token
	}
}))

getPemFromCache().then((key) => {
	if (key) {
		useAuthStore.setState({ privateKey: key })
	}
})

checkAuth().then((isAuth) => {
	if (isAuth) {
		useAuthStore.setState({ isAuth })
	}
})

// 初始化OAuth2状态
if (hasOAuth2Auth()) {
	useAuthStore.setState({ isOAuth2Auth: true })
}
