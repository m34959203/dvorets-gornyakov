"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

interface EtnoHeroProps {
  locale: Locale;
  slogan: string;
  subline: string;
}

/**
 * Полноэкранный hero этно-модерн дизайна:
 * — фон: тёмный изумруд + охра, силуэт зрительного зала (ряды кресел)
 * — поверх: лёгкий ornamental overlay
 * — центр: ромб-диамантовый разделитель + слоган + подпись
 * — снизу: индикатор скролла
 */
export default function EtnoHero({ slogan, subline }: EtnoHeroProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Ряды кресел — генерируются один раз
  const seatRows = Array.from({ length: 14 }).map((_, row) => {
    const y = 380 + row * 26;
    const cnt = 26 + row * 2;
    const w = 1100 + row * 40;
    const x0 = 720 - w / 2;
    return { row, y, cnt, w, x0 };
  });

  return (
    <section
      style={{
        position: "relative",
        height: 700,
        overflow: "hidden",
        color: "var(--text-light)",
      }}
    >
      {/* Базовый градиент */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 70% 40%, rgba(212,168,67,0.35) 0%, transparent 55%), linear-gradient(160deg, #074143 0%, #095456 50%, #0d7377 100%)",
        }}
      >
        {/* Размытое фото фасада — фотографическая фактура под орнаментом.
            blur+scale скрывают низкое разрешение исходника (613×409). */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("/photos/dvorets-01.webp")',
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
            filter: "blur(6px)",
            transform: "scale(1.08)",
            opacity: 0.3,
          }}
        />
        {/* Силуэт зала */}
        <svg
          viewBox="0 0 1440 760"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <radialGradient id="etno-stage" cx="50%" cy="20%" r="50%">
              <stop offset="0%" stopColor="#d4a843" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#d4a843" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="720" cy="120" rx="320" ry="100" fill="url(#etno-stage)" />
          {seatRows.map(({ row, y, cnt, w, x0 }) =>
            Array.from({ length: cnt }).map((_, i) => (
              <rect
                key={`${row}-${i}`}
                x={x0 + i * (w / cnt)}
                y={y}
                width={w / cnt - 4}
                height="14"
                rx="3"
                fill="#000"
                opacity={0.35 + row * 0.025}
              />
            ))
          )}
        </svg>
        {/* Ornament overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23d4a843' stroke-width='0.8' opacity='0.08'><path d='M100 30 C 60 50, 60 110, 100 130 C 140 110, 140 50, 100 30 Z'/><circle cx='100' cy='80' r='4'/></g></svg>")`,
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(7,65,67,0.45) 0%, transparent 35%, transparent 70%, rgba(7,65,67,0.7) 100%)",
          }}
        />
      </div>

      {/* Тёмный radial-shadow под слоганом для читаемости */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(96%, 1200px)",
          height: 360,
          background:
            "radial-gradient(ellipse at center, rgba(7,65,67,0.65) 0%, rgba(7,65,67,0.35) 45%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Центральный слоган */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
          padding: "0 32px",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginBottom: 22,
            opacity: 0.85,
          }}
        >
          <span style={{ width: 60, height: 1, background: "var(--ochre)" }} />
          <svg width="6" height="6" viewBox="0 0 6 6">
            <rect width="6" height="6" fill="#d4a843" transform="rotate(45 3 3)" />
          </svg>
          <span style={{ width: 60, height: 1, background: "var(--ochre)" }} />
        </div>
        <h1
          style={{
            color: "var(--text-light)",
            fontSize: "clamp(32px, 5vw, 64px)",
            letterSpacing: "-0.025em",
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: 1100,
            margin: "0 auto",
            fontFamily: "var(--font-head)",
            textShadow: "0 4px 24px rgba(7,65,67,0.85), 0 1px 2px rgba(0,0,0,0.4)",
          }}
        >
          {slogan}
        </h1>
        <p
          style={{
            color: "var(--ochre)",
            marginTop: 18,
            fontSize: 13,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {subline}
        </p>
      </div>

      {/* Скролл-индикатор */}
      {mounted && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 32,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            color: "var(--text-light)",
            opacity: 0.65,
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            ↓
          </span>
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
            <rect x="0.5" y="0.5" width="19" height="31" rx="9.5" stroke="currentColor" />
            <circle cx="10" cy="10" r="2" fill="currentColor" />
          </svg>
        </div>
      )}
    </section>
  );
}
