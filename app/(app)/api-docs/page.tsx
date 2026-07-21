"use client";

import { useMemo, useState } from "react";
import { ApiPreview } from "@/components/ApiPreview";
import { API_ENDPOINT, API_LANGS, buildSnippet, type ApiLang } from "@/lib/api-snippets";
import { DEFAULT_TWEAKS, FORMATS, VARIANTS } from "@/lib/banner";

const EXAMPLE_PAYLOAD = {
  variant: "editorial",
  format: "png",
  size: { w: 1920, h: 1080 },
  rounded: false,
  radius: 0,
  ...DEFAULT_TWEAKS,
};

type ParamRow = { name: string; type: string; description: string };

const CONTENT_PARAMS: ParamRow[] = [
  { name: "title", type: "string", description: "Headline text — the largest element on the banner." },
  { name: "subtitle", type: "string", description: "Optional supporting line under the title." },
  { name: "tag", type: "string", description: "Small pill label (e.g. a category or post type)." },
  { name: "image", type: "string (url)", description: "Optional image URL, used by the Square variant." },
];

const BYLINE_PARAMS: ParamRow[] = [
  { name: "author", type: "string", description: "Byline name shown with the banner." },
  { name: "handle", type: "string", description: "Social handle, shown alongside the author." },
  { name: "site", type: "string", description: "Site/domain shown in the banner chrome." },
  { name: "date", type: "string", description: "Freeform publish date string." },
  { name: "readTime", type: "string", description: "Freeform read-time string, e.g. \"6 min\"." },
  { name: "showAvatar", type: "boolean", description: "Whether to render the initials avatar." },
];

const STYLE_PARAMS: ParamRow[] = [
  { name: "accent", type: "string (hex)", description: "Accent color used for highlights and the tag dot." },
  { name: "background", type: `"none" | "grid" | "dots" | "orb" | "lines"`, description: "Decorative background pattern." },
  { name: "accentLastWord", type: "boolean", description: "Colors the final word of the title with the accent." },
  { name: "theme", type: `"dark" | "light" | "mid"`, description: "Color scheme applied to the banner." },
];

const OUTPUT_PARAMS: ParamRow[] = [
  { name: "variant", type: VARIANTS.map((v) => `"${v}"`).join(" | "), description: "Layout template used to compose the banner." },
  { name: "format", type: FORMATS.map((f) => `"${f}"`).join(" | "), description: "Export format for the rendered image." },
  { name: "size", type: "{ w: number, h: number }", description: "Output pixel dimensions." },
  { name: "rounded", type: "boolean", description: "Applies rounded corners to the artboard." },
];

export default function ApiDocsPage() {
  const [lang, setLang] = useState<ApiLang>("cURL");
  const snippet = useMemo(() => buildSnippet(lang, EXAMPLE_PAYLOAD), [lang]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-14 px-5 py-12 sm:px-6 lg:px-8">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="rise relative overflow-hidden rounded-2xl border border-line bg-panel p-8 shadow-[0_0_0_1px_var(--line-soft)] sm:p-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--accent)" }}
          aria-hidden
        />
        <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-fg-faint">
          Reference
        </p>
        <h1 className="relative mt-3 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">
          Generate banners the same way the Studio does — from any language.
        </h1>
        <p className="relative mt-4 max-w-lg text-sm leading-relaxed text-fg-muted">
          One endpoint takes the exact same fields you tweak in the editor and returns the
          rendered image. Every control in the UI maps one-to-one to a request field below.
        </p>
        <div className="relative mt-6 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-ink">
            POST
          </span>
          <span className="text-fg-muted">{API_ENDPOINT}</span>
        </div>
      </section>

      {/* ── Auth ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
          Authentication
        </h2>
        <p className="text-sm leading-relaxed text-fg-muted">
          Send your API key as a bearer token on every request:{" "}
          <code className="rounded bg-raised px-1.5 py-0.5 text-[13px] text-fg">
            Authorization: Bearer $BANNER_API_KEY
          </code>
          . Requests without a valid key are rejected with{" "}
          <code className="rounded bg-raised px-1.5 py-0.5 text-[13px] text-fg">401</code>.
        </p>
      </section>

      {/* ── Try it ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
          Example request
        </h2>
        <p className="text-sm text-fg-muted">
          The example below renders the Studio's default banner — swap in any of the fields
          documented further down.
        </p>
        <ApiPreview langs={API_LANGS} lang={lang} onLang={setLang} snippet={snippet} />
      </section>

      {/* ── Parameters ───────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
          Parameters
        </h2>
        <ParamTable heading="Content" rows={CONTENT_PARAMS} />
        <ParamTable heading="Byline" rows={BYLINE_PARAMS} />
        <ParamTable heading="Style" rows={STYLE_PARAMS} />
        <ParamTable heading="Output" rows={OUTPUT_PARAMS} />
      </section>

      {/* ── Response ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 pb-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-fg">
          Response
        </h2>
        <p className="text-sm leading-relaxed text-fg-muted">
          On success, the API returns{" "}
          <code className="rounded bg-raised px-1.5 py-0.5 text-[13px] text-fg">200</code> with
          the rendered image as the response body (content type matches the requested{" "}
          <code className="rounded bg-raised px-1.5 py-0.5 text-[13px] text-fg">format</code>).
          On failure, it returns a JSON body{" "}
          <code className="rounded bg-raised px-1.5 py-0.5 text-[13px] text-fg">{`{ "error": string }`}</code>{" "}
          with a 4xx/5xx status.
        </p>
      </section>
    </main>
  );
}

function ParamTable({ heading, rows }: { heading: string; rows: ParamRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">
        {heading}
      </h3>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-panel text-left text-[11px] uppercase tracking-wide text-fg-faint">
              <th className="px-4 py-2.5 font-medium">Field</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-line last:border-b-0">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[13px] text-accent">
                  {row.name}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-fg-muted">
                  {row.type}
                </td>
                <td className="px-4 py-2.5 text-fg-muted">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
