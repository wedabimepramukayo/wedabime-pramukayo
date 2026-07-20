/**
 * Admin Dashboard — Wedabime Pramukayo CMS
 * Overview page with key metrics, recent activity, and quick actions
 */

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  FileText,
  Package,
  FolderOpen,
  NotebookPen as Blog,
  Settings,
  TreePine,
  Shield,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
  Award,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  // Fetch dashboard stats
  const [
    pageCount,
    productCount,
    categoryCount,
    blogCount,
    settingsCount,
    publishedPages,
    publishedProducts,
    publishedPosts,
    recentProducts,
    recentPosts,
  ] = await Promise.all([
    db.page.count(),
    db.product.count(),
    db.productCategory.count(),
    db.blogPost.count(),
    db.siteSetting.count(),
    db.page.count({ where: { isPublished: true } }),
    db.product.count({ where: { isPublished: true } }),
    db.blogPost.count({ where: { isPublished: true } }),
    db.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, slug: true, isFeatured: true, updatedAt: true, category: { select: { name: true } } },
    }),
    db.blogPost.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, isPublished: true, updatedAt: true },
    }),
  ]);

  const statsCards = [
    {
      title: "Pages",
      value: pageCount,
      published: publishedPages,
      icon: FileText,
      href: "/admin/pages",
      color: "text-brand-primary",
      bg: "bg-brand-primary/10",
    },
    {
      title: "Products",
      value: productCount,
      published: publishedProducts,
      icon: Package,
      href: "/admin/products",
      color: "text-brand-emerald",
      bg: "bg-brand-emerald/10",
    },
    {
      title: "Categories",
      value: categoryCount,
      published: categoryCount,
      icon: FolderOpen,
      href: "/admin/categories",
      color: "text-brand-teal",
      bg: "bg-brand-teal/10",
    },
    {
      title: "Blog Posts",
      value: blogCount,
      published: publishedPosts,
      icon: Blog,
      href: "/admin/blog",
      color: "text-brand-gold",
      bg: "bg-brand-gold/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)",
        }}
      >
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-spring/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-brand-teal/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {session.user?.name || "Admin"} 👋
              </h1>
              <p className="text-brand-sage/80 mt-2 max-w-lg">
                Manage your Wedabime Pramukayo website content, products, and settings from this dashboard.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-brand-sage/60">Eco Impact</div>
                <div className="text-lg font-bold text-brand-spring">1,875+ trees/mo</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-brand-spring/20 flex items-center justify-center">
                <TreePine className="h-5 w-5 text-brand-spring" />
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-brand-spring mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">Warranty</span>
              </div>
              <div className="text-2xl font-bold">15 Yrs</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-brand-teal mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-xs font-medium">Termite Proof</span>
              </div>
              <div className="text-2xl font-bold">100%</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-brand-gold mb-1">
                <Award className="h-4 w-4" />
                <span className="text-xs font-medium">Products</span>
              </div>
              <div className="text-2xl font-bold">{productCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-brand-lime mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Published</span>
              </div>
              <div className="text-2xl font-bold">{publishedProducts}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-xl border border-brand-emerald/10 bg-white p-6 hover:shadow-lg hover:shadow-brand-emerald/5 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
              <div className="mt-2 text-xs text-brand-emerald">
                {stat.published} published
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="rounded-xl border border-brand-emerald/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Products</h2>
            <Link
              href="/admin/products"
              className="text-sm text-brand-primary hover:text-brand-emerald flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No products yet</p>
            ) : (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-mint/20 hover:bg-brand-mint/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.category?.name || "Uncategorized"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {product.isFeatured && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-medium">
                        Featured
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="rounded-xl border border-brand-emerald/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Blog Posts</h2>
            <Link
              href="/admin/blog"
              className="text-sm text-brand-primary hover:text-brand-emerald flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No blog posts yet</p>
            ) : (
              recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-mint/20 hover:bg-brand-mint/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {post.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /blog/{post.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        post.isPublished
                          ? "bg-brand-spring/20 text-brand-emerald"
                          : "bg-brand-gold/20 text-brand-gold"
                      }`}
                    >
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-brand-emerald/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/admin/pages"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <FileText className="h-5 w-5 text-brand-primary" />
            <span className="text-sm font-medium text-foreground">Edit Pages</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <Package className="h-5 w-5 text-brand-emerald" />
            <span className="text-sm font-medium text-foreground">Manage Products</span>
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <Blog className="h-5 w-5 text-brand-gold" />
            <span className="text-sm font-medium text-foreground">Write Post</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <Settings className="h-5 w-5 text-brand-teal" />
            <span className="text-sm font-medium text-foreground">Site Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
