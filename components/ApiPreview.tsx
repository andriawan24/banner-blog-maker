"use client";

import { useState } from "react";
import { Segmented } from "@/components/Segmented";
import type { ApiLang } from "@/lib/api-snippets";

export function ApiPreview({
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
