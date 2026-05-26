"use client";

import { Toaster } from "sonner";
import { type ReactNode } from "react";
import { ConfirmProvider } from "./ConfirmProvider";

// Клиентские провайдеры админки: тосты (sonner) + confirm-диалог.
export default function AdminProviders({
  children,
  locale,
}: {
  children: ReactNode;
  locale: "kk" | "ru";
}) {
  return (
    <ConfirmProvider locale={locale}>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </ConfirmProvider>
  );
}
