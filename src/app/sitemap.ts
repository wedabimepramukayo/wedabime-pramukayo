/**
 * Dynamic Sitemap — Wedabime Pramukayo
 * Generates XML sitemap with all public pages, services, and blog posts
 * Follows Next.js sitemap.ts convention
 */

// Force dynamic rendering — sitemap queries database at request time
export const dynamic = 'force-dynamic';

import { getSql } from "@/lib/neon-sql";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wedabimepramukayo.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sql = getSql();

  // Fetch all dynamic content in parallel
  const [pages, services, blogPosts] = await Promise.all([
    sql`SELECT slug, "updatedAt" FROM "Page" WHERE "isPublished" = true`,
    sql`SELECT slug, "updatedAt" FROM "Product" WHERE "isPublished" = true`,
    sql`SELECT slug, "updatedAt", "publishedAt" FROM "BlogPost" WHERE "isPublished" = true`,
  ]);

  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/advantages`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic page pages
  const pageEntries: MetadataRoute.Sitemap = pages.map((page: any) => ({
    url: `${BASE_URL}/${page.slug}`,
    lastModified: new Date(page.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Dynamic service pages
  const servicePages: MetadataRoute.Sitemap = services.map((service: any) => ({
    url: `${BASE_URL}/services/${service.slug}`,
    lastModified: new Date(service.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post: any) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...pageEntries, ...servicePages, ...blogPages];
}
