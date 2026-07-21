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

  // External packages that should not be bundled by the server
  // These use Node.js APIs and are handled by the nodejs_compat flag in Cloudflare Workers
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-neon"],

  // Cloudflare Pages / OpenNext configuration
  // @opennextjs/cloudflare handles the build output
};

export default nextConfig;
