import { NextResponse, type NextRequest } from "next/server";

import { normalizeCode, REF_QUERY_PARAM } from "@/features/members/constants";

export const runtime = "nodejs";

/**
 * Canonical referral entry point: /ref/CODE → redirects to the landing page
 * with ?ref=CODE. The middleware then sets the attribution cookie and records
 * the click, so any link pointing at this app's domain attributes correctly
 * regardless of how the marketing site handles its own /ref path.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const normalized = normalizeCode(code);

  const url = new URL("/", req.url);
  if (normalized) url.searchParams.set(REF_QUERY_PARAM, normalized);

  return NextResponse.redirect(url);
}
