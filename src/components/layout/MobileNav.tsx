"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import type { ClientNavItem } from "./HeaderClient";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: ClientNavItem[];
  locale: Locale;
}

export default function MobileNav({ isOpen, onClose, navItems, locale }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">
            {locale === "kk" ? "Мәзір" : "Меню"}
          </span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              <Link
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                onClick={onClose}
                className="block px-4 py-3 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg font-medium transition-colors"
              >
                {item.label}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-2">
                  {item.children.map((c) => (
                    <Link
                      key={c.id}
                      href={c.href}
                      target={c.target}
                      rel={c.target === "_blank" ? "noopener noreferrer" : undefined}
                      onClick={onClose}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </div>
  );
}
