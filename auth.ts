import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

function parseCsv(value?: string) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

const allowedLogins = new Set(parseCsv(process.env.ALLOWED_GITHUB_LOGINS))
const allowedIds = new Set(parseCsv(process.env.ALLOWED_GITHUB_IDS))
const allowedEmails = new Set(parseCsv(process.env.ALLOWED_EMAILS))

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          // 读取用户基础资料；email 若是私密邮箱时通常需要 user:email
          scope: "read:user user:email",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/forbidden",
  },

  callbacks: {
    async signIn({ profile, user }) {
      // GitHub profile 常见字段：login, id, email
      const githubLogin =
        typeof profile?.login === "string" ? profile.login : undefined

      const githubId =
        profile?.id !== undefined && profile?.id !== null
          ? String(profile.id)
          : undefined

      const email =
        typeof user?.email === "string"
          ? user.email
          : typeof profile?.email === "string"
            ? profile.email
            : undefined

      const loginAllowed =
        allowedLogins.size === 0 ? true : !!githubLogin && allowedLogins.has(githubLogin)

      const idAllowed =
        allowedIds.size === 0 ? true : !!githubId && allowedIds.has(githubId)

      const emailAllowed =
        allowedEmails.size === 0 ? true : !!email && allowedEmails.has(email)

      return loginAllowed && idAllowed && emailAllowed
    },

    async jwt({ token, account, profile, user }) {
      if (account?.provider === "github") {
        token.githubLogin =
          typeof profile?.login === "string" ? profile.login : undefined

        token.githubId =
          profile?.id !== undefined && profile?.id !== null
            ? String(profile.id)
            : undefined

        token.email =
          typeof user?.email === "string"
            ? user.email
            : typeof profile?.email === "string"
              ? profile.email
              : token.email
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.githubLogin =
          typeof token.githubLogin === "string" ? token.githubLogin : undefined

        session.user.githubId =
          typeof token.githubId === "string" ? token.githubId : undefined

        session.user.email =
          typeof token.email === "string" ? token.email : session.user.email
      }
      return session
    },

    async authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth?.user

      const publicRoutes = ["/login", "/forbidden", "/public"]
      const isPublicRoute = publicRoutes.some(
        (path) => nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
      )

      if (isPublicRoute) return true

      return isLoggedIn
    },
  },
})
