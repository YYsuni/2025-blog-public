export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * 保护所有页面路由，但跳过：
     * - Auth.js API
     * - Next.js 内部资源
     * - 常见静态资源
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
