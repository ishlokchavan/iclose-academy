import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";

import { LifecycleActions } from "@/features/topics/components/LifecycleActions";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { TopicForm } from "@/features/topics/components/TopicForm";
import { getEducatorList } from "@/features/educators/server/queries";
import { getTaxonomy, getTopicBySlug } from "@/features/topics/server/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  return { title: topic ? `${topic.title} · Edit` : "Edit topic" };
}

export default async function EditTopicPage({ params }: Props) {
  const { slug } = await params;
  const [topic, taxonomy, educators] = await Promise.all([
    getTopicBySlug(slug),
    getTaxonomy(),
    getEducatorList(),
  ]);
  if (!topic) notFound();

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/manage/topics"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Topics
      </Link>

      {/* Header: title + status + actions */}
      <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <StatusBadge status={topic.status} />
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-ink">
            {topic.title}
          </h1>
          {topic.status === "published" && (
            <Link
              href={`/topics/${topic.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="size-3" /> View live
            </Link>
          )}
        </div>
        <div className="shrink-0">
          <LifecycleActions
            topicId={topic.id}
            slug={topic.slug}
            status={topic.status}
            hasVideo={!!topic.youtube_id}
          />
        </div>
      </div>

      {/* Edit form */}
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
          educator_record_id: topic.educator.id || null,
        }}
        areas={taxonomy.areas}
        types={taxonomy.types}
        subtypes={taxonomy.subtypes}
        educators={educators}
        backHref="/manage/topics"
      />
    </div>
  );
}
