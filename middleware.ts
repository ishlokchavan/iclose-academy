import { NextResponse, type NextRequest } from "next/server";

import {
  REF_COOKIE,
  REF_COOKIE_MAX_AGE,
  REF_QUERY_PARAM,
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
  normalizeCode,
} from "@/features/members/constants";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/sign-in", "/sign-up", "/verify"];
const PROTECTED_PREFIXES = ["/dashboard", "/tracks", "/progress", "/saved", "/profile", "/staff"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);
  const { pathname, searchParams, origin } = request.nextUrl;

  // ── Referral attribution ──────────────────────────────────────────────────
  // Capture ?ref=CODE (or the ?partner=CODE alias) on any request, drop it into
  // a cookie, and asynchronously record the click. We do this before redirects
  // so the cookie sticks even if the request is bounced to /sign-in or /dashboard.
  const rawRef = searchParams.get(REF_QUERY_PARAM) ?? searchParams.get("partner");
  const refCode = normalizeCode(rawRef);
  if (refCode) {
    response.cookies.set(REF_COOKIE, refCode, {
      maxAge: REF_COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      response.cookies.set(VISITOR_COOKIE, visitorId, {
        maxAge: VISITOR_COOKIE_MAX_AGE,
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });
    }

    // Fire-and-forget click record. Don't await — middleware must stay fast.
    fetch(`${origin}/api/affiliate/click`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": request.headers.get("user-agent") ?? "",
        "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
        "x-vercel-ip-country": request.headers.get("x-vercel-ip-country") ?? "",
        cookie: `${VISITOR_COOKIE}=${visitorId}`,
      },
      body: JSON.stringify({
        code: refCode,
        visitorId,
        landingPath: pathname,
      }),
    }).catch(() => {
      // Click tracking failures must not break navigation.
    });
  }

  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    // Preserve cookies set above
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   - _next/static, _next/image
     *   - favicon, robots, sitemap
     *   - public assets (svg, png, jpg, jpeg, gif, webp, ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
