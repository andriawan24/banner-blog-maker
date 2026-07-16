"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/SignOutButton";

// Session-aware account chrome: shows sign-in/sign-up links to anonymous
// visitors, or the signed-in user's email + sign-out to authenticated ones.
// Anonymous visitors are otherwise unaffected — this is purely additive UI.
export function AccountBar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-[11px] text-fg-faint">…</span>;
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <span className="max-w-[9rem] truncate text-[11px] text-fg-muted">
          {session.user?.email}
        </span>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-[11px]">
      <Link
        href="/sign-in"
        className="rounded text-fg-muted transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 focus-visible:ring-offset-panel"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-md border border-line bg-raised px-2 py-1 font-medium text-fg-muted transition hover:border-fg-faint hover:text-fg active:bg-felt/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 focus-visible:ring-offset-panel"
      >
        Sign up
      </Link>
    </div>
  );
}
