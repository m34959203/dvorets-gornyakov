import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import Monogram from "./Monogram";
import { getMany } from "@/lib/db";

interface FooterProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  telegram?: string;
  tiktok?: string;
}

async function loadSocialLinks(): Promise<SocialLinks> {
  try {
    const rows = await getMany<{ key: string; value: string }>(
      `SELECT key, value FROM site_settings
        WHERE key IN ('social_instagram','social_facebook','social_youtube','social_telegram','social_tiktok','instagram_handle','telegram_channel')`
    );
    const map: Record<string, string> = {};
    for (const r of rows) {
      if (r.value && r.value.trim()) map[r.key] = r.value.trim();
    }
    const igHandle = map.instagram_handle?.replace(/^@/, "");
    const tgChannel = map.telegram_channel?.replace(/^@/, "");
    return {
      instagram: map.social_instagram || (igHandle ? `https://instagram.com/${igHandle}` : undefined),
      facebook: map.social_facebook,
      youtube: map.social_youtube,
      telegram: map.social_telegram || (tgChannel ? `https://t.me/${tgChannel}` : undefined),
      tiktok: map.social_tiktok,
    };
  } catch {
    return {};
  }
}

const socials = {
  ig: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.67.67 1.34 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.67 1.09-1.34 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  ),
  fb: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  yt: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 15.6 24 12 24 12s0-3.6-.5-5.5zM9.6 15.5v-7l6.3 3.5-6.3 3.5z" />
    </svg>
  ),
  tg: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.9 8.2-2 9.3c-.1.7-.6.8-1.2.5l-3.3-2.4-1.6 1.5c-.2.2-.3.3-.6.3l.2-3.4 6.1-5.5c.3-.2-.1-.4-.5-.1l-7.5 4.7-3.2-1c-.7-.2-.7-.7.1-1l12.6-4.8c.6-.2 1.1.1.9 1z" />
    </svg>
  ),
};

export default async function Footer({ locale }: FooterProps) {
  const social = await loadSocialLinks();
  const socialEntries = (
    [
      ["ig", social.instagram, "Instagram"],
      ["fb", social.facebook, "Facebook"],
      ["yt", social.youtube, "YouTube"],
      ["tg", social.telegram, "Telegram"],
      ["tt", social.tiktok, "TikTok"],
    ] as const
  ).filter(([, url]) => Boolean(url)) as Array<[string, string, string]>;
  return (
    <footer
      style={{
        background: "var(--emerald-dark)",
        color: "var(--text-light)",
        marginTop: "auto",
      }}
    >
      {/* Орнамент-бордюр */}
      <div className="ornament-band" />

      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "64px 64px 32px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: 56,
        }}
        className="etno-footer-grid"
      >
        {/* Brand column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <Monogram size={42} light />
            <div>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  color: "var(--text-light)",
                }}
              >
                DVORETS GORNYAKOV
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--ochre)",
                  marginTop: 4,
                }}
              >
                {locale === "kk" ? "Сатпаев · 1974" : "Сатпаев · 1974"}
              </div>
            </div>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-light-mute)",
              lineHeight: 1.6,
              maxWidth: 320,
              marginBottom: 22,
            }}
          >
            {locale === "kk"
              ? "Шынболат Дільдебаев атындағы тау-кенші мәдениет сарайы — Сатпаев қаласындағы 22 шығармашылық ұжымның үйі."
              : "Дворец культуры горняков им. Ш. Дильдебаева — дом для 22 творческих коллективов в Сатпаеве."}
          </p>
          {socialEntries.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {socialEntries.map(([k, url, label]) => (
                <a
                  key={k}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(247,241,230,0.08)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-light)",
                    transition: "background .2s",
                  }}
                >
                  {socials[k as keyof typeof socials] ?? null}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Меню */}
        <div>
          <h4
            style={{
              color: "var(--ochre)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {locale === "kk" ? "Меню" : "Меню"}
          </h4>
          <FooterLink href={`/${locale}/events`}>
            {locale === "kk" ? "Іс-шаралар афишасы" : "Афиша событий"}
          </FooterLink>
          <FooterLink href={`/${locale}/rent`}>
            {locale === "kk" ? "Зал жалға беру" : "Аренда залов"}
          </FooterLink>
          <FooterLink href={`/${locale}/clubs`}>
            {locale === "kk" ? "Үйірмелер мен студиялар" : "Кружки и студии"}
          </FooterLink>
          <FooterLink href={`/${locale}/news`}>
            {locale === "kk" ? "Жаңалықтар" : "Новости"}
          </FooterLink>
          <FooterLink href={`/${locale}/about`}>
            {locale === "kk" ? "Біз туралы" : "О нас"}
          </FooterLink>
          <FooterLink href={`/${locale}/rules`}>
            {locale === "kk" ? "Кіру ережелері" : "Правила посещения"}
          </FooterLink>
        </div>

        {/* Контакты */}
        <div>
          <h4
            style={{
              color: "var(--ochre)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {locale === "kk" ? "Байланыс" : "Контакты"}
          </h4>
          <p style={{ fontSize: 14, color: "var(--text-light-mute)", lineHeight: 1.6, marginBottom: 14 }}>
            {locale === "kk" ? "101300, Ұлытау облысы," : "101300, область Ұлытау,"}
            <br />
            {locale === "kk" ? "Сатпаев қ., К.И. Сәтбаев даңғ., 106" : "г. Сатпаев, пр. К.И. Сатпаева, 106"}
          </p>
          <p style={{ fontSize: 14, color: "var(--text-light-mute)", lineHeight: 1.6, marginBottom: 14 }}>
            +7 (71063) 6-23-30
            <br />
            info@dvorets-gornyakov.kz
          </p>
          <p style={{ fontSize: 14, color: "var(--text-light-mute)", lineHeight: 1.6 }}>
            {locale === "kk" ? "Дс–Жм 09:00–18:00" : "Пн–Пт 09:00–18:00"}
            <br />
            {locale === "kk" ? "Сб–Жс 10:00–17:00" : "Сб–Вс 10:00–17:00"}
          </p>
        </div>

        {/* Соцсети */}
        <div>
          <h4
            style={{
              color: "var(--ochre)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {locale === "kk" ? "Әлеуметтік желілер" : "Соцсети"}
          </h4>
          {socialEntries.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-light-mute)", lineHeight: 1.55 }}>
              {locale === "kk" ? "Жақын арада пайда болады" : "Скоро появятся"}
            </p>
          ) : (
            socialEntries.map(([k, url, label]) => (
              <FooterLink key={k} href={url} external>
                {label}
              </FooterLink>
            ))
          )}
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          borderTop: "1px solid var(--line-light)",
          padding: "22px 64px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 12,
          color: "var(--text-light-mute)",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <span>
          © {new Date().getFullYear()} —{" "}
          {locale === "kk"
            ? "КМҚК «Ш. Ділдебаев атындағы тау-кенші мәдениет сарайы». Барлық құқықтар қорғалған."
            : "КГКП «Дворец культуры горняков им. Ш. Дильдебаева». Все права защищены."}
        </span>
        <Link
          href={`/${locale}/rules`}
          style={{ color: "var(--text-light-mute)", textDecoration: "none" }}
        >
          {locale === "kk" ? "Кіру ережелері" : "Правила посещения"}
        </Link>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const style = {
    display: "block",
    fontSize: 14,
    color: "var(--text-light-mute)",
    textDecoration: "none",
    marginBottom: 10,
    lineHeight: 1.55,
    transition: "color .15s",
  } as const;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} style={style}>
      {children}
    </Link>
  );
}
