// Hallmark · design-system: design.md · designed-as-app
"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const errorId = useId();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // Generic error regardless of whether the email exists or the
      // password was wrong — never reveal which one failed.
      if (!res || res.error) {
        setError("Invalid email or password.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="w-full max-w-sm">
      <form
        onSubmit={onSubmit}
        noValidate
        className="rise flex flex-col gap-6 rounded-xl border border-line bg-panel p-6 shadow-[0_0_0_1px_var(--line-soft)] sm:p-8"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Sign in
          </h1>
          <p className="text-sm text-fg-muted">
            Sync your saved banners across devices.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-fg-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`min-h-[44px] rounded-lg border bg-raised px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-fg-faint hover:bg-felt/40 focus-visible:ring-2 focus-visible:ring-accent/20 ${
                error ? "border-red-400/60 focus-visible:border-red-400/70" : "border-line focus-visible:border-accent/70"
              }`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-fg-muted">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`min-h-[44px] rounded-lg border bg-raised px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-fg-faint hover:bg-felt/40 focus-visible:ring-2 focus-visible:ring-accent/20 ${
                error ? "border-red-400/60 focus-visible:border-red-400/70" : "border-line focus-visible:border-accent/70"
              }`}
            />
          </label>
        </div>

        <div className="min-h-[1lh]" aria-live="polite">
          {error && (
            <p id={errorId} className="text-[12px] text-red-400">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="min-h-[44px] rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-[filter,transform] duration-micro ease-out hover:brightness-105 hover:-translate-y-px active:translate-y-0 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-[12px] text-fg-faint">
          No account?{" "}
          <Link
            href="/sign-up"
            className="rounded text-fg-muted underline underline-offset-2 transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
