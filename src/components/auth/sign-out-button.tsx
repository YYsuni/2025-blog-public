"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
    >
      退出登录
    </button>
  );
}
