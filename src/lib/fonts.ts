import { Manrope, Inter } from "next/font/google";

// Этно-модерн редизайн (май 2026): Manrope для заголовков, Inter для текста.
// Имена экспортов оставлены прежними (playfair → manrope для заголовков),
// чтобы не править публичный layout. CSS-переменные тоже сохранены.
export const playfair = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-head-family",
  display: "swap",
});

export const manrope = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});
