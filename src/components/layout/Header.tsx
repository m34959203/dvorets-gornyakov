import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import HeaderClient from "./HeaderClient";
import { getNavTree, localizeHref, type NavItem } from "@/lib/nav";

interface HeaderProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
}

export default async function Header({ locale }: HeaderProps) {
  let navTree: NavItem[] = [];
  try {
    navTree = await getNavTree(locale);
  } catch (e) {
    console.error("Header getNavTree error:", e);
    navTree = [];
  }

  const navItems = navTree.map((n) => ({
    id: n.id,
    href: localizeHref(n.url, locale),
    label: n.title,
    target: n.target,
    children: n.children.map((c) => ({
      id: c.id,
      href: localizeHref(c.url, locale),
      label: c.title,
      target: c.target,
    })),
  }));

  return (
    <>
      {/* Top bar */}
      <div className="bg-[color:var(--navy-900)] text-white/80 text-[13px]">
        <div className="max-w-[1240px] mx-auto px-7 flex items-center justify-between h-10">
          <div className="hidden md:flex items-center gap-5">
            <Link href={`/${locale}/about`} className="hover:text-[color:var(--ochre-soft)]">
              {locale === "kk" ? "Сарай туралы" : "О дворце"}
            </Link>
            <Link href={`/${locale}/news`} className="hover:text-[color:var(--ochre-soft)]">
              {locale === "kk" ? "Жаңалықтар" : "Новости"}
            </Link>
            <a href="#" className="hover:text-[color:var(--ochre-soft)]">
              {locale === "kk" ? "Бос жұмыс орны" : "Вакансии"}
            </a>
            <a href="#" className="hover:text-[color:var(--ochre-soft)]">
              {locale === "kk" ? "Мем. сатып алу" : "Госзакупки"}
            </a>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="hidden sm:inline">
              {locale === "kk" ? "Касса: күн сайын 10:00–19:00" : "Касса: ежедневно 10:00–19:00"}
            </span>
            <span className="hidden sm:inline w-px h-3.5 bg-white/20" />
            <a
              href="tel:+77102720000"
              className="inline-flex items-center gap-1.5 hover:text-[color:var(--ochre-soft)]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.31 1.85.53 2.81.66A2 2 0 0 1 22 16.92z"/>
              </svg>
              +7 (7102) 72-00-00
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-b border-[color:var(--line)] sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-7">
          <div className="flex items-center gap-7 py-4">
            {/* Brand */}
            <Link href={`/${locale}`} className="flex items-center gap-3.5 shrink-0">
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "var(--navy)",
                  color: "var(--ochre)",
                  border: "2px solid var(--ochre)",
                  boxShadow: "inset 0 0 0 3px var(--navy), inset 0 0 0 4px var(--ochre-soft)",
                  fontFamily: "var(--font-head)",
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                Д
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="font-serif font-semibold text-[17px] text-[color:var(--navy)]" style={{ fontFamily: "var(--font-head)" }}>
                  {locale === "kk" ? "Тау-кенші сарайы" : "Дворец горняков"}
                </div>
                <div className="text-[12px] text-[color:var(--muted)] uppercase tracking-[0.06em]">
                  {locale === "kk" ? "Ш. Ділдебаев · Жезқазған" : "им. Ш. Дильдебаева · Жезказган"}
                </div>
              </div>
            </Link>

            {/* Desktop nav + mobile toggle */}
            <HeaderClient locale={locale} navItems={navItems}>
              <LanguageSwitcher locale={locale} />
              <Link
                href={`/${locale}/rent`}
                className="btn btn-navy btn-sm hidden md:inline-flex"
              >
                {locale === "kk" ? "Брондау" : "Забронировать"}
              </Link>
            </HeaderClient>
          </div>
        </div>
      </header>
    </>
  );
}
