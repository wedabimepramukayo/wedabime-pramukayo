"use client";

/**
 * Admin Dashboard — Wedabime Pramukayo CMS
 * Client-side dashboard with stats, recent activity, and quick actions
 * Fetches data from API endpoints (no server-side Prisma)
 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Inbox,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface PageItem { id: string; title: string; slug: string; isPublished: boolean; updatedAt: string; }
interface ServiceItem { id: string; name: string; slug: string; isFeatured: boolean; isPublished: boolean; updatedAt: string; category?: { name: string } | null; }
interface PostItem { id: string; title: string; slug: string; isPublished: boolean; updatedAt: string; }
interface MessageItem { id: string; name: string; subject: string; createdAt: string; }

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [publishedPages, setPublishedPages] = useState(0);
  const [publishedServices, setPublishedServices] = useState(0);
  const [publishedPosts, setPublishedPosts] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [recentServices, setRecentServices] = useState<ServiceItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostItem[]>([]);
  const [recentMessages, setRecentMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }
    if (status !== "authenticated") return;

    async function fetchDashboardData() {
      try {
        const [pagesRes, servicesRes, categoriesRes, blogRes, contactRes] = await Promise.all([
          fetch("/api/admin/pages"),
          fetch("/api/admin/services"),
          fetch("/api/admin/categories"),
          fetch("/api/admin/blog"),
          fetch("/api/admin/contact?limit=5&unread=true"),
        ]);

        const [pagesData, servicesData, categoriesData, blogData, contactData] = await Promise.all([
          pagesRes.ok ? pagesRes.json() : { pages: [] },
          servicesRes.ok ? servicesRes.json() : { services: [] },
          categoriesRes.ok ? categoriesRes.json() : { categories: [] },
          blogRes.ok ? blogRes.json() : { posts: [] },
          contactRes.ok ? contactRes.json() : { submissions: [], unreadCount: 0 },
        ]);

        const pages: PageItem[] = pagesData.pages || [];
        const services: ServiceItem[] = servicesData.services || [];
        const categories = categoriesData.categories || [];
        const posts: PostItem[] = blogData.posts || [];
        const messages: MessageItem[] = contactData.submissions || [];

        setPageCount(pages.length);
        setServiceCount(services.length);
        setCategoryCount(categories.length);
        setBlogCount(posts.length);
        setPublishedPages(pages.filter((p: PageItem) => p.isPublished).length);
        setPublishedServices(services.filter((s: ServiceItem) => s.isPublished).length);
        setPublishedPosts(posts.filter((p: PostItem) => p.isPublished).length);
        setUnreadMessages(contactData.unreadCount || 0);

        // Recent items (sorted by updatedAt desc - API already returns them sorted)
        setRecentServices(services.slice(0, 5));
        setRecentPosts(posts.slice(0, 5));
        setRecentMessages(messages.slice(0, 5));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [status, router]);

  if (loading || status !== "authenticated") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

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
      title: "Services",
      value: serviceCount,
      published: publishedServices,
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
    {
      title: "Messages",
      value: unreadMessages,
      published: unreadMessages,
      icon: Inbox,
      href: "/admin/messages",
      color: "text-brand-spring",
      bg: "bg-brand-spring/10",
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
                Welcome back, {session?.user?.name || "Admin"} 👋
              </h1>
              <p className="text-brand-sage/80 mt-2 max-w-lg">
                Manage your Wedabime Pramukayo website content, services, and settings from this dashboard.
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
                <span className="text-xs font-medium">Services</span>
              </div>
              <div className="text-2xl font-bold">{serviceCount}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-brand-lime mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Published</span>
              </div>
              <div className="text-2xl font-bold">{publishedServices}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                {stat.title === "Messages" ? `${stat.published} unread` : `${stat.published} published`}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="rounded-xl border border-brand-emerald/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
            <Link
              href="/admin/products"
              className="text-sm text-brand-primary hover:text-brand-emerald flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentServices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No services yet</p>
            ) : (
              recentServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-mint/20 hover:bg-brand-mint/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {service.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {service.category?.name || "Uncategorized"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {service.isFeatured && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-medium">
                        Featured
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(service.updatedAt).toLocaleDateString()}
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

        {/* Recent Messages */}
        <div className="rounded-xl border border-brand-emerald/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">New Messages</h2>
            <Link
              href="/admin/messages"
              className="text-sm text-brand-primary hover:text-brand-emerald flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No new messages</p>
            ) : (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-spring/5 hover:bg-brand-spring/10 transition-colors border border-brand-spring/10"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {msg.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {msg.subject}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-brand-emerald/10 bg-white p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
            <span className="text-sm font-medium text-foreground">Manage Services</span>
          </Link>
          <Link
            href="/admin/blog"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <Blog className="h-5 w-5 text-brand-gold" />
            <span className="text-sm font-medium text-foreground">Write Post</span>
          </Link>
          <Link
            href="/admin/messages"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <Inbox className="h-5 w-5 text-brand-spring" />
            <span className="text-sm font-medium text-foreground">Messages</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 p-4 rounded-lg border border-brand-emerald/10 hover:border-brand-emerald/30 hover:bg-brand-mint/20 transition-all"
          >
            <Eye className="h-5 w-5 text-brand-teal" />
            <span className="text-sm font-medium text-foreground">View Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
