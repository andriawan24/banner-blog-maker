"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { useSession } from "next-auth/react";
import { Banner, type Size } from "@/components/banner/Banner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountBar } from "@/components/auth/AccountBar";
import {
  ACCENT_OPTIONS,
  BACKGROUND_OPTIONS,
  DEFAULT_TWEAKS,
  type Background,
  type Theme,
  type Tweaks,
  type Variant,
} from "@/lib/banner";

const LANDSCAPE: Size = { w: 1920, h: 1080 };
const SQUARE: Size = { w: 1080, h: 1080 };
const sizeFor = (v: Variant): Size => (v === "square" ? SQUARE : LANDSCAPE);
const VARIANTS: Variant[] = ["editorial", "terminal", "spotlight", "square"];
const THEMES: Theme[] = ["dark", "light", "mid"];
const FORMATS = ["png", "webp", "jpg", "pdf"] as const;
type Format = (typeof FORMATS)[number];
const CORNER_RADIUS = 40; // px on the 1920×1080 artboard when "Rounded" is on

// Languages offered in the API request preview below the controls.
const API_LANGS = ["cURL", "JavaScript", "Python", "Kotlin", "Go"] as const;
type ApiLang = (typeof API_LANGS)[number];
const API_ENDPOINT = "https://api.banner-studio.app/v1/banners";

const STORAGE_KEY = "banner-studio:config";
const DEFAULTS = {
  t: DEFAULT_TWEAKS,
  variant: "editorial" as Variant,
  format: "png" as Format,
  rounded: false,
};
type SavedConfig = typeof DEFAULTS;

// A banner config saved to the signed-in user's account (server-persisted,
// distinct from the anonymous localStorage save above).
type RemoteConfig = {
  id: string;
  name: string;
  config: Partial<SavedConfig>;
  updatedAt: string;
};

