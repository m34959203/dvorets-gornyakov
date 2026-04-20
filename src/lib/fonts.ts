import { Playfair_Display, Manrope } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-head-family",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-family",
  display: "swap",
});
