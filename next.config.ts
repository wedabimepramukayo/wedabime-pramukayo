import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.wedabimepramukayo.site",
      },
      {
        protocol: "https",
        hostname: "wedabimepramukayo.site",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Security headers moved to public/_headers for Cloudflare Pages compatibility
  // (next.config.ts headers() uses Node.js middleware which is not supported on Cloudflare)

  // Do NOT externalize @prisma/client — it must be bundled with the Worker
  // When using PrismaNeonHttp adapter, the adapter code must be in the bundle
  // The binary engine is NOT needed (adapter bypasses it via HTTP)
  serverExternalPackages: [],
};

export default nextConfig;
