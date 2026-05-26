"use client";

import { Toaster } from "sonner";
import { createContext, useContext, type ReactNode } from "react";
import { ConfirmProvider } from "./ConfirmProvider";

const RoleContext = createContext<string>("editor");
/** Текущая роль админ-пользователя на клиенте. */
export const useRole = () => useContext(RoleContext);
/** Гейт destructive-действий в UI (DELETE и т.п. на API — только admin). */
export const useIsAdmin = () => useContext(RoleContext) === "admin";

// Клиентские провайдеры админки: роль + тосты (sonner) + confirm-диалог.
export default function AdminProviders({
  children,
  locale,
  role,
}: {
  children: ReactNode;
  locale: "kk" | "ru";
  role: string;
}) {
  return (
    <RoleContext.Provider value={role}>
      <ConfirmProvider locale={locale}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </ConfirmProvider>
    </RoleContext.Provider>
  );
}
