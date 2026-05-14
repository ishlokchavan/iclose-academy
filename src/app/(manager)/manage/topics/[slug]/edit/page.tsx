import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { TopicForm } from "@/features/topics/components/TopicForm";
import { getEducatorList } from "@/features/educators/server/queries";
import { getTaxonomy, getTopicBySlug } from "@/features/topics/server/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
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
    <div className="space-y-8">
      <Link
        href={`/manage/topics/${slug}`}
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> {topic.title}
      </Link>
      <PageHeader eyebrow="Content" title="Edit topic" />
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
        backHref={`/manage/topics/${slug}`}
      />
    </div>
  );
}
