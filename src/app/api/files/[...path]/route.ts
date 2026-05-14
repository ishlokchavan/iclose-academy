import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "topic-resources";
const SIGNED_TTL_SECONDS = 120;

/**
 * Gated download for topic-resources Storage objects. Authenticated callers
 * who are educator-owner of the parent topic, staff, or simply anyone with
 * a valid session (since topics are now public after publish) get a signed
 * URL to fetch the file. We still verify the storage_path is referenced by
 * a real topic_resources row to prevent enumeration of arbitrary paths.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const storagePath = segments.join("/");
  if (!storagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Confirm the path corresponds to a real resource row tied to a published
  // (or owner-visible) topic. This blocks enumerating arbitrary storage paths.
  const { data: resource } = await supabase
    .from("topic_resources")
    .select(
      `id, storage_path, topic:topics!inner(id, status, educator_id)`,
    )
    .eq("storage_path", storagePath)
    .maybeSingle();
  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_TTL_SECONDS);
  if (error || !signed?.signedUrl) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to sign" },
      { status: 500 },
    );
  }
  return NextResponse.redirect(signed.signedUrl);
}
