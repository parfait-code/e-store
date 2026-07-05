// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://pub-d228cafe59a9417d8e240dbd98dd2730.r2.dev",
      },
      // Si le backend passe à un domaine public r2.dev ou un domaine custom,
      // ajouter le nouveau hostname ici (ou remplacer celui-ci).
    ],
  },
};

export default nextConfig;
