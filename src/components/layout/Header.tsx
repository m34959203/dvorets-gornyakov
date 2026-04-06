"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import MobileNav from "./MobileNav";

interface HeaderProps {
  locale: Locale;
  messages: Record<string, Record<string, string>>;
}

export default function Header({ locale, messages }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = messages.common;

  const navItems = [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/news`, label: t.news },
    { href: `/${locale}/clubs`, label: t.clubs },
    { href: `/${locale}/events`, label: t.events },
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/contacts`, label: t.contacts },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        {/* Top bar with ornament */}
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm lg:text-base font-bold text-gray-900 leading-tight">
                  {t.siteNameShort}
                </div>
                <div className="text-xs text-gray-500">
                  {locale === "kk" ? "Жезқазған қ." : "г. Жезказган"}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    "text-gray-700 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher locale={locale} />
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        locale={locale}
      />
    </>
  );
}
