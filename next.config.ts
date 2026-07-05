// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-d228cafe59a9417d8e240dbd98dd2730.r2.dev",
      },
    ],
  },
};

export default nextConfig;
