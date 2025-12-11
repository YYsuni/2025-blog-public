import { create } from 'zustand'
import { clearAllAuthCache, getAuthToken as getToken, hasAuth as checkAuth, getPemFromCache, savePemToCache } from '@/lib/auth'
import { getOAuth2Token, hasOAuth2Auth, clearOAuth2Token, getCurrentUser } from '@/lib/oauth2-github'
import { useConfigStore } from '@/app/(home)/stores/config-store'
interface AuthStore {
	// State
	isAuth: boolean
	privateKey: string | null
	authMethod: 'github-app' | 'oauth2' | null
	currentUser: any | null

	// Actions
	setPrivateKey: (key: string) => void
	setOAuth2Auth: () => void
	clearAuth: () => void
	refreshAuthState: () => void
	getAuthToken: () => Promise<string>
	getCurrentUser: () => Promise<any | null>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuth: false,
	privateKey: null,
	authMethod: null,
	currentUser: null,

	setPrivateKey: async (key: string) => {
		set({ isAuth: true, privateKey: key, authMethod: 'github-app' })
		const { siteContent } = useConfigStore.getState()
		if (siteContent?.isCachePem) {
			await savePemToCache(key)
		}
	},

	setOAuth2Auth: async () => {
		const user = await getCurrentUser()
		set({ isAuth: true, authMethod: 'oauth2', currentUser: user })
	},

	clearAuth: () => {
		clearAllAuthCache()
		clearOAuth2Token()
		set({ isAuth: false, authMethod: null, currentUser: null })
	},

	refreshAuthState: async () => {
		const hasAppAuth = await checkAuth()
		const hasOAuth2 = hasOAuth2Auth()
		
		if (hasOAuth2) {
			const user = await getCurrentUser()
			set({ isAuth: true, authMethod: 'oauth2', currentUser: user })
		} else if (hasAppAuth) {
			set({ isAuth: true, authMethod: 'github-app' })
		} else {
			set({ isAuth: false, authMethod: null, currentUser: null })
		}
	},

	getAuthToken: async () => {
		const { authMethod } = get()
		
		if (authMethod === 'oauth2') {
			const token = await getOAuth2Token()
			if (!token) {
				throw new Error('OAuth2 token not found')
			}
			return token
		} else {
			const token = await getToken()
			get().refreshAuthState()
			return token
		}
	},

	getCurrentUser: async () => {
		const { authMethod, currentUser } = get()
		
		if (authMethod === 'oauth2' && currentUser) {
			return currentUser
		}
		
		if (authMethod === 'oauth2') {
			const user = await getCurrentUser()
			set({ currentUser: user })
			return user
		}
		
		return null
	}
}))

// 初始化认证状态
async function initializeAuth() {
	const store = useAuthStore.getState()
	
	// 检查OAuth2认证
	if (hasOAuth2Auth()) {
		const user = await getCurrentUser()
		if (user) {
			useAuthStore.setState({ 
				isAuth: true, 
				authMethod: 'oauth2', 
				currentUser: user 
			})
			return
		}
	}
	
	// 检查GitHub App认证
	const privateKey = await getPemFromCache()
	if (privateKey) {
		useAuthStore.setState({ 
			privateKey,
			authMethod: 'github-app'
		})
	}
	
	const hasAppAuth = await checkAuth()
	if (hasAppAuth) {
		useAuthStore.setState({ isAuth: true })
	}
}

initializeAuth()
