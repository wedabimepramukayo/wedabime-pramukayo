"use client";

/**
 * Admin Social Media Manager — Connected accounts, posting history, manual triggers
 * Wedabime Pramukayo CMS
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Share2,
  Plus,
  Trash2,
  Loader2,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Facebook,
  Instagram,
  Globe,
  MessageCircle,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialAccount {
  id: string;
  platform: string;
  accessToken: string | null;
  refreshToken: string | null;
  accountId: string | null;
  accountName: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  postCount?: number;
}

interface SocialPostRecord {
  id: string;
  blogPostId: string | null;
  platform: string;
  platformPostId: string | null;
  status: string;
  content: string | null;
  error: string | null;
  publishedAt: string | null;
  createdAt: string;
  socialAccountId: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

const PLATFORMS = [
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
  { value: "threads", label: "Threads", icon: MessageCircle, color: "text-gray-800" },
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
  { value: "blogger", label: "Blogger", icon: BookOpen, color: "text-orange-600" },
  { value: "medium", label: "Medium", icon: Globe, color: "text-green-700" },
  { value: "reddit", label: "Reddit", icon: MessageCircle, color: "text-orange-500" },
];

function getPlatformInfo(platform: string) {
  return PLATFORMS.find((p) => p.value === platform) || {
    value: platform,
    label: platform,
    icon: Globe,
    color: "text-gray-600",
  };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "published":
      return (
        <Badge className="bg-brand-spring/10 text-brand-emerald border-brand-spring/20">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Published
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="bg-red-50 text-red-600">
          <XCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-brand-gold/10 text-brand-gold">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
  }
}

export default function AdminSocialClient() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPostRecord[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [newPlatform, setNewPlatform] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccessToken, setNewAccessToken] = useState("");
  const [newAccountId, setNewAccountId] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<SocialAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Post now state
  const [postNowOpen, setPostNowOpen] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [accRes, postsRes, blogRes] = await Promise.all([
        fetch("/api/admin/social-accounts"),
        fetch("/api/admin/social-accounts"), // Will load posts from accounts endpoint
        fetch("/api/admin/blog"),
      ]);

      if (accRes.ok) {
        const data = await accRes.json();
        setAccounts(data.accounts || []);
      }
      if (blogRes.ok) {
        const data = await blogRes.json();
        setBlogPosts(data.posts || []);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load social media data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAccount = async () => {
    if (!newPlatform) {
      toast({ title: "Validation Error", description: "Select a platform", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: newPlatform,
          accountName: newAccountName || undefined,
          accessToken: newAccessToken || undefined,
          accountId: newAccountId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add account");
      }
      toast({ title: "Account added", description: `${getPlatformInfo(newPlatform).label} account connected` });
      setAddOpen(false);
      setNewPlatform("");
      setNewAccountName("");
      setNewAccessToken("");
      setNewAccountId("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (account: SocialAccount) => {
    try {
      const res = await fetch(`/api/admin/social-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !account.isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      toast({ title: account.isActive ? "Account disabled" : "Account enabled" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/social-accounts/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Account removed", description: `${getPlatformInfo(deleteTarget.platform).label} account disconnected` });
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handlePostNow = async () => {
    if (!selectedBlogPost) {
      toast({ title: "Validation Error", description: "Select a blog post", variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/admin/social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogPostId: selectedBlogPost,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post");
      toast({
        title: "Social posting complete",
        description: data.message,
      });
      setPostNowOpen(false);
      setSelectedBlogPost("");
      setSelectedPlatforms([]);
    } catch (err: any) {
      toast({ title: "Posting failed", description: err.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

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
          <h1 className="text-2xl font-bold text-foreground">Social Media</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect platforms and auto-share blog posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPostNowOpen(true)}
            className="border-brand-emerald/30 hover:bg-brand-mint/10"
          >
            <Send className="h-4 w-4 mr-2" />
            Post Now
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Connected Accounts */}
      <Card className="border-brand-emerald/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-brand-emerald" />
            Connected Accounts
          </CardTitle>
          <CardDescription>
            Social media platforms configured for auto-posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Share2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No social accounts connected yet.</p>
              <p className="text-sm mt-1">Click &quot;Add Account&quot; to connect a platform.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => {
                const platformInfo = getPlatformInfo(account.platform);
                const PlatformIcon = platformInfo.icon;
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-brand-emerald/10 hover:bg-brand-mint/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-brand-mint/20 flex items-center justify-center ${platformInfo.color}`}>
                        <PlatformIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{platformInfo.label}</span>
                          {account.accountName && (
                            <span className="text-sm text-muted-foreground">({account.accountName})</span>
                          )}
                          {account.isActive ? (
                            <Badge className="bg-brand-spring/10 text-brand-emerald border-brand-spring/20 text-[10px]">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {account.accountId && <span>ID: {account.accountId}</span>}
                          {account.accessToken && <span>Token: {account.accessToken}</span>}
                          {account.lastUsedAt && (
                            <span>Last used: {new Date(account.lastUsedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={account.isActive}
                          onCheckedChange={() => handleToggleActive(account)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-50"
                        onClick={() => setDeleteTarget(account)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORMS.map((platform) => {
          const connected = accounts.filter((a) => a.platform === platform.value);
          const active = connected.filter((a) => a.isActive);
          const Icon = platform.icon;

          return (
            <Card key={platform.value} className="border-brand-emerald/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${platform.color}`} />
                    <span className="font-medium">{platform.label}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      active.length > 0
                        ? "bg-brand-spring/10 text-brand-emerald border-brand-spring/20"
                        : "bg-gray-50 text-gray-500"
                    }
                  >
                    {active.length} active
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{connected.length} account(s) connected</p>
                  {connected.length > 0 && (
                    <p>
                      {connected.map((a) => a.accountName || a.accountId || "Unknown").join(", ")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Social Account</DialogTitle>
            <DialogDescription>
              Add a social media platform for auto-posting blog content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select value={newPlatform} onValueChange={setNewPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center gap-2">
                        <p.icon className={`h-4 w-4 ${p.color}`} />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., Wedabime Pramukayo FB Page"
              />
            </div>

            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                value={newAccessToken}
                onChange={(e) => setNewAccessToken(e.target.value)}
                type="password"
                placeholder="OAuth access token"
              />
              <p className="text-[10px] text-muted-foreground">
                Tokens are stored encrypted and masked in the UI
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account / Page ID</Label>
              <Input
                value={newAccountId}
                onChange={(e) => setNewAccountId(e.target.value)}
                placeholder="Platform-specific account or page ID"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAccount}
              disabled={saving || !newPlatform}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post Now Dialog */}
      <Dialog open={postNowOpen} onOpenChange={setPostNowOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post to Social Media</DialogTitle>
            <DialogDescription>
              Share a published blog post across connected social platforms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Blog Post *</Label>
              <Select value={selectedBlogPost} onValueChange={setSelectedBlogPost}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a published blog post" />
                </SelectTrigger>
                <SelectContent>
                  {blogPosts
                    .filter((p) => p.isPublished)
                    .map((post) => (
                      <SelectItem key={post.id} value={post.id}>
                        {post.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {blogPosts.filter((p) => p.isPublished).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No published blog posts available. Publish a post first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Platforms</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select platforms (leave empty to post to all active accounts)
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const hasAccount = accounts.some((a) => a.platform === p.value && a.isActive);
                  const isSelected = selectedPlatforms.includes(p.value);
                  const Icon = p.icon;
                  return (
                    <Button
                      key={p.value}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={
                        isSelected
                          ? "bg-brand-primary text-white"
                          : hasAccount
                          ? "border-brand-emerald/30"
                          : "opacity-50"
                      }
                      onClick={() => togglePlatform(p.value)}
                      disabled={!hasAccount}
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      {p.label}
                      {!hasAccount && " (not connected)"}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPostNowOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePostNow}
              disabled={posting || !selectedBlogPost}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Post Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Social Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect {deleteTarget ? getPlatformInfo(deleteTarget.platform).label : ""}?
              Posting history will be preserved but the account will no longer be available for auto-posting.
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
