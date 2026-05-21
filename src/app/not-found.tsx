import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse at 70% 30%, rgba(212,168,67,0.25) 0%, transparent 55%), linear-gradient(160deg, #074143 0%, #095456 50%, #0d7377 100%)",
          color: "var(--text-light, #f7f1e6)",
          fontFamily: "var(--font-body, 'Inter'), system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Орнамент-overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23d4a843' stroke-width='0.8' opacity='0.08'><path d='M100 30 C 60 50, 60 110, 100 130 C 140 110, 140 50, 100 30 Z'/><circle cx='100' cy='80' r='4'/></g></svg>\")",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 720 }}>
          {/* Монограмма */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(247,241,230,0.12)",
              border: "1.5px solid #d4a843",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 28 28" fill="none">
              <path d="M14 4 C 5 8, 5 20, 14 24 C 23 20, 23 8, 14 4 Z" stroke="#d4a843" strokeWidth="1.4" />
              <circle cx="14" cy="14" r="2.4" fill="#d4a843" />
              <path d="M9 14 C 9 11, 11.5 9.5, 14 9.5" stroke="#d4a843" strokeWidth="1.2" />
              <path d="M19 14 C 19 11, 16.5 9.5, 14 9.5" stroke="#d4a843" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Diamond divider */}
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
            <span style={{ width: 60, height: 1, background: "#d4a843" }} />
            <svg width="6" height="6" viewBox="0 0 6 6">
              <rect width="6" height="6" fill="#d4a843" transform="rotate(45 3 3)" />
            </svg>
            <span style={{ width: 60, height: 1, background: "#d4a843" }} />
          </div>

          <div
            style={{
              fontFamily: "var(--font-head, 'Manrope'), sans-serif",
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              color: "#d4a843",
              marginBottom: 16,
            }}
          >
            404
          </div>

          <h1
            style={{
              fontFamily: "var(--font-head, 'Manrope'), sans-serif",
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              marginBottom: 16,
              color: "#f7f1e6",
            }}
          >
            Бет табылмады · Страница не найдена
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 520,
              margin: "0 auto 32px",
              opacity: 0.78,
            }}
          >
            Сіз сұраған бет жоқ немесе жылжытылды.
            <br />
            Запрошенная страница не существует или была перемещена.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/ru"
              style={{
                background: "#d4a843",
                color: "#1c1c1c",
                padding: "14px 28px",
                borderRadius: 999,
                fontFamily: "var(--font-head, 'Manrope'), sans-serif",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              На главную · Басты бетке
            </Link>
            <Link
              href="/ru/events"
              style={{
                background: "transparent",
                color: "#f7f1e6",
                padding: "14px 28px",
                borderRadius: 999,
                border: "1.5px solid rgba(247,241,230,0.4)",
                fontFamily: "var(--font-head, 'Manrope'), sans-serif",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Афиша · Іс-шаралар
            </Link>
          </div>

          <div
            style={{
              marginTop: 64,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#d4a843",
              opacity: 0.7,
            }}
          >
            DVORETS GORNYAKOV · САТПАЕВ
          </div>
        </div>
      </body>
    </html>
  );
}
