"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createFileResourceSchema,
  createLinkResourceSchema,
  createTopicSchema,
  updateTopicSchema,
} from "@/features/topics/schemas";

export type TopicActionState =
  | { error: string; fieldErrors?: Record<string, string> }
  | { success: true; slug: string }
  | null;

export type ActionResult = { error?: string };

function assertCanAuthor(role: string) {
  if (role !== "educator" && role !== "content_manager" && role !== "admin") {
    throw new Error("Only educators and staff can author topics");
  }
}

function revalidate(slug?: string) {
  revalidatePath("/topics");
  revalidatePath("/educator");
  if (slug) {
    revalidatePath(`/topics/${slug}`);
    revalidatePath(`/educator/topics/${slug}`);
    revalidatePath(`/staff/topics/${slug}`);
  }
}

// ----------------------------------------------------------------------------
// Create
// ----------------------------------------------------------------------------
export async function createTopicAction(
  _prev: TopicActionState,
  formData: FormData,
): Promise<TopicActionState> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = createTopicSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    youtube_id: formData.get("youtube_id"),
    area_id: formData.get("area_id"),
    subarea: formData.get("subarea"),
    type_id: formData.get("type_id"),
    subtype_ids: formData.getAll("subtype_ids"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: inserted, error } = await supabase
    .from("topics")
    .insert({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      youtube_id: parsed.data.youtube_id,
      area_id: parsed.data.area_id,
      subarea: parsed.data.subarea,
      type_id: parsed.data.type_id,
      educator_id: user.id,
    })
    .select("id, slug")
    .single();

  if (error || !inserted) {
    if (error?.code === "23505") return { error: "That slug is already taken." };
    return { error: error?.message ?? "Failed to create topic" };
  }

  if (parsed.data.subtype_ids.length > 0) {
    await supabase.from("topic_subtypes").insert(
      parsed.data.subtype_ids.map((sid) => ({
        topic_id: inserted.id,
        subtype_id: sid,
      })),
    );
  }

  revalidate(inserted.slug);
  redirect(`/educator/topics/${inserted.slug}/edit`);
}

// ----------------------------------------------------------------------------
// Update
// ----------------------------------------------------------------------------
export async function updateTopicAction(
  topicId: string,
  _prev: TopicActionState,
  formData: FormData,
): Promise<TopicActionState> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const parsed = updateTopicSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    youtube_id: formData.get("youtube_id"),
    area_id: formData.get("area_id"),
    subarea: formData.get("subarea"),
    type_id: formData.get("type_id"),
    subtype_ids: formData.getAll("subtype_ids"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("topics")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      youtube_id: parsed.data.youtube_id,
      area_id: parsed.data.area_id,
      subarea: parsed.data.subarea,
      type_id: parsed.data.type_id,
    })
    .eq("id", topicId);

  if (error) {
    if (error.code === "23505") return { error: "That slug is already taken." };
    return { error: error.message };
  }

  // Replace subtypes wholesale (simpler than diff).
  await supabase.from("topic_subtypes").delete().eq("topic_id", topicId);
  if (parsed.data.subtype_ids.length > 0) {
    await supabase.from("topic_subtypes").insert(
      parsed.data.subtype_ids.map((sid) => ({
        topic_id: topicId,
        subtype_id: sid,
      })),
    );
  }

  revalidate(parsed.data.slug);
  return { success: true, slug: parsed.data.slug };
}

// ----------------------------------------------------------------------------
// Lifecycle
// ----------------------------------------------------------------------------
export async function submitTopicForReviewAction(
  topicId: string,
  slug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("topics")
    .update({ status: "in_review" })
    .eq("id", topicId)
    .eq("status", "draft");
  if (error) return { error: error.message };

  revalidate(slug);
  return {};
}

export async function publishTopicAction(
  topicId: string,
  slug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  // Educators may self-publish in this MVP (no staff approval gate).
  // Staff can also publish anyone's topic.
  assertCanAuthor(user.role);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("topics")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      archived_at: null,
    })
    .eq("id", topicId);
  if (error) return { error: error.message };

  revalidate(slug);
  return {};
}

export async function unpublishTopicAction(
  topicId: string,
  slug: string,
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("topics")
    .update({ status: "draft", published_at: null })
    .eq("id", topicId);
  if (error) return { error: error.message };
  revalidate(slug);
  return {};
}

export async function archiveTopicAction(
  topicId: string,
  slug: string,
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("topics")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", topicId);
  if (error) return { error: error.message };
  revalidate(slug);
  return {};
}

export async function deleteTopicAction(
  topicId: string,
  slug: string,
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("topics").delete().eq("id", topicId);
  if (error) return { error: error.message };
  revalidate(slug);
  redirect("/educator");
}

// ----------------------------------------------------------------------------
// Cover image
// ----------------------------------------------------------------------------
export async function updateTopicCoverAction(
  topicId: string,
  slug: string,
  coverUrl: string | null,
): Promise<ActionResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("topics")
    .update({ cover_url: coverUrl })
    .eq("id", topicId);
  if (error) return { error: error.message };
  revalidate(slug);
  return {};
}

// ----------------------------------------------------------------------------
// Save / unsave (learner bookmark)
// ----------------------------------------------------------------------------
export async function saveTopicAction(
  topicId: string,
  saved: boolean,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  if (saved) {
    await supabase
      .from("saved_items")
      .insert({ user_id: user.id, entity_type: "topic", entity_id: topicId });
  } else {
    await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("entity_type", "topic")
      .eq("entity_id", topicId);
  }
  revalidatePath("/topics");
  revalidatePath("/saved");
  return {};
}

// ----------------------------------------------------------------------------
// Resources
// ----------------------------------------------------------------------------
async function nextResourceSortOrder(topicId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("topic_resources")
    .select("sort_order")
    .eq("topic_id", topicId)
    .order("sort_order", { ascending: false })
    .limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;
}

export async function createLinkResourceAction(
  topicId: string,
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);
  const parsed = createLinkResourceSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const sort_order = await nextResourceSortOrder(topicId);
  const { error } = await supabase.from("topic_resources").insert({
    topic_id: topicId,
    label: parsed.data.label,
    url: parsed.data.url,
    kind: "link",
    sort_order,
  });
  if (error) return { error: error.message };
  revalidate(slug);
  return {};
}

export async function createFileResourceAction(
  topicId: string,
  slug: string,
  payload: { label: string; storage_path: string },
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);
  const parsed = createFileResourceSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createSupabaseServerClient();
  const sort_order = await nextResourceSortOrder(topicId);
  const { error } = await supabase.from("topic_resources").insert({
    topic_id: topicId,
    label: parsed.data.label,
    storage_path: parsed.data.storage_path,
    kind: "file",
    sort_order,
  });
  if (error) return { error: error.message };
  revalidate(slug);
  return {};
}

export async function deleteResourceAction(
  resourceId: string,
  slug: string,
): Promise<ActionResult> {
  const user = await requireUser();
  assertCanAuthor(user.role);
  const supabase = await createSupabaseServerClient();

  const { data: row } = await supabase
    .from("topic_resources")
    .select("storage_path")
    .eq("id", resourceId)
    .maybeSingle();
  if (row?.storage_path) {
    await supabase.storage.from("topic-resources").remove([row.storage_path]);
  }
  const { error } = await supabase.from("topic_resources").delete().eq("id", resourceId);
  if (error) return { error: error.message };
  revalidate(slug);
  return {};
}
