import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, MessageSquarePlus, User } from "lucide-react";

import { BookmarkButton } from "@/features/topics/components/BookmarkButton";
import { ResourceList } from "@/features/topics/components/ResourceList";
import { getTaxonomy, getTopicBySlug } from "@/features/topics/server/queries";
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

  const [topic, taxonomy] = await Promise.all([
    getTopicBySlug(slug, user.id),
    getTaxonomy(),
  ]);

  if (!topic) notFound();
  if (topic.status !== "published") notFound();

  const { areas, types, subtypes } = taxonomy;

  const thumb =
    topic.cover_url ??
    (topic.youtube_id
      ? `https://i.ytimg.com/vi/${topic.youtube_id}/maxresdefault.jpg`
      : null);

  return (
    <div className="pb-20">
      {/* ── Back nav ─────────────────────────────────────────────────────────── */}
      <Link
        href="/topics"
        className="mb-6 inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" /> Library
      </Link>

      {/* ── Video player / hero ───────────────────────────────────────────────── */}
      <div className="-mx-4 mb-8 sm:-mx-6 lg:mx-0">
        {topic.youtube_id ? (
          <div className="aspect-video w-full overflow-hidden bg-black lg:rounded-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${topic.youtube_id}?rel=0&modestbranding=1&color=white`}
              title={topic.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : thumb ? (
          <div className="relative aspect-video w-full overflow-hidden bg-surface-subtle lg:rounded-2xl">
            <Image
              src={thumb}
              alt={topic.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
  
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-surface-subtle lg:rounded-2xl" />
        )}
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          {/* Header */}
          <header className="space-y-4">
            {/* Taxonomy pills */}
            {(topic.type || topic.subtypes.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {topic.type && (
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-accent">
                    {topic.type.name}
                  </span>
                )}
                {topic.subtypes.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-medium text-ink-muted ring-1 ring-inset ring-hairline"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title + bookmark */}
            <div className="flex items-start gap-4">
              <h1 className="flex-1 text-[clamp(1.25rem,3vw,1.875rem)] font-bold leading-tight tracking-tight text-ink">
                {topic.title}
              </h1>
              <BookmarkButton topicId={topic.id} initialSaved={topic.saved} />
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-ink-muted">
              {(topic.area || topic.subarea) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {[topic.subarea, topic.area?.name].filter(Boolean).join(" · ")}
                </span>
              )}
              {topic.educator.full_name && (
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" />
                  {topic.educator.full_name}
                </span>
              )}
            </div>
          </header>

          {/* Description */}
          {topic.description && (
            <section>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary">
                About this lesson
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
                {topic.description}
              </p>
            </section>
          )}

          {/* Resources */}
          {topic.resources.length > 0 && (
            <section>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary">
                Resources
              </h2>
              <ResourceList resources={topic.resources} />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Educator card */}
          {topic.educator.full_name && (
            <div className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-card">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary">
                Specialist
              </p>
              <div className="flex items-center gap-3">
                {topic.educator.avatar_url ? (
                  <Image
                    src={topic.educator.avatar_url}
                    alt={topic.educator.full_name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
        
                  />
                ) : (
                  <div className="grid size-11 place-items-center rounded-full bg-surface-subtle text-ink-tertiary">
                    <User className="size-5" />
                  </div>
                )}
                <div>
                  <p className="text-[15px] font-semibold text-ink">{topic.educator.full_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Inquiry CTA */}
          <div className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-card">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <MessageSquarePlus className="size-4" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Have a client for this?</h2>
                <p className="mt-0.5 text-[13px] text-ink-muted">
                  Post an inquiry and our team will follow up directly.
                </p>
              </div>
            </div>
            <InquiryForm
              areas={areas}
              types={types}
              subtypes={subtypes}
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
          </div>
        </aside>
      </div>
    </div>
  );
}
