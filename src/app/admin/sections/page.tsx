"use client";

/**
 * Admin Section Editor — Wedabime Pramukayo CMS
 * Full CRUD for ContentSection with drag-to-reorder, items editor, and settings
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
  GripVertical,
  Eye,
  EyeOff,
  Layout,
  Type,
  LayoutList,
  BarChart3,
  Megaphone,
  Image as ImageIcon,
  HelpCircle,
  MessageSquare,
  GalleryHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface SectionItem {
  icon?: string;
  title?: string;
  desc?: string;
  value?: string;
  label?: string;
  color?: string;
  imageUrl?: string;
  [key: string]: any;
}

interface ContentSection {
  id: string;
  pageSlug: string;
  sectionKey: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  items: SectionItem[] | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  sortOrder: number;
  isActive: boolean;
  settings: Record<string, any> | null;
  updatedAt: string;
}

const PAGE_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "about", label: "About" },
  { value: "advantages", label: "Advantages" },
  { value: "contact", label: "Contact" },
  { value: "services", label: "Services" },
  { value: "blog", label: "Blog" },
];

const SECTION_TYPES = [
  { value: "hero", label: "Hero", icon: Layout },
  { value: "cards", label: "Cards", icon: LayoutList },
  { value: "stats", label: "Stats", icon: BarChart3 },
  { value: "text", label: "Text", icon: Type },
  { value: "cta", label: "CTA", icon: Megaphone },
  { value: "features", label: "Features", icon: Layout },
  { value: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { value: "faq", label: "FAQ", icon: HelpCircle },
  { value: "testimonials", label: "Testimonials", icon: MessageSquare },
];

function getTypeIcon(type: string) {
  const found = SECTION_TYPES.find((t) => t.value === type);
  return found ? found.icon : Layout;
}

function getTypeLabel(type: string) {
  const found = SECTION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

// ─── SectionTypeIcon Component (avoids creating component during render) ─

function SectionTypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "hero": return <Layout className={className} />;
    case "cards": return <LayoutList className={className} />;
    case "stats": return <BarChart3 className={className} />;
    case "text": return <Type className={className} />;
    case "cta": return <Megaphone className={className} />;
    case "features": return <Layout className={className} />;
    case "gallery": return <GalleryHorizontal className={className} />;
    case "faq": return <HelpCircle className={className} />;
    case "testimonials": return <MessageSquare className={className} />;
    default: return <Layout className={className} />;
  }
}

// ─── Sortable Item Component ───────────────────────────────────

function SortableSectionItem({
  section,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  section: ContentSection;
  onEdit: (s: ContentSection) => void;
  onDelete: (s: ContentSection) => void;
  onToggleActive: (s: ContentSection) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 border-b border-brand-emerald/10 hover:bg-brand-mint/10 transition-colors",
        isDragging && "opacity-50 bg-brand-mint/20",
        !section.isActive && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Type Icon */}
      <div className="h-8 w-8 rounded-lg bg-brand-mint/30 flex items-center justify-center flex-shrink-0">
        <SectionTypeIcon type={section.type} className="h-4 w-4 text-brand-emerald" />
      </div>

      {/* Section Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {section.title || section.sectionKey}
          </span>
          <Badge variant="outline" className="text-[10px] bg-brand-mint/20 text-brand-emerald border-brand-emerald/10">
            {getTypeLabel(section.type)}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono">
            {section.sectionKey}
          </Badge>
        </div>
        {section.subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{section.subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onToggleActive(section)}
          title={section.isActive ? "Deactivate" : "Activate"}
        >
          {section.isActive ? (
            <Eye className="h-3.5 w-3.5 text-brand-emerald" />
          ) : (
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-brand-emerald/10"
          onClick={() => onEdit(section)}
        >
          <Pencil className="h-3.5 w-3.5 text-brand-emerald" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-red-50"
          onClick={() => onDelete(section)}
        >
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    </div>
  );
}

// ─── Items Editor Component ────────────────────────────────────

function ItemsEditor({
  items,
  onChange,
}: {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}) {
  const addItem = () => {
    onChange([...items, { title: "", desc: "", icon: "", value: "", label: "", color: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg border border-brand-emerald/10 bg-brand-cream/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Item {i + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-red-50"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="h-3 w-3 text-red-400" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Title</Label>
              <Input
                value={item.title || ""}
                onChange={(e) => updateItem(i, "title", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Icon (Lucide name)</Label>
              <Input
                value={item.icon || ""}
                onChange={(e) => updateItem(i, "icon", e.target.value)}
                className="h-8 text-sm"
                placeholder="Shield, Droplets, Flame..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Description</Label>
            <Textarea
              value={item.desc || ""}
              onChange={(e) => updateItem(i, "desc", e.target.value)}
              className="text-sm"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Value</Label>
              <Input
                value={item.value || ""}
                onChange={(e) => updateItem(i, "value", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Label</Label>
              <Input
                value={item.label || ""}
                onChange={(e) => updateItem(i, "label", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Color class</Label>
              <Input
                value={item.color || ""}
                onChange={(e) => updateItem(i, "color", e.target.value)}
                className="h-8 text-sm"
                placeholder="bg-brand-mint/30"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Image URL</Label>
            <Input
              value={item.imageUrl || ""}
              onChange={(e) => updateItem(i, "imageUrl", e.target.value)}
              className="h-8 text-sm"
              placeholder="https://..."
            />
          </div>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full border-dashed"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add Item
      </Button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSlug, setPageSlug] = useState("home");

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Partial<ContentSection> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState("");
  const [newSectionType, setNewSectionType] = useState("cards");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ContentSection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sections?pageSlug=${pageSlug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSections(data.sections);
    } catch {
      toast({ title: "Error", description: "Failed to load sections", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [pageSlug, toast]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Drag end handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);

    // Optimistically update UI
    setSections(reordered);

    // Send reorder to API
    try {
      await fetch("/api/admin/sections/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reordered.map((s, i) => ({ id: s.id, sortOrder: i })),
        }),
      });
    } catch {
      toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
      fetchSections(); // Revert
    }
  };

  // Toggle active
  const handleToggleActive = async (section: ContentSection) => {
    try {
      const res = await fetch(`/api/admin/sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !section.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({
        title: section.isActive ? "Section deactivated" : "Section activated",
        description: `"${section.title || section.sectionKey}" is now ${section.isActive ? "hidden" : "visible"}`,
      });
      fetchSections();
    } catch {
      toast({ title: "Error", description: "Failed to toggle section", variant: "destructive" });
    }
  };

  // Open add dialog
  const handleAddOpen = () => {
    setNewSectionKey("");
    setNewSectionType("cards");
    setAddOpen(true);
  };

  // Create new section
  const handleCreate = () => {
    if (!newSectionKey.trim()) {
      toast({ title: "Validation Error", description: "Section key is required", variant: "destructive" });
      return;
    }

    const newSection: Partial<ContentSection> = {
      pageSlug,
      sectionKey: newSectionKey.trim().replace(/\s+/g, "-").toLowerCase(),
      type: newSectionType,
      title: "",
      subtitle: "",
      content: "",
      items: [],
      imageUrl: "",
      linkUrl: "",
      linkText: "",
      sortOrder: sections.length,
      isActive: true,
      settings: {},
    };

    setEditingSection(newSection);
    setIsNew(true);
    setAddOpen(false);
    setEditorOpen(true);
  };

  // Open edit dialog
  const handleEdit = (section: ContentSection) => {
    setEditingSection({
      ...section,
      items: section.items || [],
      settings: section.settings || {},
    });
    setIsNew(false);
    setEditorOpen(true);
  };

  // Save section
  const handleSave = async () => {
    if (!editingSection?.sectionKey || !editingSection?.type) {
      toast({ title: "Validation Error", description: "Section key and type are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/admin/sections" : `/api/admin/sections/${editingSection.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSection),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast({
        title: isNew ? "Section created" : "Section updated",
        description: `"${editingSection.title || editingSection.sectionKey}" has been ${isNew ? "created" : "updated"}`,
      });

      setEditorOpen(false);
      fetchSections();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Delete section
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/sections/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      toast({ title: "Section deleted", description: `"${deleteTarget.title || deleteTarget.sectionKey}" has been removed` });
      setDeleteTarget(null);
      fetchSections();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Section Editor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage CMS-driven sections for each page
          </p>
        </div>
        <Button onClick={handleAddOpen} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Page Selector */}
      <div className="flex items-center gap-4">
        <Label className="text-sm font-semibold">Page:</Label>
        <Select value={pageSlug} onValueChange={setPageSlug}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_OPTIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs">
          {sections.length} section{sections.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Sections List */}
      <div className="rounded-xl border border-brand-emerald/10 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
          </div>
        ) : sections.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Layout className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No sections for this page. Add your first section!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>Create a new content section for the {PAGE_OPTIONS.find((p) => p.value === pageSlug)?.label} page</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Section Key</Label>
              <Input
                value={newSectionKey}
                onChange={(e) => setNewSectionKey(e.target.value)}
                placeholder="e.g. hero, advantages, stats, cta"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Unique identifier for this section within the page</p>
            </div>
            <div className="space-y-2">
              <Label>Section Type</Label>
              <Select value={newSectionType} onValueChange={setNewSectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-brand-primary hover:bg-brand-primary/90">Create Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? "Create Section" : "Edit Section"}</DialogTitle>
            <DialogDescription>
              {editingSection?.sectionKey} ({getTypeLabel(editingSection?.type || "")})
            </DialogDescription>
          </DialogHeader>

          {editingSection && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingSection.title || ""}
                    onChange={(e) => setEditingSection((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={editingSection.subtitle || ""}
                    onChange={(e) => setEditingSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Section subtitle"
                  />
                </div>
              </div>

              {/* Section Key & Type (read-only for existing) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Section Key</Label>
                  <Input
                    value={editingSection.sectionKey || ""}
                    onChange={(e) => setEditingSection((prev) => ({ ...prev, sectionKey: e.target.value }))}
                    className="font-mono"
                    disabled={!isNew}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingSection.type || "cards"}
                    onValueChange={(v) => setEditingSection((prev) => ({ ...prev, type: v }))}
                    disabled={!isNew}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Page Slug</Label>
                  <Input
                    value={editingSection.pageSlug || ""}
                    className="font-mono"
                    disabled
                  />
                </div>
              </div>

              {/* Content (HTML) */}
              <div className="space-y-2">
                <Label>Content (HTML)</Label>
                <Textarea
                  value={editingSection.content || ""}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="<h2>Section Title</h2><p>Content...</p>"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={editingSection.imageUrl || ""}
                  onChange={(e) => setEditingSection((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              {/* Link URL & Text */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link URL</Label>
                  <Input
                    value={editingSection.linkUrl || ""}
                    onChange={(e) => setEditingSection((prev) => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="/contact"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Text</Label>
                  <Input
                    value={editingSection.linkText || ""}
                    onChange={(e) => setEditingSection((prev) => ({ ...prev, linkText: e.target.value }))}
                    placeholder="Get Free Quote"
                  />
                </div>
              </div>

              {/* Items Editor */}
              <div className="space-y-2">
                <Label>Items</Label>
                <ItemsEditor
                  items={editingSection.items || []}
                  onChange={(items) => setEditingSection((prev) => ({ ...prev, items }))}
                />
              </div>

              {/* Settings (JSON) */}
              <div className="space-y-2">
                <Label>Settings (JSON)</Label>
                <Textarea
                  value={editingSection.settings ? JSON.stringify(editingSection.settings, null, 2) : ""}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingSection((prev) => ({ ...prev, settings: parsed }));
                    } catch {
                      // Keep as-is for now, user is still typing
                    }
                  }}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder='{"layout": "grid", "columns": 3}'
                />
              </div>

              {/* isActive & sortOrder */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingSection.isActive ?? true}
                    onCheckedChange={(checked) =>
                      setEditingSection((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label>{editingSection.isActive ? "Active" : "Inactive"}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Sort Order</Label>
                  <Input
                    type="number"
                    value={editingSection.sortOrder ?? 0}
                    onChange={(e) =>
                      setEditingSection((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))
                    }
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-brand-primary hover:bg-brand-primary/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isNew ? "Create Section" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title || deleteTarget?.sectionKey}&quot;? This action cannot be undone.
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
