import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          border: "1px solid rgba(127,127,127,.2)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          访问被拒绝
        </h1>
        <p style={{ lineHeight: 1.7, opacity: 0.85, marginBottom: 20 }}>
          当前 GitHub 账号不在允许列表中，无法进入此应用。
        </p>

        <Link href="/sign-in">返回登录页</Link>
      </div>
    </main>
  );
}
