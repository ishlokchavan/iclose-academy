import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { CoverImageUploader } from "@/features/topics/components/CoverImageUploader";
import { LifecycleActions } from "@/features/topics/components/LifecycleActions";
import { ResourceManager } from "@/features/topics/components/ResourceManager";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { TopicForm } from "@/features/topics/components/TopicForm";
import { getTaxonomy, getTopicBySlug } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function EditTopicPage({ params }: Props) {
  const { slug } = await params;
  const user = await requireUser();
  if (user.role === "learner") redirect("/topics");

  const topic = await getTopicBySlug(slug, user.id);
  if (!topic) notFound();

  const isStaff = user.role === "admin" || user.role === "content_manager";
  if (topic.educator.id !== user.id && !isStaff) notFound();

  const { areas, types, subtypes } = await getTaxonomy();

  return (
    <div className="space-y-8">
      <Link
        href="/educator"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to my topics
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <StatusBadge status={topic.status} />
            {topic.published_at ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                Published {new Date(topic.published_at).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          <h1 className="display text-display-lg text-ink">{topic.title}</h1>
        </div>
        {topic.status === "published" ? (
          <Link
            href={`/topics/${topic.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-hairline bg-surface-raised px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle"
          >
            <ExternalLink className="size-4" /> View live
          </Link>
        ) : null}
      </header>

      <PageHeader
        title="Edit topic"
        description="Update metadata, cover, video, and resources."
      />

      <TopicForm
        mode="update"
        topicId={topic.id}
        defaults={{
          title: topic.title,
          slug: topic.slug,
          description: topic.description,
          youtube_id: topic.youtube_id,
          area_id: topic.area?.id ?? null,
          subarea: topic.subarea,
          type_id: topic.type?.id ?? null,
          subtype_ids: topic.subtypes.map((s) => s.id),
        }}
        areas={areas}
        types={types}
        subtypes={subtypes}
      />

      <section className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-6">
        <h2 className="text-sm font-semibold text-ink">Cover image</h2>
        <p className="text-xs text-ink-muted">
          Shown on library cards. If empty, the YouTube thumbnail is used.
        </p>
        <CoverImageUploader
          topicId={topic.id}
          slug={topic.slug}
          userId={topic.educator.id}
          initialUrl={topic.cover_url}
        />
      </section>

      <section className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-6">
        <h2 className="text-sm font-semibold text-ink">Resources</h2>
        <p className="text-xs text-ink-muted">
          External links or files (PDFs, brochures) shown next to the video.
        </p>
        <ResourceManager
          topicId={topic.id}
          slug={topic.slug}
          userId={topic.educator.id}
          resources={topic.resources}
        />
      </section>

      <section className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-6">
        <h2 className="text-sm font-semibold text-ink">Lifecycle</h2>
        <p className="text-xs text-ink-muted">
          {topic.status === "draft" && "Drafts are hidden. Publish to make this discoverable."}
          {topic.status === "in_review" && "Pending staff review. You can still edit."}
          {topic.status === "published" && "Visible in the public library."}
          {topic.status === "archived" && "Hidden from the library."}
        </p>
        <LifecycleActions
          topicId={topic.id}
          slug={topic.slug}
          status={topic.status}
          hasVideo={!!topic.youtube_id}
        />
      </section>
    </div>
  );
}
