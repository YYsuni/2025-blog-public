export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    /*
     * 保护所有页面路由，但跳过：
     * - Next.js 内部资源
     * - 图片/静态文件
     * - 认证 API
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
