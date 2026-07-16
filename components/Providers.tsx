"use client";

import { SessionProvider } from "next-auth/react";

// Wraps the app in a client-side session context so `useSession` works in
// any client component (studio page, account bar, sign-in/up forms).
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
