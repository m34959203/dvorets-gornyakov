import type { MetadataRoute } from "next";

// PWA-манифест. Иконки — из app/icon.svg (вектор) + сгенерённых PNG в /public.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Дворец горняков им. Ш. Дильдебаева",
    short_name: "Дворец горняков",
    description:
      "Портал КГКП «Центр культуры и творчества им. Ш. Дильдебаева» — афиша, кружки, аренда залов, новости. Сатпаев, Улытау.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0E20",
    theme_color: "#0E0E20",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
    ],
  };
}
