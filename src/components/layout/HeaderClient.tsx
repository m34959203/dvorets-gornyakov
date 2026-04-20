"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import MobileNav from "./MobileNav";

export interface ClientNavItem {
  id: string;
  href: string;
  label: string;
  target: "_self" | "_blank";
  children?: ClientNavItem[];
}

interface HeaderClientProps {
  locale: Locale;
  navItems: ClientNavItem[];
  children?: ReactNode; // language switcher slot
}

export default function HeaderClient({ locale, navItems, children }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1 ml-auto">
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => hasChildren && setOpenDropdown(item.id)}
              onMouseLeave={() => hasChildren && setOpenDropdown((v) => (v === item.id ? null : v))}
            >
              <Link
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={cn(
                  "px-3.5 py-2.5 text-[14.5px] font-medium rounded-[10px] transition-colors inline-flex items-center gap-1",
                  "text-[color:var(--ink-2)] hover:bg-[color:var(--cream-2)] hover:text-[color:var(--navy)]"
                )}
              >
                {item.label}
                {hasChildren && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              {hasChildren && openDropdown === item.id && (
                <div className="absolute left-0 top-full pt-2 z-50">
                  <div className="min-w-[200px] rounded-lg bg-white shadow-lg ring-1 ring-[color:var(--line)] py-1">
                    {item.children!.map((c) => (
                      <Link
                        key={c.id}
                        href={c.href}
                        target={c.target}
                        rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
                        className="block px-4 py-2 text-sm text-[color:var(--ink-2)] hover:bg-[color:var(--cream-2)] hover:text-[color:var(--navy)]"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto lg:ml-0">
        {children}
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[color:var(--ink-2)] hover:bg-[color:var(--cream-2)]"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        locale={locale}
      />
    </>
  );
}
