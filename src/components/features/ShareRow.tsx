"use client";

import { useState } from "react";
import DgIcon from "@/components/layout/DgIcon";

// Шаринг детальных страниц. TG/WA — основные каналы в РК; «копировать» — на клиенте.
export default function ShareRow({
  url,
  title,
  locale,
}: {
  url: string;
  title: string;
  locale: "kk" | "ru";
}) {
  const [copied, setCopied] = useState(false);
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const enc = encodeURIComponent(url);
  const encText = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard недоступен — тихо игнорируем
    }
  }

  return (
    <div className="share-row" aria-label={T("Бөлісу", "Поделиться")}>
      <span className="share-label">{T("Бөлісу:", "Поделиться:")}</span>
      <a
        className="share-btn"
        href={`https://t.me/share/url?url=${enc}&text=${encText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
      >
        <DgIcon name="tg" size={16} /> Telegram
      </a>
      <a
        className="share-btn"
        href={`https://wa.me/?text=${encText}%20${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <DgIcon name="phone" size={16} /> WhatsApp
      </a>
      <button type="button" className="share-btn" onClick={copy} aria-live="polite">
        {copied ? T("✓ Көшірілді", "✓ Скопировано") : T("Сілтемені көшіру", "Копировать ссылку")}
      </button>
    </div>
  );
}
