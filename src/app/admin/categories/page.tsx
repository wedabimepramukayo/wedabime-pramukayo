"use client";

/**
 * Admin Categories Manager — Full CRUD with active/inactive toggle
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
  FolderOpen,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

const emptyCategory: Partial<Category> = {
  slug: "",
  name: "",
  description: "",
  icon: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data.categories);
    } catch {
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory({ ...emptyCategory });
    setIsNew(true);
    setEditorOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsNew(false);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!editingCategory?.slug || !editingCategory?.name) {
      toast({ title: "Validation Error", description: "Slug and name are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/admin/categories" : `/api/admin/categories/${editingCategory.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast({
        title: isNew ? "Category created" : "Category updated",
        description: `"${editingCategory.name}" has been ${isNew ? "created" : "updated"}`,
      });

      setEditorOpen(false);
      fetchCategories();
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
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast({ title: "Category deleted", description: `"${deleteTarget.name}" has been removed` });
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Quick toggle active status
  const toggleActive = async (cat: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({
        title: cat.isActive ? "Category deactivated" : "Category activated",
        description: `"${cat.name}" is now ${cat.isActive ? "inactive" : "active"}`,
      });
      fetchCategories();
    } catch {
      toast({ title: "Error", description: "Failed to update category status", variant: "destructive" });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const filteredCategories = searchQuery
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

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
          <h1 className="text-2xl font-bold text-foreground">Category Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize services into categories for better navigation
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No categories found. Create your first category!</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`rounded-xl border bg-white p-5 transition-all hover:shadow-md ${
                cat.isActive
                  ? "border-brand-emerald/10 hover:border-brand-emerald/30"
                  : "border-brand-gold/10 opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(cat)}
                  >
                    <Pencil className="h-3 w-3 text-brand-emerald" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDeleteTarget(cat)}
                    disabled={cat._count.products > 0}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              </div>

              {cat.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {cat.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {cat._count.products} {cat._count.products === 1 ? "service" : "services"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      cat.isActive
                        ? "bg-brand-spring/10 text-brand-emerald border-brand-spring/20 text-[10px]"
                        : "bg-brand-gold/10 text-brand-gold border-brand-gold/20 text-[10px]"
                    }
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Switch
                  checked={cat.isActive}
                  onCheckedChange={() => toggleActive(cat)}
                  className="scale-75"
                />
              </div>

              {cat.icon && (
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Icon: <code className="bg-brand-mint/30 px-1 rounded">{cat.icon}</code>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create New Category" : "Edit Category"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Add a service category for organizing your i-Panel products" : "Modify category details"}
            </DialogDescription>
          </DialogHeader>

          {editingCategory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category Name *</Label>
                  <Input
                    value={editingCategory.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingCategory((prev) => ({
                        ...prev,
                        name,
                        slug: isNew ? generateSlug(name) : prev?.slug,
                      }));
                    }}
                    placeholder="e.g. Heavy Flat Series"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={editingCategory.slug || ""}
                    onChange={(e) => setEditingCategory((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief category description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon Name (Lucide)</Label>
                  <Input
                    value={editingCategory.icon || ""}
                    onChange={(e) => setEditingCategory((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g. Layers, Palette"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={editingCategory.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingCategory((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category Image URL</Label>
                <Input
                  value={editingCategory.imageUrl || ""}
                  onChange={(e) => setEditingCategory((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingCategory.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setEditingCategory((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label>{editingCategory.isActive ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-primary hover:bg-brand-primary/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create Category" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?._count.products && deleteTarget._count.products > 0
                ? `Cannot delete "${deleteTarget?.name}" — it has ${deleteTarget._count.products} service(s) assigned. Reassign or delete them first.`
                : `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {(!deleteTarget?._count.products || deleteTarget._count.products === 0) && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
