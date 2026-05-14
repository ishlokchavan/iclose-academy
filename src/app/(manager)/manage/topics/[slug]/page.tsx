import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink, MapPin, Pencil, User } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { LifecycleActions } from "@/features/topics/components/LifecycleActions";
import { ResourceList } from "@/features/topics/components/ResourceList";
import { StatusBadge } from "@/features/topics/components/StatusBadge";
import { getTopicBySlug } from "@/features/topics/server/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function ManageTopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/manage/topics"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Topics
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={topic.status} />
            {topic.type && (
              <span className="text-[12px] tracking-wide text-ink-muted">{topic.type.name}</span>
            )}
          </div>
          <h1 className="text-display-md font-bold tracking-tight text-ink">{topic.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {topic.educator.full_name ?? "—"}
            </span>
            {(topic.area || topic.subarea) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {[topic.subarea, topic.area?.name].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/manage/topics/${topic.slug}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-hairline bg-surface-raised px-5 text-[14px] font-medium text-ink hover:bg-surface-subtle transition-colors shadow-card"
          >
            <Pencil className="size-3.5" /> Edit
          </Link>
          {topic.status === "published" && (
            <Link
              href={`/topics/${topic.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-[14px] font-medium text-white hover:bg-accent-hover transition-colors shadow-[0_1px_3px_rgba(0,112,227,0.3)]"
            >
              <ExternalLink className="size-3.5" /> View live
            </Link>
          )}
        </div>
      </header>

      {topic.youtube_id ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${topic.youtube_id}?rel=0&modestbranding=1`}
            title={topic.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface-subtle/40 px-4 py-12 text-center text-[14px] text-ink-muted">
          No video attached yet. <Link href={`/manage/topics/${topic.slug}/edit`} className="text-accent underline">Add one</Link>.
        </div>
      )}

      {topic.description && (
        <section className="space-y-2">
          <h2 className="eyebrow">Description</h2>
          <p className="whitespace-pre-line text-[15px] text-ink">{topic.description}</p>
        </section>
      )}

      <ResourceList resources={topic.resources} />

      <section className="rounded-2xl border border-hairline bg-surface-raised p-6 shadow-card">
        <h2 className="mb-4 text-[15px] font-semibold text-ink">Lifecycle</h2>
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
