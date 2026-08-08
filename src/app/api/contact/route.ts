/**
 * Contact Form API — Wedabime Pramukayo
 * Receives contact form submissions, validates them, and stores in DB
 * Can be extended with email integration (Resend, SendGrid, etc.)
 *
 * Public endpoint — no auth check required.
 * Converted from Prisma to Neon direct SQL for Cloudflare Workers compatibility.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSql, generateId, badRequest, serverError } from "@/lib/neon-sql";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sql = getSql();
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return badRequest("Name, email, subject, and message are required.");
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return badRequest("Please provide a valid email address.");
    }

    // Message length check
    if (message.length < 10) {
      return badRequest("Message must be at least 10 characters long.");
    }

    // Store in database
    const id = generateId();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone?.trim() || null;
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    await sql`
      INSERT INTO "ContactSubmission" (id, name, email, phone, subject, message, "isRead", "isReplied", "repliedAt", "createdAt", "updatedAt")
      VALUES (${id}, ${trimmedName}, ${trimmedEmail}, ${trimmedPhone}, ${trimmedSubject}, ${trimmedMessage}, false, false, NULL, NOW(), NOW())
    `;

    // Log for monitoring
    console.log("📧 New Contact Form Submission:", {
      id,
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate with email service (Resend, SendGrid, Nodemailer, etc.)

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully! We'll get back to you within 24 hours." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return serverError("Something went wrong. Please try again later.");
  }
}
