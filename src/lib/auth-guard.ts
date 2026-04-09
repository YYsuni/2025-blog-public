import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
}
/*需要保护的页面添加以下代码
import { requireAuth } from "@/lib/auth-guard";

export default async function PrivatePage() {
  const session = await requireAuth();

  return <div>欢迎，{session.user.githubLogin}</div>;
}
*/
