"use client";

/**
 * Manage Admin Users Page — Wedabime Pramukayo CMS
 *
 * Allows existing admins to:
 *   - View all admin accounts
 *   - Create new admin accounts
 *   - Edit admin details (name, role, active status)
 *   - Reset passwords
 *   - Delete admin accounts (except the last one)
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UserPlus,
  Edit,
  Trash2,
  Key,
  Loader2,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function ManageAdminsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Add admin dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState("admin");
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("admin");
  const [editActive, setEditActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  // Reset password dialog state
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      toast.error("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Add new admin
  const handleAdd = async () => {
    if (!addEmail || !addPassword) {
      toast.error("Email and password are required");
      return;
    }
    if (addPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail,
          name: addName || undefined,
          password: addPassword,
          role: addRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create admin");
        return;
      }
      toast.success("Admin account created successfully");
      setAddOpen(false);
      setAddEmail("");
      setAddName("");
      setAddPassword("");
      setAddRole("admin");
      fetchUsers();
    } catch {
      toast.error("Failed to create admin account");
    } finally {
      setAddLoading(false);
    }
  };

  // Edit user
  const handleEdit = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          isActive: editActive,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update user");
        return;
      }
      toast.success("User updated successfully");
      setEditOpen(false);
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!resetUser || !resetPassword) return;
    if (resetPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${resetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to reset password");
        return;
      }
      toast.success("Password reset successfully");
      setResetOpen(false);
      setResetPassword("");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
        return;
      }
      toast.success("User deleted successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditRole(user.role);
    setEditActive(user.isActive);
    setEditOpen(true);
  };

  const openReset = (user: AdminUser) => {
    setResetUser(user);
    setResetPassword("");
    setResetOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-spring" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-spring" />
            Manage Admins
          </h1>
          <p className="text-brand-sage/60 text-sm mt-1">
            Create, edit, and manage admin accounts
          </p>
        </div>

        {/* Add Admin Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-primary hover:bg-brand-emerald text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-brand-dark border-brand-emerald/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Admin Account
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-brand-sage/80">Full Name</Label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Full name"
                  className="bg-brand-dark/50 border-brand-emerald/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-sage/80">Email *</Label>
                <Input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="bg-brand-dark/50 border-brand-emerald/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-sage/80">Password *</Label>
                <Input
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="bg-brand-dark/50 border-brand-emerald/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-sage/80">Role</Label>
                <Select value={addRole} onValueChange={setAddRole}>
                  <SelectTrigger className="bg-brand-dark/50 border-brand-emerald/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-dark border-brand-emerald/20">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAdd}
                disabled={addLoading}
                className="w-full bg-brand-primary hover:bg-brand-emerald text-white"
              >
                {addLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-brand-dark/60 border-brand-emerald/15">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-brand-spring">
              {users.length}
            </div>
            <div className="text-xs text-brand-sage/60">Total Accounts</div>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark/60 border-brand-emerald/15">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-400">
              {users.filter((u) => u.isActive).length}
            </div>
            <div className="text-xs text-brand-sage/60">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-brand-dark/60 border-brand-emerald/15">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-brand-emerald">
              {users.filter((u) => u.role === "admin").length}
            </div>
            <div className="text-xs text-brand-sage/60">Admins</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-brand-dark/60 border-brand-emerald/15">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            <Shield className="inline h-5 w-5 mr-2 text-brand-spring" />
            Admin Accounts
          </CardTitle>
          <CardDescription className="text-brand-sage/60">
            {users.length} account{users.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-brand-sage/50 text-center py-8">
              No admin accounts found. Create the first one above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-brand-emerald/15 hover:bg-brand-emerald/5">
                  <TableHead className="text-brand-sage/70">Name</TableHead>
                  <TableHead className="text-brand-sage/70">Email</TableHead>
                  <TableHead className="text-brand-sage/70">Role</TableHead>
                  <TableHead className="text-brand-sage/70">Status</TableHead>
                  <TableHead className="text-brand-sage/70">
                    Last Login
                  </TableHead>
                  <TableHead className="text-brand-sage/70 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-brand-emerald/10 hover:bg-brand-emerald/5"
                  >
                    <TableCell className="text-white font-medium">
                      {user.name || "—"}
                    </TableCell>
                    <TableCell className="text-brand-sage/80">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className={
                          user.role === "admin"
                            ? "bg-brand-emerald/20 text-brand-spring"
                            : "bg-brand-sage/20 text-brand-sage/70"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </TableCell>
                    <TableCell className="text-brand-sage/50 text-xs">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(user)}
                          className="text-brand-sage/60 hover:text-brand-spring hover:bg-brand-emerald/10 h-8 w-8 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openReset(user)}
                          className="text-brand-sage/60 hover:text-yellow-400 hover:bg-yellow-400/10 h-8 w-8 p-0"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-brand-sage/60 hover:text-red-400 hover:bg-red-400/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-brand-dark border-brand-emerald/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Delete Admin Account?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-brand-sage/60">
                                This will permanently delete the account for{" "}
                                <strong className="text-white">
                                  {user.email}
                                </strong>
                                . This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-brand-dark/50 border-brand-emerald/20 text-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(user.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-brand-dark border-brand-emerald/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Admin Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-brand-sage/80">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-brand-dark/50 border-brand-emerald/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-brand-sage/80">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="bg-brand-dark/50 border-brand-emerald/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-brand-dark border-brand-emerald/20">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-brand-sage/80">Active</Label>
              <Button
                size="sm"
                variant={editActive ? "default" : "outline"}
                onClick={() => setEditActive(!editActive)}
                className={
                  editActive
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-brand-dark/50 border-brand-emerald/20 text-brand-sage/60"
                }
              >
                {editActive ? "Active" : "Inactive"}
              </Button>
            </div>
            <Button
              onClick={handleEdit}
              disabled={editLoading}
              className="w-full bg-brand-primary hover:bg-brand-emerald text-white"
            >
              {editLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-brand-dark border-brand-emerald/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Reset Password — {resetUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-brand-sage/80">New Password</Label>
              <Input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-brand-dark/50 border-brand-emerald/20 text-white"
              />
            </div>
            <Button
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {resetLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Key className="mr-2 h-4 w-4" />
              )}
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
