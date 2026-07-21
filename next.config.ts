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
};

export default nextConfig;
