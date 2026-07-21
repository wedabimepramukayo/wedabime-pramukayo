"use client";

/**
 * Admin Site Settings — Full tabbed editor with save functionality
 * Wedabime Pramukayo CMS — Phase 3
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Loader2,
  CheckCircle,
  Settings,
  Search,
  Globe,
  Palette,
  Phone,
  Share2,
  Leaf,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  isPublic: boolean;
}

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  general: { label: "General", icon: Settings, color: "text-brand-primary" },
  seo: { label: "SEO", icon: Globe, color: "text-brand-emerald" },
  theme: { label: "Theme & Colors", icon: Palette, color: "text-brand-teal" },
  contact: { label: "Contact", icon: Phone, color: "text-brand-gold" },
  social: { label: "Social Media", icon: Share2, color: "text-brand-spring" },
};

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSettings(data.settings);
      // Initialize edited values
      const vals: Record<string, string> = {};
      data.settings.forEach((s: Setting) => {
        vals[s.key] = s.value;
      });
      setEditedValues(vals);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save all edited settings
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Only send changed values
      const changed: Record<string, string> = {};
      for (const [key, value] of Object.entries(editedValues)) {
        const original = settings.find((s) => s.key === key);
        if (original && original.value !== value) {
          changed[key] = value;
        }
      }

      if (Object.keys(changed).length === 0) {
        toast({ title: "No changes", description: "No settings were modified" });
        setSaving(false);
        return;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: changed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      // Update local state
      setSettings((prev) =>
        prev.map((s) => ({
          ...s,
          value: editedValues[s.key] ?? s.value,
        }))
      );

      setSaved(true);
      toast({
        title: "Settings saved",
        description: `Updated ${Object.keys(changed).length} setting(s)`,
      });

      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Group settings by category
  const grouped: Record<string, Setting[]> = {};
  settings.forEach((s) => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  // Filter by search
  const filteredSettings = searchQuery
    ? settings.filter(
        (s) =>
          s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Count unsaved changes
  const unsavedCount = Object.entries(editedValues).filter(([key, value]) => {
    const original = settings.find((s) => s.key === key);
    return original && original.value !== value;
  }).length;

  // Check if a value is a color (hex code)
  const isColorValue = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);

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
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure global site settings, SEO, theme, and social media
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unsavedCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-medium">
              {unsavedCount} unsaved
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || unsavedCount === 0}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search settings by key, description, or value..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search Results or Tabbed View */}
      {filteredSettings ? (
        <div className="rounded-xl border border-brand-emerald/10 bg-white p-6 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Search Results ({filteredSettings.length})
          </h2>
          {filteredSettings.map((s) => (
            <div key={s.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">{s.key}</Label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-mint/30 text-brand-primary">
                  {s.category}
                </span>
              </div>
              {s.description && (
                <p className="text-xs text-muted-foreground">{s.description}</p>
              )}
              <div className="flex items-center gap-3">
                {isColorValue(editedValues[s.key] || "") ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editedValues[s.key] || ""}
                      onChange={(e) =>
                        setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                      }
                      className="h-9 w-12 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={editedValues[s.key] || ""}
                      onChange={(e) =>
                        setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                      }
                      className="max-w-[200px]"
                    />
                  </div>
                ) : (
                  <Input
                    value={editedValues[s.key] || ""}
                    onChange={(e) =>
                      setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-brand-mint/20">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger key={key} value={key} className="gap-1.5">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  {config.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(grouped).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="rounded-xl border border-brand-emerald/10 bg-white p-6 space-y-6">
                {items.map((s) => (
                  <div key={s.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-foreground">
                        {s.description || s.key}
                      </Label>
                      <code className="text-[10px] px-1.5 py-0.5 rounded bg-brand-mint/30 text-brand-primary font-mono">
                        {s.key}
                      </code>
                    </div>

                    {isColorValue(editedValues[s.key] || "") ? (
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-lg border border-input shadow-sm"
                          style={{ backgroundColor: editedValues[s.key] || "#000" }}
                        />
                        <input
                          type="color"
                          value={editedValues[s.key] || ""}
                          onChange={(e) =>
                            setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                          }
                          className="h-9 w-12 rounded border border-input cursor-pointer"
                        />
                        <Input
                          value={editedValues[s.key] || ""}
                          onChange={(e) =>
                            setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                          }
                          className="max-w-[200px] font-mono"
                        />
                      </div>
                    ) : s.value.length > 100 || s.key.includes("description") || s.key.includes("keywords") ? (
                      <Textarea
                        value={editedValues[s.key] || ""}
                        onChange={(e) =>
                          setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                        }
                        rows={3}
                      />
                    ) : (
                      <Input
                        value={editedValues[s.key] || ""}
                        onChange={(e) =>
                          setEditedValues((prev) => ({ ...prev, [s.key]: e.target.value }))
                        }
                      />
                    )}

                    {/* Show unsaved indicator */}
                    {s.value !== editedValues[s.key] && (
                      <p className="text-[10px] text-brand-gold flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-gold" />
                        Modified (was: {s.value.length > 50 ? s.value.slice(0, 50) + "..." : s.value})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Eco Stats Footer */}
      <div className="rounded-xl bg-gradient-to-r from-brand-dark to-brand-secondary p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-spring/20 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-brand-spring" />
          </div>
          <div>
            <div className="font-semibold">Eco Impact Stats</div>
            <div className="text-sm text-brand-sage/70">
              These values are used across the website. Update trees_saved_monthly and warranty_years to reflect current figures.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
