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
  return { title: `Review · ${slug}` };
}

export default async function StaffTopicReviewPage({ params }: Props) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/staff/topics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to topics
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={topic.status} />
            {topic.type ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                {topic.type.name}
              </span>
            ) : null}
          </div>
          <h1 className="display text-display-lg text-ink">{topic.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {topic.educator.full_name ?? "Unknown educator"}
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
            href={`/educator/topics/${topic.slug}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-hairline bg-surface-raised px-4 text-sm font-medium text-ink hover:bg-surface-subtle transition-colors"
          >
            <Pencil className="size-4" /> Open editor
          </Link>
          {topic.status === "published" ? (
            <Link
              href={`/topics/${topic.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              <ExternalLink className="size-4" /> View live
            </Link>
          ) : null}
        </div>
      </header>

      {topic.youtube_id ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${topic.youtube_id}?rel=0&modestbranding=1`}
            title={topic.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-hairline bg-surface-subtle/40 px-4 py-12 text-center text-sm text-ink-muted">
          No video attached yet.
        </div>
      )}

      {topic.description ? (
        <section className="space-y-2">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Description
          </h2>
          <p className="whitespace-pre-line text-sm text-ink">{topic.description}</p>
        </section>
      ) : null}

      <ResourceList resources={topic.resources} />

      <PageHeader title="Moderation" />
      <section className="rounded-lg border border-hairline bg-surface-raised p-6">
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
