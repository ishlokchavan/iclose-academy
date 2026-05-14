import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type AppRole = Database["public"]["Enums"]["app_role"];

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type SessionUser = {
  id: string;
  email: string | null;
  role: AppRole;
  fullName: string | null;
  avatarUrl: string | null;
};

/**
 * Cached per-request fetch of the current user + their profile.
 * Returns null if not authenticated.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  // Cast: postgrest 2.105 + our hand-pasted Database type don't fully
  // narrow the inferred row; the schema is correct at runtime.
  const profile = profileData as ProfileRow | null;

  if (!profile) {
    // Profile not yet created (race with handle_new_user trigger) — fall back to learner.
    return {
      id: user.id,
      email: user.email ?? null,
      role: "learner",
      fullName: null,
      avatarUrl: null,
    };
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
  };
});
