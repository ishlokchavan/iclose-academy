import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { normalizeCode } from "@/features/affiliates/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Origins allowed to call this endpoint from a browser. Server-to-server calls
// (e.g. iclose.ae's API proxying to ours) work regardless of CORS — these
// headers only matter when the browser is the originator.
const ALLOWED_ORIGINS = new Set([
  "https://iclose.ae",
  "https://www.iclose.ae",
]);

const payloadSchema = z.object({
  firstName:        z.string().trim().min(1).max(100),
  lastName:         z.string().trim().min(1).max(100),
  email:            z.string().trim().toLowerCase().email().max(254),
  phone:            z.string().trim().min(3).max(40),
  jobTitle:         z.string().trim().max(100).optional().nullable(),
  focus:            z.string().trim().max(100).optional().nullable(),
  dealTypes:        z.array(z.string()).optional().default([]),
  message:          z.string().trim().max(2000).optional().nullable(),
  consentPrivacy:   z.boolean().optional().default(false),
  consentMarketing: z.boolean().optional().default(false),
  // Honeypot — bots that fill every field will set this; humans never see it.
  website:          z.string().max(0).optional().nullable(),
  referredByCode:   z.string().trim().max(32).optional().nullable(),
});

function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  if (!ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin":  origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary":                         "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400, headers });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400, headers },
    );
  }

  // Honeypot — silently pretend success so bots don't iterate
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true, referralCode: null }, { headers });
  }

  const d = parsed.data;
  const fullName = [d.firstName, d.lastName].filter(Boolean).join(" ").trim();
  const referredByCode = normalizeCode(d.referredByCode ?? null);
  const userAgent = req.headers.get("user-agent");
  const referer   = req.headers.get("referer");

  const admin = createSupabaseAdminClient();

  // Idempotent: if a lead already exists for this email, return its existing
  // referral_code. This makes form re-submits and accidental double-clicks
  // safe without exposing constraint-violation errors.
  const { data: existing } = await admin
    .from("leads")
    .select("id, referral_code")
    .ilike("email", d.email)
    .limit(1);

  if (existing && existing.length > 0 && existing[0]) {
    return NextResponse.json(
      { ok: true, referralCode: existing[0].referral_code, duplicate: true },
      { headers },
    );
  }

  const { data: inserted, error } = await admin
    .from("leads")
    .insert({
      email:             d.email,
      name:              fullName,
      phone:             d.phone,
      first_name:        d.firstName,
      last_name:         d.lastName,
      source:            "landing_page",
      consent_marketing: d.consentMarketing,
      consented_at:      d.consentPrivacy ? new Date().toISOString() : null,
      referred_by_code:  referredByCode,
      user_agent:        userAgent,
      referer:           referer,
    })
    .select("referral_code")
    .single();

  if (error) {
    // Unique violation on phone — different account already uses it
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: false, error: "This phone number is already registered." },
        { status: 409, headers },
      );
    }
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500, headers },
    );
  }

  return NextResponse.json(
    { ok: true, referralCode: inserted?.referral_code ?? null },
    { headers },
  );
}
