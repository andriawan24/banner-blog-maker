"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountBar } from "@/components/auth/AccountBar";

const LINKS = [
  { href: "/", label: "Home / Edit" },
  { href: "/profile", label: "Profile" },
  { href: "/api-docs", label: "API Docs" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="rise flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line bg-panel px-5 py-4 sm:px-6 lg:h-16 lg:flex-nowrap lg:px-8 lg:py-0">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          href="/"
          className="rounded-md font-display text-lg font-semibold leading-none tracking-tight text-fg transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
        >
          Banner&nbsp;Studio
        </Link>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Primary">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition lg:min-h-0 lg:py-1.5 ${
                  active
                    ? "bg-raised text-fg"
                    : "text-fg-muted hover:bg-raised/60 hover:text-fg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <AccountBar />
        <ThemeToggle />
      </div>
    </header>
  );
}
