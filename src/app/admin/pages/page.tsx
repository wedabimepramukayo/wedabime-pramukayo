"use client";

/**
 * Admin Page Manager — Full CRUD with rich text editor
 * Wedabime Pramukayo CMS — Phase 3
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Globe,
  Eye,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Page {
  id: string;
  slug: string;
  title: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  content: string;
  metaTitle: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  sortOrder: number;
  updatedAt: string;
}

const emptyPage: Partial<Page> = {
  slug: "",
  title: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImageUrl: "",
  content: "",
  metaTitle: "",
  metaDesc: "",
  metaKeywords: "",
  ogImageUrl: "",
  isPublished: true,
  sortOrder: 0,
};

export default function AdminPagesClient() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<Page> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showHero, setShowHero] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPages(data.pages);
    } catch {
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Open editor for new page
  const handleCreate = () => {
    setEditingPage({ ...emptyPage });
    setIsNew(true);
    setEditorOpen(true);
    setShowSeo(false);
    setShowHero(false);
  };

  // Open editor for existing page
  const handleEdit = (page: Page) => {
    setEditingPage({ ...page });
    setIsNew(false);
    setEditorOpen(true);
    setShowSeo(!!page.metaTitle || !!page.metaDesc);
    setShowHero(!!page.heroTitle || !!page.heroSubtitle);
  };

  // Save page (create or update)
  const handleSave = async () => {
    if (!editingPage?.slug || !editingPage?.title || !editingPage?.content) {
      toast({ title: "Validation Error", description: "Slug, title, and content are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/admin/pages" : `/api/admin/pages/${editingPage.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPage),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast({
        title: isNew ? "Page created" : "Page updated",
        description: `"${editingPage.title}" has been ${isNew ? "created" : "updated"}`,
      });

      setEditorOpen(false);
      fetchPages();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete page
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast({ title: "Page deleted", description: `"${deleteTarget.title}" has been removed` });
      setDeleteTarget(null);
      fetchPages();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Filter pages by search
  const filteredPages = searchQuery
    ? pages.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage dynamic website pages with SEO optimization
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Pages List */}
      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 p-4 bg-brand-mint/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Page</div>
          <div>Slug</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {filteredPages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No pages found. Create your first page!</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-emerald/10">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="grid grid-cols-[1fr_120px_100px_80px] gap-4 p-4 items-center hover:bg-brand-mint/10 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{page.title}</div>
                  {page.heroTitle && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      Hero: {page.heroTitle}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  /{page.slug}
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      page.isPublished
                        ? "bg-brand-spring/10 text-brand-emerald border-brand-spring/20"
                        : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                    }
                  >
                    {page.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-brand-emerald/10"
                    onClick={() => handleEdit(page)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-brand-emerald" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50"
                    onClick={() => setDeleteTarget(page)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create New Page" : "Edit Page"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Add a new dynamic page to your website" : "Modify page content and settings"}
            </DialogDescription>
          </DialogHeader>

          {editingPage && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editingPage.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingPage((prev) => ({
                        ...prev,
                        title,
                        slug: isNew ? generateSlug(title) : prev?.slug,
                      }));
                    }}
                    placeholder="Page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={editingPage.slug || ""}
                    onChange={(e) => setEditingPage((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="page-url-slug"
                    className="font-mono"
                  />
                </div>
              </div>

              {/* Published Toggle & Sort Order */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPage.isPublished ?? true}
                    onCheckedChange={(checked) =>
                      setEditingPage((prev) => ({ ...prev, isPublished: checked }))
                    }
                  />
                  <Label>{editingPage.isPublished ? "Published" : "Draft"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sortOrder" className="text-sm">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={editingPage.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingPage((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Hero Section (Collapsible) */}
              <div className="border border-brand-emerald/10 rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  onClick={() => setShowHero(!showHero)}
                >
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-brand-emerald" />
                    Hero Section
                    {(editingPage.heroTitle || editingPage.heroSubtitle) && (
                      <Badge variant="outline" className="text-[10px] bg-brand-spring/10 text-brand-emerald">
                        Configured
                      </Badge>
                    )}
                  </span>
                  {showHero ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showHero && (
                  <div className="p-4 space-y-4 border-t border-brand-emerald/10">
                    <div className="space-y-2">
                      <Label>Hero Title</Label>
                      <Input
                        value={editingPage.heroTitle || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, heroTitle: e.target.value }))}
                        placeholder="Hero section heading"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Subtitle</Label>
                      <Textarea
                        value={editingPage.heroSubtitle || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                        placeholder="Hero section description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Image URL</Label>
                      <Input
                        value={editingPage.heroImageUrl || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <Label htmlFor="content">Page Content * (HTML)</Label>
                <Textarea
                  id="content"
                  value={editingPage.content || ""}
                  onChange={(e) => setEditingPage((prev) => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="<h2>Section Title</h2>\n<p>Page content...</p>"
                />
                <p className="text-[10px] text-muted-foreground">
                  Use HTML tags for formatting. Supported: h2, h3, p, ul, ol, li, strong, em, a, img
                </p>
              </div>

              {/* SEO Section (Collapsible) */}
              <div className="border border-brand-emerald/10 rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  onClick={() => setShowSeo(!showSeo)}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-teal" />
                    SEO Settings
                    {editingPage.metaTitle && (
                      <Badge variant="outline" className="text-[10px] bg-brand-spring/10 text-brand-emerald">
                        Configured
                      </Badge>
                    )}
                  </span>
                  {showSeo ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showSeo && (
                  <div className="p-4 space-y-4 border-t border-brand-emerald/10">
                    <div className="space-y-2">
                      <Label>Meta Title</Label>
                      <Input
                        value={editingPage.metaTitle || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="SEO title (60 chars max)"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {(editingPage.metaTitle || "").length}/60 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea
                        value={editingPage.metaDesc || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, metaDesc: e.target.value }))}
                        placeholder="SEO description (160 chars max)"
                        rows={2}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {(editingPage.metaDesc || "").length}/160 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Keywords</Label>
                      <Input
                        value={editingPage.metaKeywords || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image URL</Label>
                      <Input
                        value={editingPage.ogImageUrl || ""}
                        onChange={(e) => setEditingPage((prev) => ({ ...prev, ogImageUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-primary hover:bg-brand-primary/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create Page" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
