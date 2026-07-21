/**
 * Dynamic Sitemap — Wedabime Pramukayo
 * Generates XML sitemap with all public pages, services, and blog posts
 * Follows Next.js sitemap.ts convention
 */

// Force dynamic rendering — sitemap queries database at request time
export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import type { MetadataRoute } from "next";

const BASE_URL = "https://wedabimepramukayo.site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all dynamic content in parallel
  const [pages, services, blogPosts] = await Promise.all([
    db.page.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    db.product.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, publishedAt: true },
    }),
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

  // Dynamic service pages
  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${BASE_URL}/services/${service.slug}`,
    lastModified: service.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt || post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}
