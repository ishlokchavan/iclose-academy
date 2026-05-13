import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronLeft, Clock, Pencil, Sparkles } from "lucide-react";

import { CoverImageUploader } from "@/features/educator/components/CoverImageUploader";
import { LifecycleActions } from "@/features/educator/components/LifecycleActions";
import { StatusBadge } from "@/features/educator/components/StatusBadge";
import { getEducatorTrackBySlug } from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} · Track` };
}

export default async function EducatorTrackOverviewPage({ params }: Props) {
  const { slug } = await params;
  const user = await requireUser();
  const isStaff = user.role === "admin" || user.role === "content_manager";
  const track = await getEducatorTrackBySlug(slug, user.id, isStaff);
  if (!track) notFound();

  const lessonCount = track.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="space-y-8">
      <Link
        href="/educator/tracks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to tracks
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={track.status} />
            {track.published_at ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                Published {new Date(track.published_at).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          <h1 className="display text-display-lg text-ink">{track.title}</h1>
          {track.subtitle ? (
            <p className="max-w-prose text-base text-ink-muted">{track.subtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Link
            href={`/educator/tracks/${track.slug}/edit`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-hairline bg-surface-raised px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle"
          >
            <Pencil className="size-4" /> Edit details
          </Link>
          <Link
            href={`/educator/tracks/${track.slug}/curriculum`}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Manage curriculum →
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          icon={<BookOpen className="size-4" />}
          label="Lessons"
          value={`${lessonCount}`}
          hint={`${track.modules.length} ${track.modules.length === 1 ? "module" : "modules"}`}
        />
        <Stat
          icon={<Clock className="size-4" />}
          label="Estimated duration"
          value={track.duration_minutes ? `${track.duration_minutes} min` : "—"}
          hint="Set on the edit page"
        />
        <Stat
          icon={<Sparkles className="size-4" />}
          label="Outcomes"
          value={`${track.outcomes.length}`}
          hint="Items shown to learners"
        />
      </section>

      {track.summary ? (
        <section className="space-y-2">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Summary
          </h2>
          <p className="text-sm text-ink">{track.summary}</p>
        </section>
      ) : null}

      <section className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-6">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-ink">Cover image</h2>
          <p className="text-xs text-ink-muted">
            Shown on the library card and track hero. Aim for a 16:9 crop.
          </p>
        </div>
        <CoverImageUploader
          trackId={track.id}
          userId={track.educator_id}
          initialUrl={track.cover_url}
        />
      </section>

      <section className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-6">
        <h2 className="text-sm font-semibold text-ink">Lifecycle</h2>
        <p className="text-xs text-ink-muted">
          {track.status === "draft" && "Tracks start as drafts. Submit for review when ready."}
          {track.status === "in_review" && "Awaiting staff approval. You can still edit."}
          {track.status === "published" && "Visible in the public library."}
          {track.status === "archived" && "Hidden from the library."}
        </p>
        <LifecycleActions
          trackId={track.id}
          status={track.status}
          hasLessons={lessonCount > 0}
        />
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-raised p-4">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-ink">{value}</div>
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
