import Link from "next/link";
import type { Locale } from "@/lib/i18n";

interface FooterProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
}

const socials = {
  ig: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.67.67 1.34 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.67 1.09-1.34 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12C21.32 1.35 20.65.93 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  ),
  fb: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  ),
  yt: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 15.6 24 12 24 12s0-3.6-.5-5.5zM9.6 15.5v-7l6.3 3.5-6.3 3.5z" />
    </svg>
  ),
  tg: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.9 8.2-2 9.3c-.1.7-.6.8-1.2.5l-3.3-2.4-1.6 1.5c-.2.2-.3.3-.6.3l.2-3.4 6.1-5.5c.3-.2-.1-.4-.5-.1l-7.5 4.7-3.2-1c-.7-.2-.7-.7.1-1l12.6-4.8c.6-.2 1.1.1.9 1z" />
    </svg>
  ),
};

export default function Footer({ locale }: FooterProps) {
  return (
    <footer
      className="mt-auto relative pt-16 pb-6 text-white/70"
      style={{ background: "var(--navy-900)" }}
    >
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="ornament on-dark mb-14" />

        <div className="grid gap-10 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3.5">
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "var(--navy)",
                  color: "var(--ochre)",
                  border: "2px solid var(--ochre)",
                  boxShadow:
                    "inset 0 0 0 3px var(--navy), inset 0 0 0 4px var(--ochre-soft)",
                  fontFamily: "var(--font-head)",
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                Д
              </div>
              <div className="leading-tight">
                <div
                  className="font-semibold text-white text-[17px]"
                  style={{ fontFamily: "var(--font-head)" }}
                >
                  {locale === "kk" ? "Тау-кенші сарайы" : "Дворец горняков"}
                </div>
                <div className="text-[12px] text-white/55 uppercase tracking-[0.06em]">
                  {locale === "kk" ? "Ш. Ділдебаев атындағы" : "им. Ш. Дильдебаева"}
                </div>
              </div>
            </div>
            <p className="mt-5 text-[14px] leading-[1.7] max-w-[320px]">
              {locale === "kk"
                ? "1965 жылдан бері Жезқазғанның мәдени орталығы. 60 жылдан астам уақыт бойы біз өнер, салт-дәстүр және адамдарды бір шаңырақ астына жинаймыз."
                : "Культурный центр Жезказгана с 1965 года. Более 60 лет мы собираем искусство, традиции и людей под одной крышей."}
            </p>
            <div className="flex gap-2.5 mt-6">
              {(["ig", "fb", "yt", "tg"] as const).map((k) => (
                <a
                  key={k}
                  href="#"
                  aria-label={k}
                  className="w-[38px] h-[38px] rounded-full bg-white/8 grid place-items-center hover:bg-[color:var(--ochre)] hover:text-[color:var(--navy-900)] transition-colors"
                >
                  {socials[k]}
                </a>
              ))}
            </div>
          </div>

          {/* Разделы */}
          <div>
            <h4 className="text-white text-[14px] uppercase tracking-[0.15em] font-bold mb-4">
              {locale === "kk" ? "Бөлімдер" : "Разделы"}
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
          </div>

          {/* Информация */}
          <div>
            <h4 className="text-white text-[14px] uppercase tracking-[0.15em] font-bold mb-4">
              {locale === "kk" ? "Ақпарат" : "Информация"}
            </h4>
            <FooterLink href={`/${locale}/rules`}>
              {locale === "kk" ? "Кіру ережелері" : "Правила посещения"}
            </FooterLink>
            <FooterLink href={`/${locale}/resources`}>
              {locale === "kk" ? "Ресурстар" : "Электронные ресурсы"}
            </FooterLink>
            <FooterLink href="#">
              {locale === "kk" ? "Зал схемасы" : "Схема залов"}
            </FooterLink>
            <FooterLink href="#">
              {locale === "kk" ? "Билетті қайтару" : "Возврат билетов"}
            </FooterLink>
            <FooterLink href="#">
              {locale === "kk" ? "Бос жұмыс орны" : "Вакансии"}
            </FooterLink>
          </div>

          {/* Контакты */}
          <div>
            <h4 className="text-white text-[14px] uppercase tracking-[0.15em] font-bold mb-4">
              {locale === "kk" ? "Байланыс" : "Контакты"}
            </h4>
            <FooterLink href={`/${locale}/contacts`}>
              {locale === "kk" ? "100600, Жезқазған қ." : "100600, г. Жезказган"}
              <br />
              {locale === "kk" ? "Бұқар жырау д-лы, 27" : "пр. Бухар жырау, 27"}
            </FooterLink>
            <FooterLink href="tel:+77102720000">
              +7 (7102) 72-00-00 — {locale === "kk" ? "қабылдау" : "приёмная"}
            </FooterLink>
            <FooterLink href="tel:+77102720101">
              +7 (7102) 72-01-01 — {locale === "kk" ? "касса" : "касса"}
            </FooterLink>
            <FooterLink href="mailto:info@dvorets-gornyakov.kz">
              info@dvorets-gornyakov.kz
            </FooterLink>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-[13px] text-white/50">
          <div>
            © 1965–{new Date().getFullYear()}{" "}
            {locale === "kk"
              ? "КМҚК «Ш. Ділдебаев атындағы тау-кенші сарайы». Барлық құқықтар қорғалған."
              : "КГКП «Дворец культуры горняков им. Ш. Дильдебаева». Все права защищены."}
          </div>
          <div>
            {locale === "kk" ? "Құпиялық саясаты · Сайт картасы" : "Политика конфиденциальности · Карта сайта"}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block py-[5px] text-[14.5px] text-white/70 hover:text-[color:var(--ochre-soft)] transition-colors"
    >
      {children}
    </Link>
  );
}
