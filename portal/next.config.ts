import type { NextConfig } from "next";

// Capacitor build нь статик export шаарддаг (09-mobile-desktop.md).
// Нэг codebase, хоёр гаралт:
//   web    → next build
//   mobile → CAPACITOR_BUILD=true next build   (out/ folder)
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  agentRules: false,
  // Клиентийн дэд бүтэц рүү буулгах гарц — Vercel-д баригдахгүй байх (01-stack.md).
  output: isCapacitorBuild ? "export" : "standalone",

  ...(isCapacitorBuild && {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;
