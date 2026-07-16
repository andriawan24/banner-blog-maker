// Hallmark · design-system: design.md · designed-as-app
// Shared shell for /sign-in and /sign-up. Ties the auth routes back to the
// Workbench with a thin top bar (wordmark link + theme toggle) so they read
// as part of the same product rather than orphaned pages, and lays the felt
// canvas + vignette (`.auth-canvas`, app/globals.css) that both forms sit on.
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-canvas flex min-h-screen flex-col text-fg">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="rounded-md font-display text-sm font-semibold tracking-tight text-fg-muted transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-felt"
        >
          ← Banner&nbsp;Studio
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </div>
    </div>
  );
}
