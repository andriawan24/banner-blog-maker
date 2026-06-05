// Banner.tsx — three layout variants of a customizable social/blog banner.
// Ported from the Social Banner Template design. All variants take the same
// `t` (Tweaks) object and a `size` ({ w, h }), so one tweak drives every layout.

import React from "react";
import {
  type Tweaks,
  type Theme,
  type Background,
  type Variant,
  themeTokens,
} from "@/lib/banner";

const SANS = "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-geist-mono), ui-monospace, monospace";

export type Size = { w: number; h: number };

// ── Avatar ───────────────────────────────────────────────────────────────────

function AvatarPlaceholder({
  size = 56,
  accent,
  theme,
  initials = "NA",
}: {
  size?: number;
  accent: string;
  theme: Theme;
  initials?: string;
}) {
  const tok = themeTokens(theme);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: tok.card,
        border: `1px solid ${tok.line}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: tok.fgMuted,
        fontFamily: MONO,
        fontSize: size * 0.34,
        fontWeight: 500,
        letterSpacing: "0.04em",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          background: `repeating-linear-gradient(135deg, transparent 0 6px, ${accent}22 6px 7px)`,
        }}
      />
      <span style={{ position: "relative" }}>{initials}</span>
    </div>
  );
}

// ── Backgrounds ────────────────────────────────────────────────────────────--

function BgGrid({ tok }: { tok: ReturnType<typeof themeTokens> }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `linear-gradient(${tok.line} 1px, transparent 1px),
                          linear-gradient(90deg, ${tok.line} 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        maskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 100%)",
      }}
    />
  );
}

function BgDots({ tok }: { tok: ReturnType<typeof themeTokens> }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(${tok.fgFaint} 1.2px, transparent 1.2px)`,
        backgroundSize: "28px 28px",
        opacity: 0.45,
      }}
    />
  );
}

function BgOrb({ accent }: { accent: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-15%",
          top: "-30%",
          width: "70%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background: `radial-gradient(circle at 30% 30%, ${accent}55, ${accent}00 60%)`,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-10%",
          bottom: "-25%",
          width: "55%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background: `radial-gradient(circle at 60% 40%, ${accent}33, ${accent}00 60%)`,
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}

function BgNoise({ tok }: { tok: ReturnType<typeof themeTokens> }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(45deg, ${tok.line} 0 1px, transparent 1px 12px)`,
        opacity: 0.6,
      }}
    />
  );
}

function Bg({
  kind,
  tok,
  accent,
}: {
  kind: Background;
  tok: ReturnType<typeof themeTokens>;
  accent: string;
}) {
  if (kind === "grid") return <BgGrid tok={tok} />;
  if (kind === "dots") return <BgDots tok={tok} />;
  if (kind === "orb") return <BgOrb accent={accent} />;
  if (kind === "lines") return <BgNoise tok={tok} />;
  return null;
}

// ── Variant 1: Editorial ───────────────────────────────────────────────────--

