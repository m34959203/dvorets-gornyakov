"use client";

import { type ReactNode } from "react";
import { useIsAdmin } from "./AdminProviders";

// Показывает детей только admin (editor не видит destructive-кнопки;
// на API destructive-действия и так только admin — это UI-зеркало).
export default function AdminOnly({ children }: { children: ReactNode }) {
  return useIsAdmin() ? <>{children}</> : null;
}
