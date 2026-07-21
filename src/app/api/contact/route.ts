/**
 * Contact Form API — Wedabime Pramukayo
 * Receives contact form submissions and stores/logs them
 * Can be extended with email integration (Resend, SendGrid, etc.)
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Message length check
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    // Log the submission (in production, you'd send an email or store in DB)
    console.log("📧 New Contact Form Submission:", {
      name,
      email,
      phone: phone || "N/A",
      subject,
      message: message.substring(0, 200) + (message.length > 200 ? "..." : ""),
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate with email service (Resend, SendGrid, Nodemailer, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'website@wedabimepramukayo.site',
    //   to: 'info@wedabimepramukayo.site',
    //   subject: `[Contact Form] ${subject}`,
    //   html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone || 'N/A'}</p><p><strong>Message:</strong></p><p>${message}</p>`,
    // });

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully! We'll get back to you within 24 hours." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
