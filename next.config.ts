import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Baileys и его зависимости не бандлить — грузить из node_modules в рантайме
  serverExternalPackages: ["@whiskeysockets/baileys", "qrcode", "@hapi/boom"],
  allowedDevOrigins: ["192.168.50.13", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
