import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},

  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
      { hostname: "k.kakaocdn.net" },
      { hostname: "*.kakaocdn.net" },
    ],
  },
};

export default nextConfig;
