"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-line bg-raised px-2 py-1 text-[11px] font-medium text-fg-muted transition hover:border-fg-faint hover:text-fg active:bg-felt/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 focus-visible:ring-offset-panel"
    >
      Sign out
    </button>
  );
}
