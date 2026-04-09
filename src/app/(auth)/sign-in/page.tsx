import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/sign-in-button";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">先验证 GitHub 身份</h1>
        <p className="mt-3 text-sm opacity-80">
          只有被允许的 GitHub 账号登录后，才能进入应用。
        </p>

        <div className="mt-6">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
