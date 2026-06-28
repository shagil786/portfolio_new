import { NextResponse } from "next/server";
import { links } from "@/data/portfolioData";

export const runtime = "nodejs";

interface Payload {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message, company } = body;

  // honeypot: bots fill hidden fields → silently accept, do nothing
  if (company) return NextResponse.json({ ok: true });

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  // Not configured yet → tell the client to fall back to a mailto: link.
  if (!apiKey) {
    return NextResponse.json(
      { error: "unconfigured", fallback: true },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "MSN OS <onboarding@resend.dev>",
        to: [links.email],
        reply_to: email,
        subject: `[Portfolio] New message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Email provider error", detail },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
