// BannerImage.tsx — server-side, Satori-safe rendering of the banner used by
// the /api/banner ImageResponse route. Satori (the engine behind next/og) is
// not a browser: it ignores `filter: blur`, `mask-image`, `aspect-ratio`, and
// requires `display: flex` on every element with more than one child. This
// renderer mirrors components/banner/Banner.tsx within those constraints, so
// the API output stays close to the live preview.

import React from "react";
import {
  type Tweaks,
  type Background,
  type Variant,
  themeTokens,
} from "@/lib/banner";

export type Size = { w: number; h: number };

const SANS = "sans-serif";
const MONO = "monospace";

type Tok = ReturnType<typeof themeTokens>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Avatar({ d, tok, name }: { d: number; tok: Tok; name: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: d,
        height: d,
        borderRadius: 999,
        background: tok.card,
        border: `1px solid ${tok.line}`,
        alignItems: "center",
        justifyContent: "center",
        color: tok.fgMuted,
        fontFamily: MONO,
        fontSize: d * 0.34,
        fontWeight: 500,
      }}
    >
      {initials(name)}
    </div>
  );
}

// ── Backgrounds (gradient-only; no masks/blur) ───────────────────────────────

function bgLayers(kind: Background, tok: Tok, accent: string): React.ReactNode[] {
  if (kind === "grid") {
    return [
      <div
        key="grid"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(${tok.line} 1px, transparent 1px), linear-gradient(90deg, ${tok.line} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.6,
        }}
      />,
    ];
  }
  if (kind === "dots") {
    return [
      <div
        key="dots"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(${tok.fgFaint} 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
          opacity: 0.4,
        }}
      />,
    ];
  }
  if (kind === "lines") {
    return [
      <div
        key="lines"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(45deg, ${tok.line} 0px, ${tok.line} 1px, transparent 1px, transparent 12px)`,
          backgroundSize: "12px 12px",
          opacity: 0.6,
        }}
      />,
    ];
  }
  if (kind === "orb") {
    // No blur in Satori; soft radial gradients approximate the glow.
    return [
      <div
        key="orb1"
        style={{
          position: "absolute",
          top: "-30%",
          right: "-15%",
          width: "70%",
          height: "70%",
          borderRadius: 9999,
          backgroundImage: `radial-gradient(circle at 30% 30%, ${accent}55, ${accent}00 60%)`,
        }}
      />,
      <div
        key="orb2"
        style={{
          position: "absolute",
          bottom: "-25%",
          left: "-10%",
          width: "55%",
          height: "55%",
          borderRadius: 9999,
          backgroundImage: `radial-gradient(circle at 60% 40%, ${accent}33, ${accent}00 60%)`,
        }}
      />,
    ];
  }
  return [];
}

function Root({
  tok,
  fontFamily,
  radius,
  children,
}: {
  tok: Tok;
  fontFamily: string;
  radius: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: tok.bg,
        color: tok.fg,
        fontFamily,
        borderRadius: radius,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

// ── Editorial ────────────────────────────────────────────────────────────────

function Editorial({ t, size, radius }: { t: Tweaks; size: Size; radius: number }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1200;
  const pad = 64 * s;
  const titleSize = (size.w < 1200 ? 64 : 80) * s;
  const metaSize = 16 * s;
  const words = t.title.split(" ");
  return (
    <Root tok={tok} fontFamily={SANS} radius={radius}>
      {bgLayers(t.background, tok, t.accent)}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: MONO,
            fontSize: metaSize,
            color: tok.fgMuted,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8 * s,
              padding: `${6 * s}px ${12 * s}px`,
              borderRadius: 999,
              border: `1px solid ${tok.line}`,
              background: tok.card,
            }}
          >
            <div
              style={{
                width: 6 * s,
                height: 6 * s,
                borderRadius: 999,
                background: t.accent,
              }}
            />
            {t.tag}
          </div>
          <div style={{ display: "flex" }}>{t.site}</div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 * s, maxWidth: "80%" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: titleSize,
              lineHeight: 1.04,
              fontWeight: 600,
              letterSpacing: "-0.025em",
            }}
          >
            {words.map((word, i) => {
              const accentIt = i === words.length - 1 && t.accentLastWord;
              return (
                <span
                  key={i}
                  style={{ color: accentIt ? t.accent : tok.fg, marginRight: titleSize * 0.22 }}
                >
                  {word}
                </span>
              );
            })}
          </div>
          {t.subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 24 * s,
                lineHeight: 1.45,
                color: tok.fgMuted,
                maxWidth: "85%",
              }}
            >
              {t.subtitle}
            </div>
          ) : null}
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 * s, width: "100%" }}>
          {t.showAvatar ? <Avatar d={48 * s} tok={tok} name={t.author} /> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 * s }}>
            <div style={{ display: "flex", fontSize: metaSize * 1.05, fontWeight: 500, color: tok.fg }}>
              {t.author}
            </div>
            <div style={{ display: "flex", fontFamily: MONO, fontSize: metaSize * 0.85, color: tok.fgMuted, gap: 10 * s }}>
              <span>{t.date}</span>
              <span style={{ color: tok.fgFaint }}>·</span>
              <span>{t.readTime}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexGrow: 1 }} />
          <div style={{ display: "flex", fontFamily: MONO, fontSize: metaSize, color: tok.fgFaint, letterSpacing: "0.05em" }}>
            ↗ {t.handle}
          </div>
        </div>
      </div>
    </Root>
  );
}

// ── Terminal ─────────────────────────────────────────────────────────────────

function Terminal({ t, size, radius }: { t: Tweaks; size: Size; radius: number }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1200;
  const pad = 56 * s;
  const titleSize = (size.w < 1200 ? 58 : 72) * s;
  const lineSize = 18 * s;
  const slug =
    t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "post";
  const bg = t.background === "orb" ? "grid" : t.background;
  return (
    <Root tok={tok} fontFamily={MONO} radius={radius}>
      {bgLayers(bg, tok, t.accent)}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          gap: 28 * s,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 * s, fontSize: lineSize, color: tok.fgMuted }}>
          <span style={{ color: t.accent }}>~/{t.site.replace(/^https?:\/\//, "")}</span>
          <span style={{ color: tok.fgFaint }}>·</span>
          <span>main</span>
          <span style={{ color: tok.fgFaint }}>$</span>
          <span style={{ color: tok.fg }}>cat posts/{slug}.mdx</span>
        </div>

        <div style={{ display: "flex", height: 1, background: tok.line }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 8 * s, fontSize: lineSize, color: tok.fgMuted }}>
          <div style={{ display: "flex", gap: 16 * s }}>
            <span style={{ color: tok.fgFaint }}>tag:</span>
            <span style={{ color: t.accent }}>{`"${t.tag}"`}</span>
          </div>
          <div style={{ display: "flex", gap: 16 * s }}>
            <span style={{ color: tok.fgFaint }}>author:</span>
            <span style={{ color: tok.fg }}>{`"${t.author}"`}</span>
          </div>
          <div style={{ display: "flex", gap: 16 * s }}>
            <span style={{ color: tok.fgFaint }}>date:</span>
            <span>{`"${t.date}"`}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: SANS,
            fontSize: titleSize,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            maxWidth: "92%",
          }}
        >
          <span style={{ color: t.accent, marginRight: 14 * s }}>#</span>
          <span>{t.title}</span>
        </div>

        {t.subtitle ? (
          <div style={{ display: "flex", fontSize: lineSize * 1.05, lineHeight: 1.5, color: tok.fgMuted, maxWidth: "90%" }}>
            <span style={{ color: tok.fgFaint, marginRight: 8 * s }}>{"//"}</span>
            <span>{t.subtitle}</span>
          </div>
        ) : null}

        <div style={{ display: "flex", flexGrow: 1 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: lineSize * 0.95, color: tok.fgMuted }}>
          <div style={{ display: "flex", gap: 8 * s }}>
            <span style={{ color: tok.fgFaint }}>{">"}</span>
            <span>{t.readTime} read</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 * s, color: tok.fgFaint }}>
            <div style={{ width: 8 * s, height: 8 * s, borderRadius: 999, background: t.accent }} />
            {t.handle}
          </div>
        </div>
      </div>
    </Root>
  );
}

// ── Spotlight ────────────────────────────────────────────────────────────────

function Spotlight({ t, size, radius }: { t: Tweaks; size: Size; radius: number }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1200;
  const isSquare = Math.abs(size.w - size.h) < size.w * 0.1;
  const pad = 64 * s;
  const titleSize = (isSquare ? 84 : size.w < 1200 ? 64 : 96) * s;
  const metaSize = 15 * s;
  return (
    <Root tok={tok} fontFamily={SANS} radius={radius}>
      {bgLayers("orb", tok, t.accent)}
      {t.background === "grid" ? bgLayers("grid", tok, t.accent) : null}
      {t.background === "dots" ? bgLayers("dots", tok, t.accent) : null}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 28 * s,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10 * s,
            padding: `${8 * s}px ${16 * s}px`,
            borderRadius: 999,
            background: tok.card,
            border: `1px solid ${tok.line}`,
            fontFamily: MONO,
            fontSize: metaSize,
            color: tok.fgMuted,
          }}
        >
          <div style={{ width: 7 * s, height: 7 * s, borderRadius: 999, background: t.accent }} />
          {t.tag}
        </div>

        <div
          style={{
            display: "flex",
            textAlign: "center",
            fontSize: titleSize,
            lineHeight: 1.0,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            maxWidth: "90%",
            color: tok.fg,
          }}
        >
          {t.title}
        </div>

        {t.subtitle ? (
          <div style={{ display: "flex", fontSize: 22 * s, lineHeight: 1.45, color: tok.fgMuted, maxWidth: "70%", textAlign: "center" }}>
            {t.subtitle}
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", gap: 12 * s, marginTop: 8 * s, fontFamily: MONO, fontSize: metaSize, color: tok.fgMuted }}>
          {t.showAvatar ? <Avatar d={32 * s} tok={tok} name={t.author} /> : null}
          <span style={{ color: tok.fg }}>{t.author}</span>
          <span style={{ color: tok.fgFaint }}>·</span>
          <span>{t.date}</span>
          <span style={{ color: tok.fgFaint }}>·</span>
          <span>{t.readTime}</span>
        </div>
      </div>

      <div style={{ position: "absolute", top: pad * 0.6, left: pad * 0.6, display: "flex", fontFamily: MONO, fontSize: metaSize, color: tok.fgMuted }}>
        {t.site}
      </div>
      <div style={{ position: "absolute", top: pad * 0.6, right: pad * 0.6, display: "flex", fontFamily: MONO, fontSize: metaSize, color: tok.fgFaint }}>
        {t.handle}
      </div>
    </Root>
  );
}

// ── Square ───────────────────────────────────────────────────────────────────

function ImagePlaceholder({ tok, accent }: { tok: Tok; accent: string }) {
  const dots = [
    { left: "12%", top: "22%", size: 18, color: tok.fgMuted },
    { left: "22%", top: "20%", size: 18, color: tok.fgMuted },
    { left: "12%", top: "42%", size: 18, color: tok.fgMuted },
    { left: "12%", top: "82%", size: 18, color: tok.fgMuted },
    { left: "48%", top: "38%", size: 22, color: accent },
    { left: "62%", top: "52%", size: 16, color: accent },
    { left: "88%", top: "18%", size: 20, color: accent },
    { left: "30%", top: "62%", size: 18, color: accent },
    { left: "72%", top: "78%", size: 18, color: accent },
  ];
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: tok.bgAlt,
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "12%",
          left: "12%",
          right: "12%",
          bottom: "12%",
          border: `1.5px solid ${tok.line}`,
          borderRadius: 24,
          backgroundImage: `linear-gradient(${tok.line} 1px, transparent 1px), linear-gradient(90deg, ${tok.line} 1px, transparent 1px)`,
          backgroundSize: "33.33% 50%",
          backgroundPosition: "center",
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            position: "absolute",
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            borderRadius: 999,
            background: d.color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function Square({ t, size, radius }: { t: Tweaks; size: Size; radius: number }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1080;
  const pad = 56 * s;
  const metaSize = 16 * s;
  const titleSize = 32 * s;
  return (
    <Root tok={tok} fontFamily={SANS} radius={radius}>
      {bgLayers(t.background, tok, t.accent)}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          gap: 24 * s,
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: MONO,
            fontSize: metaSize,
            color: tok.fgMuted,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8 * s,
              padding: `${6 * s}px ${12 * s}px`,
              borderRadius: 999,
              border: `1px solid ${tok.line}`,
              background: tok.card,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 6 * s,
                height: 6 * s,
                borderRadius: 999,
                background: t.accent,
              }}
            />
            {t.tag}
          </div>
          <div style={{ display: "flex" }}>{t.site}</div>
        </div>

        {/* Image card */}
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            position: "relative",
            borderRadius: 28 * s,
            border: `1px solid ${tok.line}`,
            background: tok.card,
            overflow: "hidden",
          }}
        >
          {t.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={t.image}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <ImagePlaceholder tok={tok} accent={t.accent} />
          )}
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 * s, width: "100%" }}>
          {t.showAvatar ? <Avatar d={44 * s} tok={tok} name={t.author} /> : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 * s, flexGrow: 1 }}>
            <div
              style={{
                display: "flex",
                fontSize: titleSize,
                lineHeight: 1.15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: tok.fg,
              }}
            >
              {t.title}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: MONO,
                fontSize: metaSize * 0.85,
                color: tok.fgMuted,
                gap: 10 * s,
              }}
            >
              <span>{t.author}</span>
              <span style={{ color: tok.fgFaint }}>·</span>
              <span>{t.date}</span>
              <span style={{ color: tok.fgFaint }}>·</span>
              <span>{t.readTime}</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: MONO,
              fontSize: metaSize,
              color: tok.fgFaint,
              letterSpacing: "0.05em",
            }}
          >
            ↗ {t.handle}
          </div>
        </div>
      </div>
    </Root>
  );
}

export function bannerElement(variant: Variant, t: Tweaks, size: Size, radius: number) {
  if (variant === "terminal") return <Terminal t={t} size={size} radius={radius} />;
  if (variant === "spotlight") return <Spotlight t={t} size={size} radius={radius} />;
  if (variant === "square") return <Square t={t} size={size} radius={radius} />;
  return <Editorial t={t} size={size} radius={radius} />;
}