function EditorialBanner({ t, size }: { t: Tweaks; size: Size }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1200;
  const pad = 64 * s;
  const titleSize = (size.w < 1200 ? 64 : 80) * s;
  const subSize = 24 * s;
  const metaSize = 16 * s;
  const words = t.title.split(" ");
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: tok.bg,
        color: tok.fg,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      <Bg kind={t.background} tok={tok} accent={t.accent} />

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: tag + site */}
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8 * s,
              padding: `${6 * s}px ${12 * s}px`,
              borderRadius: 999,
              border: `1px solid ${tok.line}`,
              background: tok.card,
            }}
          >
            <i
              style={{
                width: 6 * s,
                height: 6 * s,
                borderRadius: "50%",
                background: t.accent,
                display: "inline-block",
              }}
            />
            {t.tag}
          </span>
          <span style={{ letterSpacing: "0.02em" }}>{t.site}</span>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20 * s,
            maxWidth: "78%",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: titleSize,
              lineHeight: 1.04,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            {words.map((word, i) => {
              if (i === words.length - 1 && t.accentLastWord) {
                return (
                  <span key={i} style={{ color: t.accent }}>
                    {word}
                  </span>
                );
              }
              return (
                <React.Fragment key={i}>
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </React.Fragment>
              );
            })}
          </h1>
          {t.subtitle && (
            <p
              style={{
                margin: 0,
                fontSize: subSize,
                lineHeight: 1.45,
                color: tok.fgMuted,
                maxWidth: "85%",
                textWrap: "pretty",
              }}
            >
              {t.subtitle}
            </p>
          )}
        </div>

        {/* Bottom row: meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 * s }}>
          {t.showAvatar && (
            <AvatarPlaceholder size={48 * s} accent={t.accent} theme={t.theme} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 * s }}>
            <div style={{ fontSize: metaSize * 1.05, fontWeight: 500, color: tok.fg }}>
              {t.author}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: metaSize * 0.85,
                color: tok.fgMuted,
                display: "flex",
                gap: 10 * s,
              }}
            >
              <span>{t.date}</span>
              <span style={{ color: tok.fgFaint }}>·</span>
              <span>{t.readTime}</span>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
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
    </div>
  );
}

// ── Variant 2: Terminal ────────────────────────────────────────────────────--

function TerminalBanner({ t, size }: { t: Tweaks; size: Size }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1200;
  const pad = 56 * s;
  const titleSize = (size.w < 1200 ? 58 : 72) * s;
  const lineSize = 18 * s;
  const slug = t.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: tok.bg,
        color: tok.fg,
        overflow: "hidden",
        fontFamily: MONO,
      }}
    >
      <Bg
        kind={t.background === "orb" ? "grid" : t.background}
        tok={tok}
        accent={t.accent}
      />

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          gap: 28 * s,
        }}
      >
        {/* Faux prompt line */}
        <div
          style={{
            fontSize: lineSize,
            color: tok.fgMuted,
            display: "flex",
            gap: 12 * s,
            alignItems: "center",
          }}
        >
          <span style={{ color: t.accent }}>
            ~/{t.site.replace(/^https?:\/\//, "")}
          </span>
          <span style={{ color: tok.fgFaint }}>·</span>
          <span>main</span>
          <span style={{ color: tok.fgFaint }}>$</span>
          <span style={{ color: tok.fg }}>cat posts/{slug}.mdx</span>
        </div>

        <div style={{ height: 1, background: tok.line }} />

        {/* Frontmatter-style metadata */}
        <div
          style={{
            fontSize: lineSize,
            color: tok.fgMuted,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 24 * s,
            rowGap: 8 * s,
            alignItems: "baseline",
          }}
        >
          <span style={{ color: tok.fgFaint }}>tag:</span>
          <span style={{ color: t.accent }}>{`"${t.tag}"`}</span>
          <span style={{ color: tok.fgFaint }}>author:</span>
          <span style={{ color: tok.fg }}>{`"${t.author}"`}</span>
          <span style={{ color: tok.fgFaint }}>date:</span>
          <span>{`"${t.date}"`}</span>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontFamily: SANS,
            fontSize: titleSize,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            textWrap: "balance",
            maxWidth: "92%",
          }}
        >
          <span style={{ color: t.accent, marginRight: 14 * s }}>#</span>
          {t.title}
        </h1>

        {/* Subtitle as comment */}
        {t.subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: lineSize * 1.05,
              lineHeight: 1.5,
              color: tok.fgMuted,
              maxWidth: "90%",
            }}
          >
            <span style={{ color: tok.fgFaint }}>{"// "}</span>
            {t.subtitle}
          </p>
        )}

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: lineSize * 0.95,
            color: tok.fgMuted,
          }}
        >
          <span>
            <span style={{ color: tok.fgFaint }}>{">"}</span> {t.readTime} read
          </span>
          <span
            style={{
              color: tok.fgFaint,
              display: "flex",
              alignItems: "center",
              gap: 8 * s,
            }}
          >
            <i
              style={{
                width: 8 * s,
                height: 8 * s,
                borderRadius: "50%",
                background: t.accent,
                display: "inline-block",
              }}
            />
            {t.handle}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Variant 3: Spotlight ───────────────────────────────────────────────────--

