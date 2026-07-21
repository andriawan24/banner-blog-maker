"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { Banner, type Size } from "@/components/banner/Banner";
import { AppNav } from "@/components/AppNav";
import { Segmented } from "@/components/Segmented";
import {
  ACCENT_OPTIONS,
  BACKGROUND_OPTIONS,
  DEFAULT_TWEAKS,
  FORMATS,
  THEMES,
  VARIANTS,
  type Background,
  type ExportFormat,
  type SavedBannerConfig,
  type Tweaks,
  type Variant,
} from "@/lib/banner";

const LANDSCAPE: Size = { w: 1920, h: 1080 };
const SQUARE: Size = { w: 1080, h: 1080 };
const sizeFor = (v: Variant): Size => (v === "square" ? SQUARE : LANDSCAPE);
const CORNER_RADIUS = 40; // px on the 1920×1080 artboard when "Rounded" is on

const STORAGE_KEY = "banner-studio:config";
// One-shot handoff from the Profile page's "Load" action — read once on
// mount, then cleared, so re-visiting `/` never re-applies a stale config.
const HANDOFF_KEY = "banner-studio:handoff";
const DEFAULTS: SavedBannerConfig = {
  t: DEFAULT_TWEAKS,
  variant: "editorial",
  format: "png",
  rounded: false,
};

