"use client";

/**
 * Admin Contact Messages Manager — Wedabime Pramukayo CMS
 * View, read, reply-status, and delete contact form submissions
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  Mail,
  MailOpen,
  CheckCircle,
  Trash2,
  Loader2,
  Phone,
  Clock,
  User,
  MessageSquare,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  repliedAt: string | null;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "unread") params.set("unread", "true");
      const res = await fetch(`/api/admin/contact?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    } catch {
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: true }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: "Marked as read" });
      fetchSubmissions();
    } catch {
      toast({ title: "Error", description: "Failed to mark as read", variant: "destructive" });
    }
  };

  const markAsReplied = async (id: string) => {
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isReplied: true }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast({ title: "Marked as replied" });
      fetchSubmissions();
    } catch {
      toast({ title: "Error", description: "Failed to mark as replied", variant: "destructive" });
    }
  };

  const deleteSubmission = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contact?id=${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Message deleted" });
      setDeleteId(null);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const openMessage = (sub: Submission) => {
    setSelectedSubmission(sub);
    if (!sub.isRead) markAsRead(sub.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contact form submissions from your website
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-brand-spring text-brand-dark">
              {unreadCount} unread
            </Badge>
          )}
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({total})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && submissions.length === 0 && (
        <div className="text-center py-16">
          <Inbox className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No messages yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Contact form submissions will appear here
          </p>
        </div>
      )}

      {/* Messages List */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => openMessage(sub)}
              className={`p-5 rounded-xl border bg-white transition-all cursor-pointer hover:shadow-md ${
                !sub.isRead
                  ? "border-brand-spring/30 bg-brand-spring/5 hover:bg-brand-spring/10"
                  : "border-brand-emerald/10 hover:border-brand-emerald/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!sub.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-spring flex-shrink-0" />
                    )}
                    <span className="font-semibold text-foreground">{sub.name}</span>
                    {sub.isReplied && (
                      <Badge variant="outline" className="text-[10px] text-brand-emerald border-brand-emerald/20">
                        <CheckCircle className="h-2.5 w-2.5 mr-1" />
                        Replied
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-medium text-foreground/80 mb-1">{sub.subject}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{sub.message}</div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {sub.email}
                    </span>
                    {sub.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {sub.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(sub.createdAt).toLocaleDateString("en-LK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-brand-primary" />
                  {selectedSubmission.subject}
                </DialogTitle>
                <DialogDescription>
                  From {selectedSubmission.name} on{" "}
                  {new Date(selectedSubmission.createdAt).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Sender Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-brand-mint/20">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
                      <User className="h-3 w-3 inline mr-1" />
                      Name
                    </div>
                    <div className="text-sm font-medium text-foreground">{selectedSubmission.name}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-brand-mint/20">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
                      <Mail className="h-3 w-3 inline mr-1" />
                      Email
                    </div>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-sm font-medium text-brand-primary hover:text-brand-emerald transition-colors"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                  {selectedSubmission.phone && (
                    <div className="p-3 rounded-lg bg-brand-mint/20 col-span-2">
                      <div className="text-[10px] font-medium uppercase text-muted-foreground mb-1">
                        <Phone className="h-3 w-3 inline mr-1" />
                        Phone
                      </div>
                      <a
                        href={`tel:${selectedSubmission.phone.replace(/[^0-9+]/g, "")}`}
                        className="text-sm font-medium text-brand-primary hover:text-brand-emerald transition-colors"
                      >
                        {selectedSubmission.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="p-4 rounded-lg border border-brand-emerald/10 bg-white">
                  <div className="text-[10px] font-medium uppercase text-muted-foreground mb-2">Message</div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {selectedSubmission.isReplied ? (
                    <Badge variant="outline" className="text-brand-emerald border-brand-emerald/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Replied
                    </Badge>
                  ) : selectedSubmission.isRead ? (
                    <Badge variant="outline" className="text-brand-gold border-brand-gold/20">
                      <MailOpen className="h-3 w-3 mr-1" />
                      Read
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-brand-spring border-brand-spring/20">
                      <Mail className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
              </div>

              <DialogFooter className="flex items-center gap-2 sm:gap-2">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Reply via Email
                </a>
                {!selectedSubmission.isReplied && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsReplied(selectedSubmission.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Replied
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteId(selectedSubmission.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSubmission}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
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
