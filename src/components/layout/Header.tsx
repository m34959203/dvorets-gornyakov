import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import HeaderClient from "./HeaderClient";
import Monogram from "./Monogram";
import { getNavTree, localizeHref, type NavItem } from "@/lib/nav";

interface HeaderProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
  overlay?: boolean;
}

export default async function Header({ locale, overlay = false }: HeaderProps) {
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
    <header
      className={overlay ? "etno-header etno-header-overlay" : "etno-header"}
      style={{
        position: overlay ? "absolute" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: overlay ? "rgba(9, 84, 86, 0.45)" : "#fff",
        backdropFilter: overlay ? "blur(8px)" : undefined,
        borderBottom: overlay ? "1px solid rgba(247,241,230,0.12)" : "1px solid var(--line)",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "18px 36px",
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Brand */}
        <Link href={`/${locale}`} style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, textDecoration: "none" }}>
          <Monogram size={46} light={overlay} />
          <div style={{ display: "flex", flexDirection: "column", gap: 3, lineHeight: 1.2 }}>
            <strong
              style={{
                fontFamily: "var(--font-head)",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.12em",
                color: overlay ? "var(--text-light)" : "var(--text)",
              }}
            >
              DVORETS GORNYAKOV
            </strong>
            <span
              style={{
                fontSize: 10.5,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: overlay ? "var(--ochre)" : "var(--text-mute)",
              }}
            >
              {locale === "kk" ? "Сатпаев · Тау-кенші сарайы" : "Сатпаев · Дворец горняков"}
            </span>
          </div>
        </Link>

        {/* Nav + actions */}
        <HeaderClient locale={locale} navItems={navItems} overlay={overlay}>
          <LanguageSwitcher locale={locale} overlay={overlay} />
        </HeaderClient>
      </div>
    </header>
  );
}
