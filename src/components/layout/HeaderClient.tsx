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
  children?: ReactNode;
  overlay?: boolean;
}

export default function HeaderClient({ locale, navItems, children, overlay = false }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const linkColor = overlay ? "rgba(247,241,230,0.92)" : "var(--text)";
  const linkHover = overlay ? "var(--ochre)" : "var(--emerald)";

  return (
    <>
      {/* Desktop Navigation — centered */}
      <nav
        className="hidden lg:flex items-center"
        style={{ gap: 28, margin: "0 auto" }}
      >
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => hasChildren && setOpenDropdown(item.id)}
              onMouseLeave={() => hasChildren && setOpenDropdown((v) => (v === item.id ? null : v))}
              style={{ position: "relative" }}
            >
              <Link
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={cn(
                  "etno-nav-link",
                  "inline-flex items-center gap-1 font-medium"
                )}
                style={{
                  color: linkColor,
                  fontSize: 13.5,
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "6px 0",
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHover)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                {item.label}
                {hasChildren && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </Link>
              {hasChildren && openDropdown === item.id && (
                <div className="absolute left-0 top-full pt-3 z-50">
                  <div
                    className="min-w-[220px] rounded-lg py-2"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--line)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    {item.children!.map((c) => (
                      <Link
                        key={c.id}
                        href={c.href}
                        target={c.target}
                        rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
                        className="block px-4 py-2.5 text-sm"
                        style={{ color: "var(--text)" }}
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
      <div className="flex items-center gap-3" style={{ marginLeft: "auto" }}>
        {children}
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden"
          aria-label="Open menu"
          style={{
            width: 36,
            height: 36,
            border: `1px solid ${overlay ? "rgba(247,241,230,0.4)" : "var(--line)"}`,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "transparent",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 16,
                height: 1.5,
                background: overlay ? "var(--text-light)" : "var(--text)",
              }}
            />
          ))}
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
