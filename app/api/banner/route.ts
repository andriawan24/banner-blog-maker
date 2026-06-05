import { ImageResponse } from "next/og";
import { bannerElement, type Size } from "@/components/banner/BannerImage";
import {
  DEFAULT_TWEAKS,
  BACKGROUND_OPTIONS,
  type Background,
  type Theme,
  type Tweaks,
  type Variant,
} from "@/lib/banner";

export const runtime = "nodejs";

const VARIANTS: Variant[] = ["editorial", "terminal", "spotlight", "square"];
const THEMES: Theme[] = ["dark", "light", "mid"];

// Artboard bounds keep render cost and memory predictable.
const MIN_DIM = 320;
const MAX_DIM = 4096;
const MAX_RADIUS = 512;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return badRequest("Request body must be a JSON object.");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  // Variant
  const variant = str(body.variant, "editorial") as Variant;
  if (!VARIANTS.includes(variant)) {
    return badRequest(`variant must be one of: ${VARIANTS.join(", ")}.`);
  }

  // Enums that live inside Tweaks
  const theme = str(body.theme, DEFAULT_TWEAKS.theme) as Theme;
  if (!THEMES.includes(theme)) {
    return badRequest(`theme must be one of: ${THEMES.join(", ")}.`);
  }
  const background = str(body.background, DEFAULT_TWEAKS.background) as Background;
  if (!BACKGROUND_OPTIONS.includes(background)) {
    return badRequest(`background must be one of: ${BACKGROUND_OPTIONS.join(", ")}.`);
  }

  // Size
  const sizeIn = (body.size ?? {}) as Record<string, unknown>;
  const w = clamp(Math.round(Number(sizeIn.w ?? 1920)) || 1920, MIN_DIM, MAX_DIM);
  const h = clamp(Math.round(Number(sizeIn.h ?? 1080)) || 1080, MIN_DIM, MAX_DIM);
  const size: Size = { w, h };

  // Rounded corners
  const rounded = bool(body.rounded, false);
  const radiusIn = Number(body.radius ?? 40);
  const radius = rounded
    ? clamp(Number.isFinite(radiusIn) ? radiusIn : 40, 0, MAX_RADIUS)
    : 0;

  // Merge text/style tweaks over the defaults.
  const t: Tweaks = {
    ...DEFAULT_TWEAKS,
    theme,
    background,
    title: str(body.title, DEFAULT_TWEAKS.title),
    subtitle: str(body.subtitle, DEFAULT_TWEAKS.subtitle),
    author: str(body.author, DEFAULT_TWEAKS.author),
    handle: str(body.handle, DEFAULT_TWEAKS.handle),
    site: str(body.site, DEFAULT_TWEAKS.site),
    tag: str(body.tag, DEFAULT_TWEAKS.tag),
    date: str(body.date, DEFAULT_TWEAKS.date),
    readTime: str(body.readTime, DEFAULT_TWEAKS.readTime),
    accent: str(body.accent, DEFAULT_TWEAKS.accent),
    image: str(body.image, DEFAULT_TWEAKS.image),
    showAvatar: bool(body.showAvatar, DEFAULT_TWEAKS.showAvatar),
    accentLastWord: bool(body.accentLastWord, DEFAULT_TWEAKS.accentLastWord),
  };

  return new ImageResponse(bannerElement(variant, t, size, radius), {
    width: w,
    height: h,
  });
}

// Surface the method contract for anyone hitting the route with the wrong verb.
export function GET() {
  return Response.json(
    { error: "Use POST with a JSON body. See openapi.yml for the schema." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
