"use client";

/**
 * Admin Media Manager — Cloudinary-powered image gallery
 * Wedabime Pramukayo CMS
 *
 * Features:
 * - Grid/list view toggle for browsing uploaded images
 * - Upload new images to Cloudinary via drag & drop or file picker
 * - Search and filter by filename, folder
 * - Copy URL to clipboard for use in CMS content
 * - Delete images (removes from Cloudinary + DB)
 * - Image preview with details panel
 * - Pagination for large libraries
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Trash2,
  Copy,
  ExternalLink,
  ImageIcon,
  MoreVertical,
  Loader2,
  CheckCircle,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Info,
  ZoomIn,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  cloudinaryId: string | null;
  altText: string | null;
  filename: string | null;
  mimeType: string | null;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  folder: string | null;
  uploadedBy: string | null;
  createdAt: string;
  thumbnailUrl: string;
  optimizedUrl: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type ViewMode = "grid" | "list";

export default function MediaManagerPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch media
  const fetchMedia = useCallback(
    async (page = 1, searchQuery = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
          search: searchQuery,
        });
        const res = await fetch(`/api/admin/media?${params}`);
        if (!res.ok) throw new Error("Failed to fetch media");
        const data = await res.json();
        setMedia(data.media || []);
        setPagination(
          data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
        );
      } catch {
        toast({
          title: "Error",
          description: "Failed to load media library",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchMedia(1, search);
  }, [fetchMedia, search]);

  // Upload handler
  const handleUpload = async (files: FileList | File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading 0/${files.length}...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (file.name) {
          formData.append("altText", file.name.replace(/\.[^/.]+$/, ""));
        }

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Upload failed");
        }

        successCount++;
      } catch {
        errorCount++;
      }
    }

    setUploading("");
    setUploading(false);

    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} image${successCount > 1 ? "s" : ""} uploaded to Cloudinary${errorCount > 0 ? `. ${errorCount} failed.` : "."}`,
      });
      fetchMedia(1, search);
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Upload Failed",
        description: `All ${errorCount} upload(s) failed. Check file format and size.`,
        variant: "destructive",
      });
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleUpload(files);
  };

  // Copy URL
  const copyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      toast({ title: "URL Copied", description: "Image URL copied to clipboard" });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Could not copy URL",
        variant: "destructive",
      });
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/admin/media?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      toast({
        title: "Deleted",
        description: "Image removed from Cloudinary and database",
      });
      fetchMedia(pagination.page, search);
    } catch {
      toast({
        title: "Delete Failed",
        description: "Could not delete the image",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  // Format file size
  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-brand-emerald" />
            Media Manager
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Cloud className="h-3.5 w-3.5" />
            Images stored in Cloudinary — only URLs saved in database
          </p>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-brand-emerald hover:bg-brand-emerald/90"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadProgress}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* Upload Drop Zone (visible when dragging) */}
      {dragOver && (
        <div
          className="border-2 border-dashed border-brand-emerald bg-brand-emerald/5 rounded-xl p-12 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-brand-emerald mx-auto mb-3" />
          <p className="text-lg font-semibold text-brand-emerald">
            Drop images here to upload to Cloudinary
          </p>
          <p className="text-sm text-gray-500 mt-1">
            JPEG, PNG, WebP, GIF, SVG — Max 10MB per file
          </p>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploading && (
        <div className="bg-brand-emerald/10 border border-brand-emerald/20 rounded-lg p-3 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-brand-emerald animate-spin" />
          <span className="text-sm font-medium text-brand-emerald">
            {uploadProgress}
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div
        className="flex items-center gap-3 flex-wrap"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by filename or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-none",
              viewMode === "grid" && "bg-brand-emerald hover:bg-brand-emerald/90"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-none",
              viewMode === "list" && "bg-brand-emerald hover:bg-brand-emerald/90"
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Badge variant="outline" className="text-xs">
          {pagination.total} image{pagination.total !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Empty state (no images, no search) */}
      {!dragOver && media.length === 0 && !loading && !search && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-brand-emerald/50 hover:bg-brand-emerald/5 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Cloud className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">No images yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Drag & drop images here, or click to browse files
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Images will be uploaded to Cloudinary — only URLs stored in database
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              : "space-y-3"
          )}
        >
          {Array.from({ length: 8 }).map((_, i) =>
            viewMode === "grid" ? (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-brand-emerald/30 transition-all duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Image */}
              <div
                className="aspect-square relative bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => {
                  setSelectedMedia(item);
                  setPreviewOpen(true);
                }}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.altText || item.filename || "Image"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMedia(item);
                      setPreviewOpen(true);
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(item);
                    }}
                  >
                    {copiedId === item.id ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p
                  className="text-xs font-medium text-gray-700 truncate"
                  title={item.filename || "Untitled"}
                >
                  {item.filename || "Untitled"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">
                    {formatSize(item.fileSize)}
                  </span>
                  {item.width && item.height && (
                    <span className="text-[10px] text-gray-400">
                      {item.width}×{item.height}
                    </span>
                  )}
                </div>
              </div>

              {/* More menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7 p-0 bg-white/90 hover:bg-white shadow-sm"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMedia(item);
                        setPreviewOpen(true);
                      }}
                    >
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyUrl(item)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Original
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(item)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && viewMode === "list" && media.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 p-3">Image</th>
                <th className="text-left text-xs font-medium text-gray-500 p-3">Filename</th>
                <th className="text-left text-xs font-medium text-gray-500 p-3 hidden md:table-cell">Size</th>
                <th className="text-left text-xs font-medium text-gray-500 p-3 hidden lg:table-cell">Dimensions</th>
                <th className="text-left text-xs font-medium text-gray-500 p-3 hidden sm:table-cell">Date</th>
                <th className="text-right text-xs font-medium text-gray-500 p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div
                      className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 cursor-pointer relative"
                      onClick={() => {
                        setSelectedMedia(item);
                        setPreviewOpen(true);
                      }}
                    >
                      <Image
                        src={item.thumbnailUrl || item.url}
                        alt={item.altText || "Image"}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]" title={item.filename || "Untitled"}>
                      {item.filename || "Untitled"}
                    </p>
                    {item.altText && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.altText}</p>
                    )}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="text-sm text-gray-500">{formatSize(item.fileSize)}</span>
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-500">
                      {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                    </span>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => copyUrl(item)} title="Copy URL">
                        {copiedId === item.id ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(item.url, "_blank")} title="Open original">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(item)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No search results */}
      {!loading && search && media.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600">No images found</h3>
          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchMedia(pagination.page - 1, search)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-500 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchMedia(pagination.page + 1, search)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-brand-emerald" />
              {selectedMedia?.filename || "Image Preview"}
            </DialogTitle>
            <DialogDescription>Image details and actions</DialogDescription>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px] max-h-[500px]">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || "Preview"}
                  width={selectedMedia.width || 800}
                  height={selectedMedia.height || 600}
                  className="max-h-[500px] w-auto object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Info className="h-3 w-3" /> File Size</p>
                  <p className="text-sm font-medium">{formatSize(selectedMedia.fileSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Dimensions</p>
                  <p className="text-sm font-medium">
                    {selectedMedia.width && selectedMedia.height
                      ? `${selectedMedia.width}×${selectedMedia.height}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><FolderOpen className="h-3 w-3" /> Folder</p>
                  <p className="text-sm font-medium">{selectedMedia.folder || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm font-medium">{selectedMedia.mimeType || "—"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Image URL</label>
                <div className="flex items-center gap-2">
                  <Input value={selectedMedia.url} readOnly className="text-xs font-mono bg-gray-50" />
                  <Button variant="outline" size="sm" onClick={() => copyUrl(selectedMedia)} className="flex-shrink-0">
                    {copiedId === selectedMedia.id ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {selectedMedia.altText && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alt Text</label>
                  <p className="text-sm text-gray-700 mt-1">{selectedMedia.altText}</p>
                </div>
              )}

              {selectedMedia.cloudinaryId && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cloudinary ID</label>
                  <p className="text-xs font-mono text-gray-400 mt-1">{selectedMedia.cloudinaryId}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</label>
                <p className="text-sm text-gray-700 mt-1">{formatDate(selectedMedia.createdAt)}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => window.open(selectedMedia?.url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" /> Open Original
            </Button>
            <Button variant="outline" onClick={() => selectedMedia && copyUrl(selectedMedia)}>
              <Copy className="h-4 w-4 mr-2" /> Copy URL
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setPreviewOpen(false);
                if (selectedMedia) setDeleteTarget(selectedMedia);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.filename}&quot; from Cloudinary and remove the URL from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete from Cloudinary
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