export default function Page() {
  const [t, setT] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [variant, setVariant] = useState<Variant>("editorial");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [rounded, setRounded] = useState(false);
  const [busy, setBusy] = useState<null | "preview" | "download">(null);

  const [saved, setSaved] = useState(false);

  const set = <K extends keyof Tweaks>(key: K, value: Tweaks[K]) =>
    setT((prev) => ({ ...prev, [key]: value }));

  const SIZE = useMemo(() => sizeFor(variant), [variant]);

  function applyConfig(c: Partial<SavedBannerConfig>) {
    if (c.t) setT({ ...DEFAULT_TWEAKS, ...c.t });
    if (c.variant) setVariant(c.variant);
    if (c.format) setFormat(c.format);
    if (typeof c.rounded === "boolean") setRounded(c.rounded);
  }

  // Handoff from Profile's "Load" takes priority over the localStorage
  // restore below — checked and cleared first, in the same effect, so only
  // one of the two ever applies on a given mount.
  useLayoutEffect(() => {
    let cancelled = false;
    try {
      const handoff = sessionStorage.getItem(HANDOFF_KEY);
      if (handoff) {
        sessionStorage.removeItem(HANDOFF_KEY);
        const c = JSON.parse(handoff) as Partial<SavedBannerConfig>;
        queueMicrotask(() => {
          if (!cancelled) applyConfig(c);
        });
        return () => {
          cancelled = true;
        };
      }
    } catch {
      /* ignore corrupt handoff payload */
    }

    // Restore the last saved config from localStorage on first mount. Guarded
    // so a malformed/old payload never crashes the editor — fall back to
    // defaults.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return undefined;
      const c = JSON.parse(raw) as Partial<SavedBannerConfig>;
      queueMicrotask(() => {
        if (!cancelled) applyConfig(c);
      });
    } catch {
      /* ignore corrupt storage */
    }
    return () => {
      cancelled = true;
    };
  }, []);

  function saveConfig() {
    const config: SavedBannerConfig = { t, variant, format, rounded };
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
    <div className="flex min-h-screen flex-col bg-felt text-fg">
      <AppNav />
      <main className="flex flex-1 flex-col overflow-x-hidden lg:grid lg:grid-cols-[380px_1fr]">
      {/* ── Preview stage ───────────────────────────────────────────── */}
      <section className="rise static order-1 flex flex-col items-center gap-4 border-b border-line bg-felt px-4 py-5 sm:px-6 lg:sticky lg:top-16 lg:z-10 lg:order-2 lg:gap-5 lg:border-b-0 lg:p-12">
        <div
          ref={stageRef}
          className={`flex min-h-0 w-full max-w-[1100px] items-center justify-center ${
            SIZE.w === SIZE.h ? "aspect-square" : "aspect-video"
          } lg:aspect-auto lg:flex-1`}
        >
          <div
            className="overflow-hidden bg-black/20 shadow-[0_0_0_1px_var(--line-soft)] ring-1 ring-line-soft transition-[border-radius] duration-300 ease-out"
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
      <aside className="order-2 flex flex-col gap-7 border-t border-line bg-panel px-5 py-6 pb-28 sm:px-6 lg:order-1 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-t-0 lg:border-r lg:pb-6">
        <p className="text-sm text-fg-muted">Social &amp; blog banner generator</p>

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

        <CollapsibleSection title="Content" defaultOpen>
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
            <ImageInput value={t.image} onChange={(v) => set("image", v)} />
          </Field>
        </CollapsibleSection>

        <CollapsibleSection title="Byline" defaultOpen>
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
        </CollapsibleSection>

        <CollapsibleSection title="Style" defaultOpen>
          <Field label="Accent">
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("accent", c)}
                  aria-label={c}
                  aria-pressed={t.accent === c}
                  className={`h-11 w-11 shrink-0 rounded-full transition lg:h-7 lg:w-7 ${
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
        </CollapsibleSection>

        <CollapsibleSection title="Export" defaultOpen>
          <Field label="Format">
            <Segmented options={FORMATS} value={format} onChange={setFormat} />
          </Field>
          <Toggle label="Rounded corners" value={rounded} onChange={setRounded} />
          <ExportActions
            busy={busy}
            onPreview={onPreview}
            onDownload={onDownload}
            className="mt-1 hidden lg:flex"
          />
        </CollapsibleSection>

        <CollapsibleSection title="Configuration" defaultOpen>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={saveConfig}
              className="min-h-[44px] flex-1 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg transition hover:border-fg-faint lg:min-h-0"
            >
              {saved ? "Saved ✓" : "Save config"}
            </button>
            <button
              type="button"
              onClick={resetConfig}
              className="min-h-[44px] flex-1 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg-muted transition hover:border-fg-faint hover:text-fg lg:min-h-0"
            >
              Reset
            </button>
          </div>
          <p className="text-[11px] text-fg-faint">
            Saves to this browser. Reset restores defaults.
          </p>
          <Link
            href="/profile"
            className="rounded text-[11px] font-medium text-accent underline underline-offset-2 transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            Manage saved configs and account in Profile →
          </Link>
        </CollapsibleSection>
      </aside>

      {/* ── Mobile action bar ──────────────────────────────────────── */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 z-20 order-3 border-t border-line bg-panel/95 px-4 pt-3 backdrop-blur-sm lg:hidden">
        <ExportActions busy={busy} onPreview={onPreview} onDownload={onDownload} />
      </div>
      </main>
    </div>
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

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="section-details flex flex-col gap-5">
      <summary className="flex min-h-[44px] cursor-pointer select-none items-center gap-3 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint lg:min-h-0">
        <span className="section-caret inline-block text-fg-faint" aria-hidden>
          ▸
        </span>
        <span>{title}</span>
        <span className="h-px flex-1 bg-line" />
      </summary>
      <div className="flex flex-col gap-5">{children}</div>
    </details>
  );
}

function ExportActions({
  busy,
  onPreview,
  onDownload,
  className,
}: {
  busy: null | "preview" | "download";
  onPreview: () => void;
  onDownload: () => void;
  className?: string;
}) {
  return (
    <div className={`gap-3 pb-3 ${className ?? "flex"}`}>
      <button
        type="button"
        onClick={onPreview}
        disabled={!!busy}
        className="min-h-[44px] flex-1 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm font-medium text-fg transition-[border-color,transform] duration-micro ease-out hover:border-fg-faint hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {busy === "preview" ? "Rendering…" : "Preview"}
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={!!busy}
        className="min-h-[44px] flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-[filter,transform] duration-micro ease-out hover:brightness-105 hover:-translate-y-px active:translate-y-0 active:brightness-95 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {busy === "download" ? "Exporting…" : `Download .zip (light + dark)`}
      </button>
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
      className="min-h-[44px] rounded-lg border border-line bg-raised px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-faint focus:border-accent/70 focus:ring-2 focus:ring-accent/20 lg:min-h-0"
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
        className="min-h-[44px] rounded-lg border border-line bg-raised px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-faint focus:border-accent/70 focus:ring-2 focus:ring-accent/20 lg:min-h-0"
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
          className="min-h-[44px] rounded-lg border border-line bg-raised px-3 py-1.5 text-xs font-medium text-fg transition hover:border-fg-faint disabled:opacity-50 lg:min-h-0"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-[44px] rounded-lg border border-line bg-raised px-3 py-1.5 text-xs text-fg-muted transition hover:border-fg-faint hover:text-fg lg:min-h-0"
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
      className="flex min-h-[44px] items-center justify-between rounded-lg border border-line bg-raised px-3 py-2.5 text-sm transition hover:border-fg-faint lg:min-h-0"
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

