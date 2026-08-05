"use client";

/**
 * Items Editor Component — Wedabime Pramukayo CMS
 * Reusable component for editing the `items` JSON array of ContentSection
 * Each item has: title, desc, icon, imageUrl, value, label, color fields
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export interface SectionItem {
  icon?: string;
  title?: string;
  desc?: string;
  value?: string;
  label?: string;
  color?: string;
  imageUrl?: string;
  [key: string]: any;
}

interface ItemsEditorProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function ItemsEditor({ items, onChange }: ItemsEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { title: "", desc: "", icon: "", value: "", label: "", color: "", imageUrl: "" },
    ]);
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
        <div
          key={i}
          className="p-3 rounded-lg border border-brand-emerald/10 bg-brand-cream/50 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Item {i + 1}
            </span>
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

export default ItemsEditor;
