import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, MessageSquarePlus, User } from "lucide-react";

import { BookmarkButton } from "@/features/topics/components/BookmarkButton";
import { ResourceList } from "@/features/topics/components/ResourceList";
import { getCoveredAreaIds, getTaxonomy, getTopicBySlug } from "@/features/topics/server/queries";
import { InquiryForm } from "@/features/inquiries/components/InquiryForm";
import { requireUser } from "@/lib/auth/guards";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  return { title: topic?.title ?? "Topic" };
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await requireUser();
  const topic = await getTopicBySlug(slug, user.id);
  if (!topic) notFound();
  if (topic.status !== "published" && topic.educator.id !== user.id) {
    notFound();
  }

  const [{ areas, types, subtypes }, coveredAreaIds] = await Promise.all([
    getTaxonomy(),
    getCoveredAreaIds(),
  ]);

  return (
    <div className="space-y-8">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to library
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {topic.type ? (
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
              {topic.type.name}
            </span>
          ) : null}
          {topic.subtypes.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 ring-1 ring-inset ring-zinc-100"
            >
              {s.name}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="display text-display-lg text-ink">{topic.title}</h1>
          <BookmarkButton topicId={topic.id} initialSaved={topic.saved} />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-muted">
          {topic.area || topic.subarea ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {[topic.subarea, topic.area?.name].filter(Boolean).join(" · ")}
            </span>
          ) : null}
          {topic.educator.full_name ? (
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {topic.educator.full_name}
            </span>
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
      ) : null}

      {topic.description ? (
        <section className="space-y-2">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            About
          </h2>
          <p className="whitespace-pre-line text-sm text-ink">{topic.description}</p>
        </section>
      ) : null}

      <ResourceList resources={topic.resources} />

      <section className="space-y-3 rounded-xl border border-hairline bg-surface-raised p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-accent/10 text-accent">
            <MessageSquarePlus className="size-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-ink">Got a client lead for this?</h2>
            <p className="text-sm text-ink-muted">
              Post an inquiry and it routes straight to the specialist for{" "}
              {topic.area?.name ?? "this area"}.
            </p>
          </div>
        </div>
        <InquiryForm
          areas={areas}
          types={types}
          subtypes={subtypes}
          coveredAreaIds={Array.from(coveredAreaIds)}
          lockTaxonomy
          prefill={{
            email: user.email,
            areaId: topic.area?.id ?? null,
            subarea: topic.subarea ?? null,
            typeId: topic.type?.id ?? null,
            subtypeIds: topic.subtypes.map((s) => s.id),
            sourceTopicId: topic.id,
          }}
        />
      </section>
    </div>
  );
}
