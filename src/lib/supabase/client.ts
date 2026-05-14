"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/db";

let browserClient: SupabaseClient<Database> | undefined;

/**
 * Supabase client for Client Components. Singleton — never recreate per render.
 */
export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as unknown as SupabaseClient<Database>;
  }
  return browserClient;
}
