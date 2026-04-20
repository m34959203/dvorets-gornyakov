import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Дворец горняков им. Ш. Дільдебаева",
  description: "КГКП Дворец горняков им. Ш. Дільдебаева — культурный центр города Сатпаев",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
