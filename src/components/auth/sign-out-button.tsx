"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

type SignOutButtonProps = {
  className?: string;
  callbackUrl?: string;
};

export function SignOutButton({
  className,
  callbackUrl = "/sign-in",
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      className={
        className ??
        "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm transition hover:opacity-90 disabled:opacity-50"
      }
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        await signOut({ callbackUrl });
      }}
    >
      {loading ? "退出中..." : "退出登录"}
    </button>
  );
}
