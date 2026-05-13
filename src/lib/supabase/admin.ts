import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/db";

/**
 * Service-role client that bypasses RLS. Use only for:
 *   - admin scripts (seeders, backfills)
 *   - webhook handlers (Stripe, email events)
 *   - cron jobs
 *
 * NEVER import from /app or any code that runs in a Server Component or
 * Server Action triggered by an unauthenticated request.
 */
export function createSupabaseAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
