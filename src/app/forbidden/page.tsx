import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">访问被拒绝</h1>
        <p className="mt-3 text-sm opacity-80">
          当前 GitHub 账号不在允许列表中，无法进入此应用。
        </p>

        <div className="mt-6">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition hover:opacity-90"
          >
            返回登录页
          </Link>
        </div>
      </div>
    </main>
  );
}