export default function Page() {
  const [t, setT] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [variant, setVariant] = useState<Variant>("editorial");
  const [format, setFormat] = useState<Format>("png");
  const [rounded, setRounded] = useState(false);
  const [busy, setBusy] = useState<null | "preview" | "download">(null);
  const [apiLang, setApiLang] = useState<ApiLang>("cURL");

  const [saved, setSaved] = useState(false);

  // Authenticated-only cloud save/list — anonymous visitors never see or
  // touch this: `useSession` reports "unauthenticated" and the fetch below
  // is gated behind `isAuthed`, so nothing is fetched or persisted for them.
  const { status: sessionStatus } = useSession();
  const isAuthed = sessionStatus === "authenticated";
  const [remoteConfigs, setRemoteConfigs] = useState<RemoteConfig[]>([]);
  const [configName, setConfigName] = useState("");
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) {
      // Deferred (not called synchronously in the effect body) to match the
      // localStorage-restore effect's pattern above and avoid cascading
      // renders directly inside the effect.
      queueMicrotask(() => setRemoteConfigs([]));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/banner-configs");
        if (!res.ok) return;
        const data = (await res.json()) as { configs?: RemoteConfig[] };
        if (!cancelled) setRemoteConfigs(data.configs ?? []);
      } catch {
        /* ignore — list simply stays empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  async function saveToAccount() {
    if (!isAuthed || cloudBusy) return;
    const name = configName.trim() || t.title.trim() || "Untitled banner";
    setCloudBusy(true);
    setCloudError(null);
    try {
      const config: SavedConfig = { t, variant, format, rounded };
      const res = await fetch("/api/banner-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config }),
      });
      const data = (await res.json().catch(() => null)) as
        | { config?: RemoteConfig; error?: string }
        | null;
      if (!res.ok || !data?.config) {
        setCloudError(data?.error ?? "Could not save config.");
        return;
      }
      setRemoteConfigs((prev) => [data.config as RemoteConfig, ...prev]);
      setConfigName("");
    } catch {
      setCloudError("Could not save config.");
    } finally {
      setCloudBusy(false);
    }
  }

  function loadRemoteConfig(rc: RemoteConfig) {
    const c = rc.config;
    if (c.t) setT({ ...DEFAULT_TWEAKS, ...c.t });
    if (c.variant) setVariant(c.variant);
    if (c.format) setFormat(c.format);
    if (typeof c.rounded === "boolean") setRounded(c.rounded);
  }

  async function deleteRemoteConfig(id: string) {
    if (cloudBusy) return;
    setCloudBusy(true);
    try {
      await fetch(`/api/banner-configs/${id}`, { method: "DELETE" });
      setRemoteConfigs((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setCloudError("Could not delete config.");
    } finally {
      setCloudBusy(false);
    }
  }

  const set = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) =>
    setT((prev) => ({ ...prev, [key]: value }));

  const SIZE = useMemo(() => sizeFor(variant), [variant]);

  // Restore the last saved config from localStorage on first mount. Guarded so
  // a malformed/old payload never crashes the editor — fall back to defaults.
  useLayoutEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return undefined;
      const c = JSON.parse(raw) as Partial<SavedConfig>;
      queueMicrotask(() => {
        if (cancelled) return;
        if (c.t) setT({ ...DEFAULT_TWEAKS, ...c.t });
        if (c.variant) setVariant(c.variant);
        if (c.format) setFormat(c.format);
        if (typeof c.rounded === "boolean") setRounded(c.rounded);
      });
    } catch {
      /* ignore corrupt storage */
    }
    return () => {
      cancelled = true;
    };
  }, []);

  function saveConfig() {
    const config: SavedConfig = { t, variant, format, rounded };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function resetConfig() {
    localStorage.removeItem(STORAGE_KEY);
    setT(DEFAULTS.t);
    setVariant(DEFAULTS.variant);
    setFormat(DEFAULTS.format);
    setRounded(DEFAULTS.rounded);
  }

  // Scale the 1920×1080 artboard to FIT the stage on both axes (contain),
  // so the banner never overflows while staying locked to 16:9.
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w && h) setScale(Math.min(w / SIZE.w, h / SIZE.h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [SIZE.w, SIZE.h]);

  const slug =
    t.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "banner";

  // The request body that an API client would POST to recreate this banner.
  // Mirrors every control the user has touched so the snippet stays in sync.
  const apiPayload = useMemo(
    () => ({
      variant,
      format,
      size: SIZE,
      rounded,
      radius: rounded ? CORNER_RADIUS : 0,
      ...t,
    }),
    [variant, format, SIZE, rounded, t],
  );

  const apiSnippet = useMemo(
    () => buildSnippet(apiLang, apiPayload),
    [apiLang, apiPayload],
  );

  // Renders the banner for a given payload (the current config, optionally
  // with `theme` overridden) into a single Blob in the currently selected
  // export format. Both light and dark exports call this with the same
  // payload shape — only `theme` differs — so content never drifts between
  // the two renders.
  async function buildBlob(payload: Record<string, unknown>): Promise<Blob> {
    const png = await renderBannerPng(payload);
    let blob: Blob = png;

    if (format === "webp" || format === "jpg") {
      blob = await convertImageBlob(png, {
        type: format === "webp" ? "image/webp" : "image/jpeg",
        quality: 0.96,
        backgroundColor: format === "jpg" ? "#ffffff" : undefined,
      });
    }

    if (format === "pdf") {
      const dataUrl = await blobToDataUrl(
        await convertImageBlob(png, {
          type: "image/jpeg",
          quality: 0.96,
          backgroundColor: "#ffffff",
        }),
      );
      const pdf = new jsPDF({
        orientation: SIZE.w >= SIZE.h ? "landscape" : "portrait",
        unit: "px",
        format: [SIZE.w, SIZE.h],
      });
      pdf.addImage(dataUrl, "JPEG", 0, 0, SIZE.w, SIZE.h);
      blob = pdf.output("blob");
    }

    return blob;
  }

  // Export always produces both a light-mode and a dark-mode rendition of
  // the current config in one action (no pre-export mode picker), bundled
  // into a single .zip with mode-indicating file names. Renders run
  // sequentially (not in parallel) to keep memory bounded, and the whole
  // dual-render + zip duration is covered by the `busy` loading state.
  async function onDownload() {
    if (busy) return;
    setBusy("download");
    try {
      const lightBlob = await buildBlob({ ...apiPayload, theme: "light" });
      const darkBlob = await buildBlob({ ...apiPayload, theme: "dark" });

      const zip = new JSZip();
      zip.file(`${slug}-light.${format}`, lightBlob);
      zip.file(`${slug}-dark.${format}`, darkBlob);
      const zipBlob = await zip.generateAsync({ type: "blob" });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      a.style.display = "none";
      document.body.append(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setBusy(null);
    }
  }

  async function onPreview() {
    if (busy) return;
    setBusy("preview");
    try {
      const blob = await buildBlob(apiPayload); // blob URL opens cleanly in a new tab
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-felt text-fg lg:grid lg:grid-cols-[380px_1fr]">
      {/* ── Preview stage ───────────────────────────────────────────── */}
      <section className="rise sticky top-0 z-10 order-1 flex flex-col items-center gap-4 border-b border-line bg-felt px-4 py-5 sm:px-6 lg:static lg:order-2 lg:gap-5 lg:border-b-0 lg:p-12">
        <div
          ref={stageRef}
          className="flex min-h-0 w-full max-w-[1100px] items-center justify-center [block-size:clamp(150px,38vh,440px)] lg:flex-1 lg:[block-size:auto]"
        >
          <div
            className="overflow-hidden bg-black/20 shadow-[0_2px_8px_rgba(0,0,0,0.4),0_24px_64px_-12px_rgba(0,0,0,0.6)] ring-1 ring-line-soft transition-[border-radius] duration-300"
            style={{
              width: SIZE.w * scale,
              height: SIZE.h * scale,
              borderRadius: rounded ? CORNER_RADIUS * scale : 0,
            }}
          >
            <div
              style={{
                width: SIZE.w,
                height: SIZE.h,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <Banner variant={variant} t={t} size={SIZE} />
            </div>
          </div>
        </div>
        <p className="shrink-0 font-mono text-[11px] tracking-wide text-fg-faint">
          {SIZE.w} × {SIZE.h} · {SIZE.w === SIZE.h ? "1:1" : "16:9"} · {variant} · {t.theme}
        </p>
      </section>

      {/* ── Controls ────────────────────────────────────────────────── */}
      <aside className="order-2 flex flex-col gap-7 border-t border-line bg-panel px-5 py-6 sm:px-6 lg:order-1 lg:h-screen lg:overflow-y-auto lg:border-t-0 lg:border-r">
        <header className="flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold leading-none tracking-tight text-fg">
              Banner&nbsp;Studio
            </h1>
            <p className="mt-1.5 text-sm text-fg-muted">
              Social &amp; blog banner generator
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AccountBar />
            <ThemeToggle />
            <span
              className="h-2.5 w-2.5 rounded-full bg-accent"
              style={{ boxShadow: "0 0 12px var(--accent)" }}
              aria-hidden
            />
          </div>
        </header>

        <div className="flex flex-col gap-5">
          <Field label="Variant">
            <Segmented options={VARIANTS} value={variant} onChange={setVariant} />
          </Field>
          <Field label="Theme">
            <Segmented
              options={THEMES}
              value={t.theme}
              onChange={(v) => set("theme", v)}
            />
          </Field>
        </div>

        <Section>Content</Section>
        <Field label="Tag">
          <Input value={t.tag} onChange={(v) => set("tag", v)} />
        </Field>
        <Field label="Title">
          <TextArea value={t.title} onChange={(v) => set("title", v)} />
        </Field>
        <Field label="Subtitle">
          <TextArea value={t.subtitle} onChange={(v) => set("subtitle", v)} />
        </Field>
        <Field label="Image">
          <ImageInput
            value={t.image}
            onChange={(v) => set("image", v)}
          />
        </Field>

        <Section>Byline</Section>
        <Field label="Author">
          <Input value={t.author} onChange={(v) => set("author", v)} />
        </Field>
        <Field label="Handle">
          <Input value={t.handle} onChange={(v) => set("handle", v)} />
        </Field>
        <Field label="Site">
          <Input value={t.site} onChange={(v) => set("site", v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input value={t.date} onChange={(v) => set("date", v)} />
          </Field>
          <Field label="Read time">
            <Input value={t.readTime} onChange={(v) => set("readTime", v)} />
          </Field>
        </div>
        <Toggle
          label="Show avatar"
          value={t.showAvatar}
          onChange={(v) => set("showAvatar", v)}
        />

        <Section>Style</Section>
        <Field label="Accent">
          <div className="flex flex-wrap gap-2.5">
            {ACCENT_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set("accent", c)}
                aria-label={c}
                aria-pressed={t.accent === c}
                className={`h-7 w-7 rounded-full transition ${
                  t.accent === c
                    ? "ring-2 ring-fg ring-offset-2 ring-offset-panel"
                    : "ring-1 ring-line hover:ring-fg-faint"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </Field>
        <Field label="Background">
          <Segmented
            options={BACKGROUND_OPTIONS}
            value={t.background}
            onChange={(v) => set("background", v as Background)}
          />
        </Field>
        <Toggle
          label="Accent last word"
          value={t.accentLastWord}
          onChange={(v) => set("accentLastWord", v)}
        />

        <Section>Export</Section>
        <Field label="Format">
          <Segmented options={FORMATS} value={format} onChange={setFormat} />
        </Field>
        <Toggle label="Rounded corners" value={rounded} onChange={setRounded} />
        <div className="mt-1 flex gap-3">
          <button
            type="button"
            onClick={onPreview}
            disabled={!!busy}
            className="flex-1 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg transition hover:border-fg-faint disabled:opacity-50"
          >
            {busy === "preview" ? "Rendering…" : "Preview"}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={!!busy}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-105 disabled:opacity-50"
          >
            {busy === "download" ? "Exporting…" : `Download .zip (light + dark)`}
          </button>
        </div>

        <Section>Configuration</Section>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveConfig}
            className="flex-1 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg transition hover:border-fg-faint"
          >
            {saved ? "Saved ✓" : "Save config"}
          </button>
          <button
            type="button"
            onClick={resetConfig}
            className="flex-1 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg-muted transition hover:border-fg-faint hover:text-fg"
          >
            Reset
          </button>
        </div>
        <p className="-mt-3 text-[11px] text-fg-faint">
          Saves to this browser. Reset restores defaults.
        </p>

        {/* Hallmark · design-system: design.md · designed-as-app —
            cloud save/list chrome raised to the same row/focus treatment as
            the rest of the Workbench's controls (borders, hover, focus-visible rings). */}
        <Section>My account</Section>
        {isAuthed ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder={t.title || "Config name"}
                className="flex-1 rounded-lg border border-line bg-raised px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-faint hover:bg-felt/40 focus-visible:border-accent/70 focus-visible:ring-2 focus-visible:ring-accent/20"
              />
              <button
                type="button"
                onClick={saveToAccount}
                disabled={cloudBusy}
                className="shrink-0 rounded-lg border border-line bg-raised px-4 py-2 text-sm font-medium text-fg transition hover:border-fg-faint active:bg-felt/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-1 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cloudBusy ? "Saving…" : "Save to account"}
              </button>
            </div>
            {cloudError && <p className="text-[11px] text-red-400">{cloudError}</p>}
            {remoteConfigs.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {remoteConfigs.map((rc) => (
                  <li
                    key={rc.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-raised px-3 py-2 text-sm transition hover:border-fg-faint"
                  >
                    <button
                      type="button"
                      onClick={() => loadRemoteConfig(rc)}
                      className="min-w-0 flex-1 truncate rounded text-left text-fg transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                      title={`Load "${rc.name}"`}
                    >
                      {rc.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRemoteConfig(rc.id)}
                      disabled={cloudBusy}
                      className="shrink-0 rounded text-[11px] text-fg-faint transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-fg-faint">
                No saved configs yet — save the current banner to your account.
              </p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-fg-faint">
            Sign in to save configs to your account and load them on any device.
          </p>
        )}

        <Section>API request</Section>
        <ApiPreview
          langs={API_LANGS}
          lang={apiLang}
          onLang={setApiLang}
          snippet={apiSnippet}
        />
      </aside>

    </main>
  );
}

async function renderBannerPng(payload: Record<string, unknown>): Promise<Blob> {
  const res = await fetch("/api/banner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const fallback = `Banner render failed (${res.status}).`;
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? fallback);
  }

  return res.blob();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image."));
    reader.readAsDataURL(blob);
  });
}

async function convertImageBlob(
  source: Blob,
  options: {
    type: "image/jpeg" | "image/webp";
    quality: number;
    backgroundColor?: string;
  },
): Promise<Blob> {
  const url = URL.createObjectURL(source);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare image export.");
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("This browser could not create the requested export."));
        },
        options.type,
        options.quality,
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load rendered banner."));
    image.src = url;
  });
}

// ── Control primitives ─────────────────────────────────────────────────────--

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-line bg-raised px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-faint focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
    />
  );
}

function ImageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="rounded-lg border border-line bg-raised px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-faint focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
      />
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-medium text-fg transition hover:border-fg-faint disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border border-line bg-raised px-3 py-1.5 text-xs text-fg-muted transition hover:border-fg-faint hover:text-fg"
          >
            Clear
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <p className="text-[11px] text-fg-faint">
        Uploads save to configured S3 storage.
      </p>
    </div>
  );
}

function TextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      className="resize-y rounded-lg border border-line bg-raised px-3 py-2 text-sm leading-relaxed text-fg outline-none transition placeholder:text-fg-faint focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
    />
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex items-center justify-between rounded-lg border border-line bg-raised px-3 py-2.5 text-sm transition hover:border-fg-faint"
    >
      <span className="text-fg-muted">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          value ? "bg-accent" : "bg-fg-faint/40"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-fg transition-all ${
            value ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-felt/60 p-1">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-xs capitalize transition ${
            value === o
              ? "bg-raised text-fg shadow-sm"
              : "text-fg-faint hover:text-fg-muted"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── API request preview ─────────────────────────────────────────────────────

function ApiPreview({
  langs,
  lang,
  onLang,
  snippet,
}: {
  langs: readonly ApiLang[];
  lang: ApiLang;
  onLang: (l: ApiLang) => void;
  snippet: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <Segmented options={langs} value={lang} onChange={onLang} />
      <div className="relative">
        <button
          type="button"
          onClick={copy}
          className="absolute right-2 top-2 z-10 rounded-md border border-line bg-raised px-2 py-1 text-[11px] font-medium text-fg-muted transition hover:border-fg-faint hover:text-fg"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <pre className="max-h-72 overflow-auto rounded-lg border border-line bg-felt/60 p-3 pr-16 font-mono text-[11px] leading-relaxed text-fg-muted">
          <code>{snippet}</code>
        </pre>
      </div>
      <p className="text-[11px] text-fg-faint">
        Sends current banner config to the render API. Replace{" "}
        <code className="text-fg-muted">$BANNER_API_KEY</code> with your key.
      </p>
    </div>
  );
}

// Render a copy-pasteable request in the chosen language for the given payload.
function buildSnippet(lang: ApiLang, payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload, null, 2);
  const jsonInline = JSON.stringify(payload);

  switch (lang) {
    case "cURL":
      return [
        `curl -X POST ${API_ENDPOINT} \\`,
        `  -H "Authorization: Bearer $BANNER_API_KEY" \\`,
        `  -H "Content-Type: application/json" \\`,
        `  -d '${jsonInline}' \\`,
        `  --output banner.${payload.format}`,
      ].join("\n");

    case "JavaScript":
      return [
        `const res = await fetch("${API_ENDPOINT}", {`,
        `  method: "POST",`,
        `  headers: {`,
        `    Authorization: \`Bearer \${process.env.BANNER_API_KEY}\`,`,
        `    "Content-Type": "application/json",`,
        `  },`,
        `  body: JSON.stringify(${indent(json, 2)}),`,
        `});`,
        ``,
        `const blob = await res.blob();`,
      ].join("\n");

    case "Python":
      return [
        `import os, requests`,
        ``,
        `res = requests.post(`,
        `    "${API_ENDPOINT}",`,
        `    headers={"Authorization": f"Bearer {os.environ['BANNER_API_KEY']}"},`,
        `    json=${pyDict(payload)},`,
        `)`,
        `open("banner.${payload.format}", "wb").write(res.content)`,
      ].join("\n");

    case "Kotlin":
      return [
        `val client = OkHttpClient()`,
        `val body = """${jsonInline}"""`,
        `    .toRequestBody("application/json".toMediaType())`,
        ``,
        `val request = Request.Builder()`,
        `    .url("${API_ENDPOINT}")`,
        `    .header("Authorization", "Bearer " + System.getenv("BANNER_API_KEY"))`,
        `    .post(body)`,
        `    .build()`,
        ``,
        `client.newCall(request).execute().use { res ->`,
        `    File("banner.${payload.format}").writeBytes(res.body!!.bytes())`,
        `}`,
      ].join("\n");

    case "Go":
      return [
        `package main`,
        ``,
        `import (`,
        `\t"bytes"`,
        `\t"io"`,
        `\t"net/http"`,
        `\t"os"`,
        `)`,
        ``,
        `func main() {`,
        `\tbody := []byte(\`${jsonInline}\`)`,
        `\treq, _ := http.NewRequest("POST", "${API_ENDPOINT}", bytes.NewReader(body))`,
        `\treq.Header.Set("Authorization", "Bearer "+os.Getenv("BANNER_API_KEY"))`,
        `\treq.Header.Set("Content-Type", "application/json")`,
        ``,
        `\tres, _ := http.DefaultClient.Do(req)`,
        `\tdefer res.Body.Close()`,
        `\tout, _ := os.Create("banner.${payload.format}")`,
        `\tio.Copy(out, res.Body)`,
        `}`,
      ].join("\n");
  }
}

// Indent every line after the first by `n` spaces — keeps inlined JSON aligned.
function indent(s: string, n: number): string {
  const pad = " ".repeat(n);
  return s.split("\n").map((l, i) => (i === 0 ? l : pad + l)).join("\n");
}

// Render a JSON payload as a Python dict literal (True/False/None, not JSON).
function pyDict(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 4)
    .replace(/\btrue\b/g, "True")
    .replace(/\bfalse\b/g, "False")
    .replace(/\bnull\b/g, "None")
    .split("\n")
    .map((l, i) => (i === 0 ? l : "    " + l))
    .join("\n");
}
