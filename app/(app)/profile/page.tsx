"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import type { RemoteBannerConfig } from "@/lib/banner";

const HANDOFF_KEY = "banner-studio:handoff";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [configs, setConfigs] = useState<RemoteBannerConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (status !== "unauthenticated") return;
    router.replace("/sign-in");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/banner-configs");
        if (!res.ok) return;
        const data = (await res.json()) as { configs?: RemoteBannerConfig[] };
        if (!cancelled) setConfigs(data.configs ?? []);
      } catch {
        if (!cancelled) setError("Could not load your saved banners.");
      } finally {
        if (!cancelled) setLoadingConfigs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  function startRename(rc: RemoteBannerConfig) {
    setRenamingId(rc.id);
    setRenameValue(rc.name);
  }

  async function confirmRename(id: string) {
    const name = renameValue.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/banner-configs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json().catch(() => null)) as
        | { config?: RemoteBannerConfig; error?: string }
        | null;
      if (!res.ok || !data?.config) {
        setError(data?.error ?? "Could not rename banner.");
        return;
      }
      setConfigs((prev) => prev.map((c) => (c.id === id ? (data.config as RemoteBannerConfig) : c)));
      setRenamingId(null);
    } catch {
      setError("Could not rename banner.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteConfig(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/banner-configs/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        setError("Could not delete banner.");
        return;
      }
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Could not delete banner.");
    } finally {
      setBusyId(null);
    }
  }

  function loadIntoEditor(rc: RemoteBannerConfig) {
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(rc.config));
    } catch {
      /* sessionStorage unavailable — Load will just no-op on the editor side */
    }
    router.push("/");
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-fg-faint">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-10 sm:px-6 lg:px-8">
      <section className="rise flex flex-col gap-4 rounded-xl border border-line bg-panel p-6 shadow-[0_0_0_1px_var(--line-soft)] sm:p-8">
        <div className="flex items-center gap-3">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line bg-raised font-display text-xl font-semibold text-fg"
            aria-hidden
          >
            {(session?.user?.email ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
              Your account
            </h1>
            <p className="truncate text-sm text-fg-muted">{session?.user?.email}</p>
          </div>
          <SignOutButton />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
            Banner history
          </h2>
          <p className="text-xs text-fg-faint">
            {configs.length} saved {configs.length === 1 ? "banner" : "banners"}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-2 text-[12px] text-red-400">
            {error}
          </p>
        )}

        {loadingConfigs ? (
          <p className="text-sm text-fg-faint">Loading your saved banners…</p>
        ) : configs.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line bg-panel/60 p-8">
            <p className="text-sm text-fg-muted">
              No saved banners yet. Design one on the Home/Edit page, then save it to your
              account to see it here.
            </p>
            <Link
              href="/"
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-105"
            >
              Go to editor
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {configs.map((rc) => (
              <li
                key={rc.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3.5 transition hover:border-fg-faint sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  {renamingId === rc.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmRename(rc.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="min-h-[44px] w-full rounded-lg border border-accent/70 bg-raised px-3 py-2 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/20 lg:min-h-0"
                    />
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium text-fg">{rc.name}</p>
                      <p className="text-[11px] text-fg-faint">
                        {rc.config.variant ?? "editorial"} · updated{" "}
                        {new Date(rc.updatedAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {renamingId === rc.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => confirmRename(rc.id)}
                        disabled={busyId === rc.id}
                        className="min-h-[44px] rounded-lg bg-accent px-3 text-xs font-semibold text-accent-ink transition hover:brightness-105 disabled:opacity-50 lg:min-h-0 lg:py-1.5"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="min-h-[44px] rounded-lg border border-line bg-raised px-3 text-xs font-medium text-fg-muted transition hover:border-fg-faint lg:min-h-0 lg:py-1.5"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => loadIntoEditor(rc)}
                        className="min-h-[44px] rounded-lg border border-line bg-raised px-3 text-xs font-medium text-fg transition hover:border-fg-faint lg:min-h-0 lg:py-1.5"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => startRename(rc)}
                        disabled={busyId === rc.id}
                        className="min-h-[44px] rounded-lg border border-line bg-raised px-3 text-xs font-medium text-fg-muted transition hover:border-fg-faint hover:text-fg disabled:opacity-50 lg:min-h-0 lg:py-1.5"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteConfig(rc.id, rc.name)}
                        disabled={busyId === rc.id}
                        className="min-h-[44px] rounded-lg border border-line bg-raised px-3 text-xs text-fg-faint transition hover:border-red-400/50 hover:text-red-400 disabled:opacity-50 lg:min-h-0 lg:py-1.5"
                      >
                        {busyId === rc.id ? "…" : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
