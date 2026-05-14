import { NextResponse, type NextRequest } from "next/server";

import { ROLE_LANDING } from "@/config/nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

/**
 * Supabase email-link callback (magic link / email confirmation, OAuth, etc.).
 * Exchanges the code in the URL for a session, then redirects to either the
 * caller-specified `next` (if a safe relative path) or the role's home.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=callback`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=callback`);
  }

  let dest = "/topics";
  if (requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//")) {
    dest = requestedNext;
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role = (profile?.role ?? "learner") as Database["public"]["Enums"]["app_role"];
      dest = ROLE_LANDING[role];
    }
  }

  return NextResponse.redirect(`${origin}${dest}`);
}
