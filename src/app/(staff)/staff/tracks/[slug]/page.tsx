import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ChevronLeft, Clock, ExternalLink, Pencil, User } from "lucide-react";

import { StatusBadge } from "@/features/educator/components/StatusBadge";
import { ApprovalActions } from "@/features/staff/components/ApprovalActions";
import { getStaffTrackBySlug } from "@/features/staff/server/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Review · ${slug}` };
}

export default async function StaffTrackReviewPage({ params }: Props) {
  const { slug } = await params;
  const track = await getStaffTrackBySlug(slug);
  if (!track) notFound();

  const lessonCount = track.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const lessonsWithVideo = track.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => !!l.youtube_id).length,
    0,
  );

  return (
    <div className="space-y-8">
      <Link
        href="/staff/tracks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to tracks
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={track.status} />
            {track.specialty ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                {track.specialty.name}
              </span>
            ) : null}
            {track.level ? (
              <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
                · {track.level.name}
              </span>
            ) : null}
          </div>
          <h1 className="display text-display-lg text-ink">{track.title}</h1>
          {track.subtitle ? (
            <p className="max-w-prose text-base text-ink-muted">{track.subtitle}</p>
          ) : null}
          <p className="flex items-center gap-1.5 pt-1 text-sm text-ink-muted">
            <User className="size-3.5" />
            {track.educator.full_name ?? "Unknown educator"}
          </p>
        </div>
        {track.status === "published" ? (
          <Link
            href={`/tracks/${track.slug}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-hairline bg-surface-raised px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle"
          >
            <ExternalLink className="size-4" /> View as learner
          </Link>
        ) : null}
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
          hint="Set by educator"
        />
        <Stat
          icon={<BookOpen className="size-4" />}
          label="Videos attached"
          value={`${lessonsWithVideo} / ${lessonCount}`}
          hint={lessonsWithVideo < lessonCount ? "Some lessons have no video" : "All lessons have videos"}
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

      {track.description ? (
        <section className="space-y-2">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Description
          </h2>
          <p className="whitespace-pre-line text-sm text-ink">{track.description}</p>
        </section>
      ) : null}

      {track.outcomes.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
            Outcomes
          </h2>
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {track.outcomes.map((o, i) => (
              <li key={i} className="text-sm text-ink">• {o}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-eyebrow font-mono uppercase tracking-widest text-ink-muted">
          Curriculum
        </h2>
        {track.modules.length === 0 ? (
          <p className="text-sm italic text-ink-muted">No modules yet.</p>
        ) : (
          <div className="space-y-3">
            {track.modules.map((m, i) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-lg border border-hairline bg-surface-raised"
              >
                <header className="flex items-baseline gap-3 border-b border-hairline bg-surface-subtle/50 px-4 py-3">
                  <span className="font-mono text-[11px] text-ink-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{m.title}</h3>
                    {m.summary ? (
                      <p className="text-xs text-ink-muted">{m.summary}</p>
                    ) : null}
                  </div>
                </header>
                <ul className="divide-y divide-hairline">
                  {m.lessons.map((l, lI) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="font-mono text-[11px] text-ink-muted">
                        {String(lI + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 truncate text-sm text-ink">{l.title}</span>
                      {l.is_preview ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          Preview
                        </span>
                      ) : null}
                      {!l.youtube_id ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          No video
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-hairline bg-surface-raised p-6">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-ink">Moderation</h2>
          <p className="text-xs text-ink-muted">
            {track.status === "in_review" && "Submitted by the educator. Approve to publish, or send back to draft if it needs work."}
            {track.status === "published" && "Live in the public library. You can unpublish to take it down."}
            {track.status === "draft" && "Educator hasn't submitted this for review yet."}
            {track.status === "archived" && "Hidden from the library."}
          </p>
        </div>
        <ApprovalActions
          trackId={track.id}
          trackSlug={track.slug}
          status={track.status}
          hasLessons={lessonCount > 0}
        />
        <div className="pt-2">
          <Link
            href={`/educator/tracks/${track.slug}/curriculum`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <Pencil className="size-3.5" />
            Open in curriculum editor
          </Link>
        </div>
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
