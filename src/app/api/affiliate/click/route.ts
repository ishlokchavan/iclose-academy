import { NextResponse, type NextRequest } from "next/server";

import { recordReferralClick } from "@/features/members/server/track";
import {
  REF_COOKIE,
  REF_COOKIE_MAX_AGE,
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
  normalizeCode,
} from "@/features/members/constants";

export const runtime = "nodejs";

function getIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

/**
 * Records a referral click. Called from middleware via a fire-and-forget fetch.
 * Body: { code, visitorId?, landingPath? }
 */
export async function POST(req: NextRequest) {
  let payload: { code?: string; visitorId?: string; landingPath?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const code = normalizeCode(payload.code);
  if (!code) return NextResponse.json({ ok: false }, { status: 400 });

  await recordReferralClick({
    code,
    visitorId: payload.visitorId ?? req.cookies.get(VISITOR_COOKIE)?.value ?? null,
    ip: getIp(req),
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    landingPath: payload.landingPath ?? null,
    country: req.headers.get("x-vercel-ip-country") ?? null,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(REF_COOKIE, code, {
    maxAge: REF_COOKIE_MAX_AGE,
    httpOnly: false, // readable by client form so it can attach attribution
    sameSite: "lax",
    path: "/",
  });
  if (!req.cookies.get(VISITOR_COOKIE)?.value) {
    const vid = payload.visitorId ?? crypto.randomUUID();
    res.cookies.set(VISITOR_COOKIE, vid, {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
