"use client";

import { signIn } from "next-auth/react";

type SignInButtonProps = {
  callbackUrl?: string;
  className?: string;
};

export function SignInButton({
  callbackUrl = "/",
  className,
}: SignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl })}
      className={
        className ??
        "inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-medium transition hover:opacity-90"
      }
    >
      使用 GitHub 登录
    </button>
  );
}