function SpotlightBanner({ t, size }: { t: Tweaks; size: Size }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1200;
  const isSquare = Math.abs(size.w - size.h) < size.w * 0.1;
  const pad = 64 * s;
  const titleSize = (isSquare ? 84 : size.w < 1200 ? 64 : 96) * s;
  const subSize = 22 * s;
  const metaSize = 15 * s;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: tok.bg,
        color: tok.fg,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      <BgOrb accent={t.accent} />
      {t.background === "grid" && <BgGrid tok={tok} />}
      {t.background === "dots" && <BgDots tok={tok} />}

      <div
        style={{
          position: "relative",
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
        {/* Tag pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10 * s,
            padding: `${8 * s}px ${16 * s}px`,
            borderRadius: 999,
            background: tok.card,
            border: `1px solid ${tok.line}`,
            fontFamily: MONO,
            fontSize: metaSize,
            color: tok.fgMuted,
            letterSpacing: "0.02em",
          }}
        >
          <i
            style={{
              width: 7 * s,
              height: 7 * s,
              borderRadius: "50%",
              background: t.accent,
              boxShadow: `0 0 ${10 * s}px ${t.accent}`,
            }}
          />
          {t.tag}
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: titleSize,
            lineHeight: 1.0,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            textWrap: "balance",
            maxWidth: "90%",
          }}
        >
          {t.title}
        </h1>

        {/* Subtitle */}
        {t.subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: subSize,
              lineHeight: 1.45,
              color: tok.fgMuted,
              maxWidth: "70%",
              textWrap: "pretty",
            }}
          >
            {t.subtitle}
          </p>
        )}

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12 * s,
            marginTop: 8 * s,
            fontFamily: MONO,
            fontSize: metaSize,
            color: tok.fgMuted,
          }}
        >
          {t.showAvatar && (
            <AvatarPlaceholder size={32 * s} accent={t.accent} theme={t.theme} />
          )}
          <span style={{ color: tok.fg }}>{t.author}</span>
          <span style={{ color: tok.fgFaint }}>·</span>
          <span>{t.date}</span>
          <span style={{ color: tok.fgFaint }}>·</span>
          <span>{t.readTime}</span>
        </div>
      </div>

      {/* Corner brand */}
      <div
        style={{
          position: "absolute",
          top: pad * 0.6,
          left: pad * 0.6,
          fontFamily: MONO,
          fontSize: metaSize,
          color: tok.fgMuted,
          letterSpacing: "0.02em",
        }}
      >
        {t.site}
      </div>
      <div
        style={{
          position: "absolute",
          top: pad * 0.6,
          right: pad * 0.6,
          fontFamily: MONO,
          fontSize: metaSize,
          color: tok.fgFaint,
          display: "flex",
          alignItems: "center",
          gap: 8 * s,
        }}
      >
        <span>{t.handle}</span>
      </div>
    </div>
  );
}

// ── Variant 4: Square ──────────────────────────────────────────────────────--

function ImagePlaceholder({
  tok,
  accent,
}: {
  tok: ReturnType<typeof themeTokens>;
  accent: string;
}) {
  // Decorative dot pattern shown when no image URL is provided.
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
        position: "absolute",
        inset: 0,
        background: tok.bgAlt,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "12%",
          border: `1.5px solid ${tok.line}`,
          borderRadius: 24,
          backgroundImage: `linear-gradient(${tok.line} 1px, transparent 1px),
                            linear-gradient(90deg, ${tok.line} 1px, transparent 1px)`,
          backgroundSize: "33.33% 50%",
          backgroundPosition: "center",
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: d.color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function SquareBanner({ t, size }: { t: Tweaks; size: Size }) {
  const tok = themeTokens(t.theme);
  const s = size.w / 1080;
  const pad = 56 * s;
  const metaSize = 16 * s;
  const titleSize = 32 * s;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: tok.bg,
        color: tok.fg,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      <Bg kind={t.background} tok={tok} accent={t.accent} />

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: pad,
          display: "flex",
          flexDirection: "column",
          gap: 24 * s,
        }}
      >
        {/* Top row: tag + site */}
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8 * s,
              padding: `${6 * s}px ${12 * s}px`,
              borderRadius: 999,
              border: `1px solid ${tok.line}`,
              background: tok.card,
            }}
          >
            <i
              style={{
                width: 6 * s,
                height: 6 * s,
                borderRadius: "50%",
                background: t.accent,
                display: "inline-block",
              }}
            />
            {t.tag}
          </span>
          <span style={{ letterSpacing: "0.02em" }}>{t.site}</span>
        </div>

        {/* Image card — centered, fills available space */}
        <div
          style={{
            flex: 1,
            position: "relative",
            borderRadius: 28 * s,
            border: `1px solid ${tok.line}`,
            background: tok.card,
            overflow: "hidden",
            boxShadow: `0 ${20 * s}px ${60 * s}px -${20 * s}px rgba(0,0,0,0.35)`,
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
                display: "block",
              }}
            />
          ) : (
            <ImagePlaceholder tok={tok} accent={t.accent} />
          )}
        </div>

        {/* Bottom row: title + byline */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 * s }}>
          {t.showAvatar && (
            <AvatarPlaceholder size={44 * s} accent={t.accent} theme={t.theme} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 * s, minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: titleSize,
                lineHeight: 1.15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: tok.fg,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {t.title}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: metaSize * 0.85,
                color: tok.fgMuted,
                display: "flex",
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
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────────────────────--

export function Banner({
  variant,
  t,
  size,
}: {
  variant: Variant;
  t: Tweaks;
  size: Size;
}) {
  if (variant === "terminal") return <TerminalBanner t={t} size={size} />;
  if (variant === "spotlight") return <SpotlightBanner t={t} size={size} />;
  if (variant === "square") return <SquareBanner t={t} size={size} />;
  return <EditorialBanner t={t} size={size} />;
}
