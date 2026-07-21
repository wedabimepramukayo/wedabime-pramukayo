"use client";

/**
 * Admin Blog Manager — Full CRUD with tags, excerpt, cover image
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
  NotebookPen,
  Globe,
  Tag,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Calendar,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  author: string | null;
  tags: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

const emptyPost: Partial<BlogPost> = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  author: "",
  tags: "[]",
  metaTitle: "",
  metaDesc: "",
  metaKeywords: "",
  ogImageUrl: "",
  isPublished: false,
};

export default function AdminBlogClient() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts);
    } catch {
      toast({ title: "Error", description: "Failed to load blog posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Parse tags from JSON
  const parseTags = (val: string | null | undefined): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return val.split(",").map((t) => t.trim()).filter(Boolean);
    }
  };

  const handleCreate = () => {
    setEditingPost({ ...emptyPost });
    setIsNew(true);
    setEditorOpen(true);
    setShowSeo(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setIsNew(false);
    setEditorOpen(true);
    setShowSeo(!!post.metaTitle || !!post.metaDesc);
  };

  // Tag management
  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = parseTags(editingPost?.tags);
    tags.push(tagInput.trim());
    setEditingPost((prev) => ({ ...prev, tags: JSON.stringify(tags) }));
    setTagInput("");
  };

  const removeTag = (index: number) => {
    const tags = parseTags(editingPost?.tags);
    tags.splice(index, 1);
    setEditingPost((prev) => ({ ...prev, tags: JSON.stringify(tags) }));
  };

  const handleSave = async () => {
    if (!editingPost?.slug || !editingPost?.title || !editingPost?.content) {
      toast({ title: "Validation Error", description: "Slug, title, and content are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${editingPost.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPost),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast({
        title: isNew ? "Post created" : "Post updated",
        description: `"${editingPost.title}" has been ${isNew ? "created" : "updated"}`,
      });

      setEditorOpen(false);
      fetchPosts();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast({ title: "Post deleted", description: `"${deleteTarget.title}" has been removed` });
      setDeleteTarget(null);
      fetchPosts();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const filteredPosts = searchQuery
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.author || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

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
          <h1 className="text-2xl font-bold text-foreground">Blog Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage blog posts for SEO and engagement
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Posts List */}
      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <NotebookPen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No blog posts found. Write your first post!</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-emerald/10">
            {filteredPosts.map((post) => {
              const tags = parseTags(post.tags);
              return (
                <div
                  key={post.id}
                  className="p-4 hover:bg-brand-mint/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            post.isPublished
                              ? "bg-brand-spring/10 text-brand-emerald border-brand-spring/20"
                              : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                          }
                        >
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="font-mono">/blog/{post.slug}</span>
                      </div>

                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {post.excerpt}
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-brand-mint/20">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-brand-emerald/10"
                        onClick={() => handleEdit(post)}
                      >
                        <Pencil className="h-3.5 w-3.5 text-brand-emerald" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50"
                        onClick={() => setDeleteTarget(post)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blog Post Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Write New Post" : "Edit Post"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Create a new blog post for SEO and engagement" : "Modify blog post content and settings"}
            </DialogDescription>
          </DialogHeader>

          {editingPost && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={editingPost.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditingPost((prev) => ({
                        ...prev,
                        title,
                        slug: isNew ? generateSlug(title) : prev?.slug,
                      }));
                    }}
                    placeholder="Blog post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={editingPost.slug || ""}
                    onChange={(e) => setEditingPost((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="post-url-slug"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={editingPost.author || ""}
                    onChange={(e) => setEditingPost((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingPost.isPublished ?? false}
                      onCheckedChange={(checked) =>
                        setEditingPost((prev) => ({ ...prev, isPublished: checked }))
                      }
                    />
                    <Label>{editingPost.isPublished ? "Published" : "Draft"}</Label>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Short summary for listings (appears in blog cards)"
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>Content * (HTML)</Label>
                <Textarea
                  value={editingPost.content || ""}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, content: e.target.value }))}
                  rows={16}
                  className="font-mono text-sm"
                  placeholder="<h2>Section Title</h2>\n<p>Blog content...</p>"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {parseTags(editingPost.tags).map((tag, i) => (
                    <Badge key={i} variant="outline" className="gap-1 bg-brand-mint/20">
                      {tag}
                      <button onClick={() => removeTag(i)} className="hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input
                  value={editingPost.coverImageUrl || ""}
                  onChange={(e) => setEditingPost((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                  placeholder="https://..."
                />
                {editingPost.coverImageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-brand-emerald/10 max-w-sm">
                    <img
                      src={editingPost.coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* SEO Section */}
              <div className="border border-brand-emerald/10 rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  onClick={() => setShowSeo(!showSeo)}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-teal" />
                    SEO Settings
                    {editingPost.metaTitle && (
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
                        value={editingPost.metaTitle || ""}
                        onChange={(e) => setEditingPost((prev) => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="SEO title"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {(editingPost.metaTitle || "").length}/60 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea
                        value={editingPost.metaDesc || ""}
                        onChange={(e) => setEditingPost((prev) => ({ ...prev, metaDesc: e.target.value }))}
                        placeholder="SEO description"
                        rows={2}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {(editingPost.metaDesc || "").length}/160 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Keywords</Label>
                      <Input
                        value={editingPost.metaKeywords || ""}
                        onChange={(e) => setEditingPost((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                        placeholder="keyword1, keyword2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image URL</Label>
                      <Input
                        value={editingPost.ogImageUrl || ""}
                        onChange={(e) => setEditingPost((prev) => ({ ...prev, ogImageUrl: e.target.value }))}
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
              {isNew ? "Create Post" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
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
