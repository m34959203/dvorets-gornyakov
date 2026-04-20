"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SESSION_COOKIE = "dg_sid";
const SESSION_DAYS = 30;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const target = `${name}=`;
  for (const raw of document.cookie.split(";")) {
    const item = raw.trim();
    if (item.startsWith(target)) return decodeURIComponent(item.slice(target.length));
  }
  return undefined;
}

function writeCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
}

function randomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

function ensureSessionKey(): string {
  let sid = readCookie(SESSION_COOKIE);
  if (!sid) {
    sid = randomUUID();
    writeCookie(SESSION_COOKIE, sid, SESSION_DAYS);
  }
  return sid;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureSessionKey();

    if (!pathname) return;
    const qs = searchParams ? searchParams.toString() : "";
    const full = qs ? `${pathname}?${qs}` : pathname;
    if (lastSent.current === full) return;
    lastSent.current = full;

    const payload: Record<string, unknown> = {
      type: "pageview",
      path: full,
    };
    if (typeof document !== "undefined" && document.referrer) {
      payload.referrer = document.referrer;
    }
    if (searchParams) {
      const utmSource = searchParams.get("utm_source");
      const utmMedium = searchParams.get("utm_medium");
      const utmCampaign = searchParams.get("utm_campaign");
      if (utmSource) payload.utm_source = utmSource;
      if (utmMedium) payload.utm_medium = utmMedium;
      if (utmCampaign) payload.utm_campaign = utmCampaign;
    }

    try {
      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        /* swallow */
      });
    } catch {
      /* swallow */
    }
  }, [pathname, searchParams]);

  return null;
}
