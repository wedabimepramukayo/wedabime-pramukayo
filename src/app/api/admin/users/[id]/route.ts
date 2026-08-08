/**
 * Admin User Management API — Update & Delete individual users
 * PATCH /api/admin/users/[id]  → update user (name, role, isActive, password)
 * DELETE /api/admin/users/[id] → delete user (prevent deleting last admin)
 *
 * Uses @neondatabase/serverless directly (Cloudflare Workers compatible)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getSql,
  requireAuth,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/neon-sql";
import { hashPassword } from "@/lib/password-utils";

const USER_COLUMNS = `
  id, email, name, role, "isActive", "lastLoginAt", "createdAt"
`.trim();

// PATCH /api/admin/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const sql = getSql();

    // Build SET clauses dynamically
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const addField = (column: string, value: unknown) => {
      setClauses.push(`${column} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    };

    if (body.name !== undefined) addField("name", body.name);
    if (body.role !== undefined) addField("role", body.role);
    if (body.isActive !== undefined) addField('"isActive"', body.isActive);

    // If changing password
    if (body.password) {
      if (body.password.length < 8) {
        return badRequest("Password must be at least 8 characters long");
      }
      const hashedPassword = await hashPassword(body.password);
      addField('"passwordHash"', hashedPassword);
    }

    if (setClauses.length === 0) {
      // No fields to update — return current user
      const [user] = await sql`
        SELECT ${sql.unsafe(USER_COLUMNS)} FROM "User" WHERE id = ${id}
      `;
      if (!user) {
        return badRequest("User not found");
      }
      return NextResponse.json({ user });
    }

    // Always update updatedAt
    setClauses.push(`"updatedAt" = NOW()`);

    const setClause = setClauses.join(", ");
    values.push(id); // last param for WHERE

    const [user] = await sql.unsafe(
      `UPDATE "User" SET ${setClause} WHERE id = $${paramIndex} RETURNING ${USER_COLUMNS}`,
      values
    );

    if (!user) {
      return badRequest("User not found");
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to update user:", error);
    return serverError("Failed to update user");
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) return unauthorized();

    const { id } = await params;
    const sql = getSql();

    // Prevent deleting the last admin
    const [adminRow] = await sql`
      SELECT COUNT(*)::int AS count FROM "User" WHERE role = 'admin' AND "isActive" = true
    `;

    if (adminRow.count <= 1) {
      return badRequest("Cannot delete the last active admin account");
    }

    await sql`
      DELETE FROM "User" WHERE id = ${id}
    `;

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return serverError("Failed to delete user");
  }
}
