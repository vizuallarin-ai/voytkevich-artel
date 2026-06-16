import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // На VPS (Docker) типы проверяются локально/в CI — см. SKIP_TYPE_CHECK в Dockerfile
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "1",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "megaartel.ru" },
      { protocol: "https", hostname: "www.megaartel.ru" },
    ],
  },
};

export default nextConfig;
