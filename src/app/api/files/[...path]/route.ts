import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "lesson-resources";
const SIGNED_TTL_SECONDS = 120;

/**
 * Gate access to lesson-resource files. Returns a redirect to a short-lived
 * signed Storage URL when the requester is enrolled in the parent track,
 * the track's educator, or staff.
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

  // Resolve the resource → lesson → module → track → educator.
  const { data: resource } = await supabase
    .from("lesson_resources")
    .select(
      `id, storage_path, lesson_id,
       lesson:lessons!inner(
         id, module_id,
         module:modules!inner(
           id, track_id,
           track:tracks!inner(id, educator_id, status)
         )
       )`,
    )
    .eq("storage_path", storagePath)
    .maybeSingle();

  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const track = (resource as any).lesson?.module?.track;
  if (!track) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authorization: educator-owner or staff always allowed.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isStaff = profile?.role === "admin" || profile?.role === "content_manager";
  const isOwner = track.educator_id === user.id;

  let allowed = isStaff || isOwner;

  if (!allowed) {
    // Otherwise the requester must be enrolled in the parent track.
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("track_id", track.id)
      .in("status", ["active", "completed"])
      .maybeSingle();
    allowed = !!enrollment;
  }

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: signed, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_TTL_SECONDS);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Failed to sign" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
