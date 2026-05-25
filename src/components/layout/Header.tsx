import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import HeaderClient from "./HeaderClient";
import { getNavTree, localizeHref, type NavItem } from "@/lib/nav";

interface HeaderProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
  overlay?: boolean;
}

// Chiaroscuro-редизайн v4: тёмная sticky-шапка, бренд-эквалайзер,
// центрированная навигация uppercase, выпадающий язык РУС/ҚАЗ, дровер.
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
    <header className="dg-header">
      <div className="dg-wrap dg-header-inner">
        {/* Бренд */}
        <Link href={`/${locale}`} className="dg-brand" aria-label="Дворец горняков · главная">
          <div className="dg-brand-eq" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </div>
          <div className="dg-brand-text">
            <div className="dg-brand-name">DVORETS GORNYAKOV</div>
            <div className="dg-brand-sub">
              {locale === "kk" ? "Сәтбаев · Тау-кенші сарайы" : "Сатпаев · Дворец горняков"}
            </div>
          </div>
        </Link>

        <HeaderClient locale={locale} navItems={navItems} />
      </div>
    </header>
  );
}
