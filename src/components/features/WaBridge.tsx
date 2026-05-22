"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type WAStatus = "disconnected" | "connecting" | "qr" | "connected";
interface Status {
  status: WAStatus;
  qr?: string;
  me?: string;
  lastError?: string;
}

const LABELS: Record<WAStatus, { ru: string; kk: string; color: string }> = {
  disconnected: { ru: "Отключён", kk: "Ажыратылған", color: "bg-gray-400" },
  connecting: { ru: "Подключение…", kk: "Қосылуда…", color: "bg-amber-500" },
  qr: { ru: "Ожидает сканирования QR", kk: "QR сканерлеуді күтуде", color: "bg-blue-500" },
  connected: { ru: "Подключён", kk: "Қосылған", color: "bg-green-500" },
};

export default function WaBridge({ locale }: { locale: Locale }) {
  const T = (kk: string, ru: string) => (locale === "kk" ? kk : ru);
  const [st, setSt] = useState<Status>({ status: "disconnected" });
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/wa", { cache: "no-store" });
      const j = await r.json();
      if (j.data) setSt(j.data as Status);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refresh]);

  const act = async (action: "connect" | "disconnect" | "logout") => {
    setBusy(true);
    try {
      await fetch("/api/admin/wa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const lbl = LABELS[st.status];

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${lbl.color} ${st.status === "connecting" || st.status === "qr" ? "animate-pulse" : ""}`} />
            <div>
              <div className="font-semibold text-gray-900">{T(lbl.kk, lbl.ru)}</div>
              {st.me && (
                <div className="text-sm text-gray-500">
                  {T("Нөмір:", "Номер:")} +{st.me}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {st.status === "connected" || st.status === "qr" || st.status === "connecting" ? (
              <>
                <button
                  onClick={() => act("disconnect")}
                  disabled={busy}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 disabled:opacity-50"
                >
                  {T("Тоқтату", "Отключить")}
                </button>
                <button
                  onClick={() => act("logout")}
                  disabled={busy}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {T("Шығу", "Выйти")}
                </button>
              </>
            ) : (
              <button
                onClick={() => act("connect")}
                disabled={busy}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {T("Қосылу", "Подключить")}
              </button>
            )}
          </div>
        </div>

        {st.status === "qr" && st.qr && (
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={st.qr} alt="WhatsApp QR" width={264} height={264} className="rounded-lg" />
            <p className="max-w-sm text-center text-sm text-gray-500">
              {T(
                "WhatsApp → Параметрлер → Байланыстырылған құрылғылар → Құрылғыны байланыстыру — осы QR-ды сканерлеңіз.",
                "WhatsApp → Настройки → Связанные устройства → Привязка устройства — отсканируйте этот QR."
              )}
            </p>
          </div>
        )}

        {st.status === "connected" && (
          <p className="mt-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
            {T(
              "Бот қосулы: бронь сұраулары осы нөмір арқылы өңделеді.",
              "Бот активен: заявки на бронь обрабатываются через этот номер."
            )}
          </p>
        )}

        {st.lastError && st.status === "disconnected" && (
          <p className="mt-4 text-sm text-amber-600">⚠ {st.lastError}</p>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-gray-400">
        {T(
          "Сессия дерекқорда сақталады және рестарттан кейін қалпына келеді. Алғашқы байланыс үшін публикалық домен/туннель қажет.",
          "Сессия хранится в БД и восстанавливается после рестарта. Для первичной привязки нужен публичный домен/туннель."
        )}
      </p>
    </div>
  );
}
