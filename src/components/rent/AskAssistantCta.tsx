"use client";

// Кнопка «Спросить помощника»: открывает чат-виджет с предзаполненной репликой.
// Слушатель — в ChatBot.tsx (window-событие dg:open-chat).
export default function AskAssistantCta({ label, message }: { label: string; message: string }) {
  return (
    <button
      type="button"
      className="dg-btn"
      onClick={() => window.dispatchEvent(new CustomEvent("dg:open-chat", { detail: { message } }))}
    >
      {label}
    </button>
  );
}
