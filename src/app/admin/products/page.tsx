"use client";

/**
 * Admin Services Manager — Full CRUD with category, features, specs
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Package,
  Star,
  Globe,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  GripVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string;
  features: string;
  advantages: string | null;
  specifications: string | null;
  mainImageUrl: string | null;
  gallery: string | null;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  metaTitle: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string;
}

const emptyService: Partial<Service> = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  features: "[]",
  advantages: null,
  specifications: null,
  mainImageUrl: "",
  gallery: null,
  categoryId: "",
  metaTitle: "",
  metaDesc: "",
  metaKeywords: "",
  ogImageUrl: "",
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
};

export default function AdminServicesClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const [advantageInput, setAdvantageInput] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/categories"),
      ]);

      if (!servicesRes.ok || !categoriesRes.ok) throw new Error("Failed to fetch");

      const servicesData = await servicesRes.json();
      const categoriesData = await categoriesRes.json();

      setServices(servicesData.services);
      setCategories(categoriesData.categories);
    } catch {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Parse JSON features/advantages
  const parseJsonArray = (val: string | null | undefined): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Open editor for new service
  const handleCreate = () => {
    setEditingService({ ...emptyService });
    setIsNew(true);
    setEditorOpen(true);
    setShowFeatures(false);
    setShowSeo(false);
    setShowSpecs(false);
  };

  // Open editor for existing service
  const handleEdit = (service: Service) => {
    setEditingService({ ...service });
    setIsNew(false);
    setEditorOpen(true);
    setShowFeatures(true); // Always show features when editing
    setShowSeo(!!service.metaTitle || !!service.metaDesc);
    setShowSpecs(!!service.specifications);
  };

  // Handle feature list management
  const addFeature = () => {
    if (!featureInput.trim()) return;
    const features = parseJsonArray(editingService?.features);
    features.push(featureInput.trim());
    setEditingService((prev) => ({ ...prev, features: JSON.stringify(features) }));
    setFeatureInput("");
  };

  const removeFeature = (index: number) => {
    const features = parseJsonArray(editingService?.features);
    features.splice(index, 1);
    setEditingService((prev) => ({ ...prev, features: JSON.stringify(features) }));
  };

  // Handle advantage list management
  const addAdvantage = () => {
    if (!advantageInput.trim()) return;
    const advantages = parseJsonArray(editingService?.advantages);
    advantages.push(advantageInput.trim());
    setEditingService((prev) => ({ ...prev, advantages: JSON.stringify(advantages) }));
    setAdvantageInput("");
  };

  const removeAdvantage = (index: number) => {
    const advantages = parseJsonArray(editingService?.advantages);
    advantages.splice(index, 1);
    setEditingService((prev) => ({ ...prev, advantages: JSON.stringify(advantages) }));
  };

  // Save service
  const handleSave = async () => {
    if (!editingService?.slug || !editingService?.name || !editingService?.description) {
      toast({ title: "Validation Error", description: "Slug, name, and description are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/admin/services" : `/api/admin/services/${editingService.id}`;
      const method = isNew ? "POST" : "PUT";

      const body = {
        ...editingService,
        categoryId: editingService.categoryId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast({
        title: isNew ? "Service created" : "Service updated",
        description: `"${editingService.name}" has been ${isNew ? "created" : "updated"}`,
      });

      setEditorOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast({ title: "Service deleted", description: `"${deleteTarget.name}" has been removed` });
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || s.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-2xl font-bold text-foreground">Service Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage i-Panel services, descriptions, features, and categories
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Service
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services List */}
      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_140px_80px_80px_80px] gap-4 p-4 bg-brand-mint/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div>Service</div>
          <div>Category</div>
          <div>Featured</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No services found. Create your first service!</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-emerald/10">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="grid grid-cols-[1fr_140px_80px_80px_80px] gap-4 p-4 items-center hover:bg-brand-mint/10 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">{service.name}</div>
                  {service.subtitle && (
                    <div className="text-xs text-muted-foreground truncate">{service.subtitle}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {service.category?.name || "Uncategorized"}
                </div>
                <div>
                  {service.isFeatured ? (
                    <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold border-brand-gold/20">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      service.isPublished
                        ? "bg-brand-spring/10 text-brand-emerald border-brand-spring/20"
                        : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
                    }
                  >
                    {service.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-brand-emerald/10"
                    onClick={() => handleEdit(service)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-brand-emerald" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50"
                    onClick={() => setDeleteTarget(service)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create New Service" : "Edit Service"}</DialogTitle>
            <DialogDescription>
              {isNew ? "Add a new i-Panel service or product" : "Modify service details, features, and SEO settings"}
            </DialogDescription>
          </DialogHeader>

          {editingService && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Name *</Label>
                  <Input
                    value={editingService.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingService((prev) => ({
                        ...prev,
                        name,
                        slug: isNew ? generateSlug(name) : prev?.slug,
                      }));
                    }}
                    placeholder="e.g. i-Panel Heavy Flat"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={editingService.slug || ""}
                    onChange={(e) => setEditingService((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="service-url-slug"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={editingService.subtitle || ""}
                    onChange={(e) => setEditingService((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Short tagline"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingService.categoryId || "none"}
                    onValueChange={(val) =>
                      setEditingService((prev) => ({ ...prev, categoryId: val === "none" ? null : val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.isPublished ?? true}
                    onCheckedChange={(checked) =>
                      setEditingService((prev) => ({ ...prev, isPublished: checked }))
                    }
                  />
                  <Label>{editingService.isPublished ? "Published" : "Draft"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.isFeatured ?? false}
                    onCheckedChange={(checked) =>
                      setEditingService((prev) => ({ ...prev, isFeatured: checked }))
                    }
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Sort Order</Label>
                  <Input
                    type="number"
                    value={editingService.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingService((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                    className="w-20"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description * (HTML)</Label>
                <Textarea
                  value={editingService.description || ""}
                  onChange={(e) => setEditingService((prev) => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="Service description..."
                />
              </div>

              {/* Features (Collapsible) */}
              <div className="border border-brand-emerald/10 rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  onClick={() => setShowFeatures(!showFeatures)}
                >
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-brand-gold" />
                    Features ({parseJsonArray(editingService.features).length})
                  </span>
                  {showFeatures ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showFeatures && (
                  <div className="p-4 space-y-3 border-t border-brand-emerald/10">
                    {/* Feature list */}
                    {parseJsonArray(editingService.features).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-30" />
                        <div className="flex-1 text-sm bg-brand-mint/20 rounded px-3 py-2">
                          {feature}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          onClick={() => removeFeature(i)}
                        >
                          <X className="h-3 w-3 text-red-400" />
                        </Button>
                      </div>
                    ))}
                    {/* Add feature */}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a feature..."
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addFeature}
                        disabled={!featureInput.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Advantages */}
                    <div className="mt-4 pt-4 border-t border-brand-emerald/10">
                      <Label className="text-sm font-medium mb-2 block">Advantages</Label>
                      {parseJsonArray(editingService.advantages).map((adv, i) => (
                        <div key={i} className="flex items-center gap-2 group mb-2">
                          <div className="flex-1 text-sm bg-brand-spring/10 rounded px-3 py-2 text-brand-emerald">
                            {adv}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={() => removeAdvantage(i)}
                          >
                            <X className="h-3 w-3 text-red-400" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Add an advantage..."
                          value={advantageInput}
                          onChange={(e) => setAdvantageInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAdvantage())}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addAdvantage}
                          disabled={!advantageInput.trim()}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Specifications (Collapsible) */}
              <div className="border border-brand-emerald/10 rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  onClick={() => setShowSpecs(!showSpecs)}
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand-teal" />
                    Specifications & Images
                  </span>
                  {showSpecs ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {showSpecs && (
                  <div className="p-4 space-y-4 border-t border-brand-emerald/10">
                    <div className="space-y-2">
                      <Label>Specifications (JSON)</Label>
                      <Textarea
                        value={editingService.specifications || ""}
                        onChange={(e) => setEditingService((prev) => ({ ...prev, specifications: e.target.value }))}
                        rows={4}
                        className="font-mono text-sm"
                        placeholder='{"thickness": "8mm", "width": "250mm", "length": "595mm"}'
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Main Image URL</Label>
                      <Input
                        value={editingService.mainImageUrl || ""}
                        onChange={(e) => setEditingService((prev) => ({ ...prev, mainImageUrl: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gallery Images (JSON array of URLs)</Label>
                      <Textarea
                        value={editingService.gallery || ""}
                        onChange={(e) => setEditingService((prev) => ({ ...prev, gallery: e.target.value }))}
                        rows={3}
                        className="font-mono text-sm"
                        placeholder='["https://image1.jpg", "https://image2.jpg"]'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEO (Collapsible) */}
              <div className="border border-brand-emerald/10 rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-brand-mint/10 transition-colors"
                  onClick={() => setShowSeo(!showSeo)}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-brand-teal" />
                    SEO Settings
                    {editingService.metaTitle && (
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
                        value={editingService.metaTitle || ""}
                        onChange={(e) => setEditingService((prev) => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="SEO title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea
                        value={editingService.metaDesc || ""}
                        onChange={(e) => setEditingService((prev) => ({ ...prev, metaDesc: e.target.value }))}
                        placeholder="SEO description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Keywords</Label>
                      <Input
                        value={editingService.metaKeywords || ""}
                        onChange={(e) => setEditingService((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                        placeholder="keyword1, keyword2"
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
              {isNew ? "Create Service" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
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
