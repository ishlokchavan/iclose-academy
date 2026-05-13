import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, BookOpen, User } from "lucide-react";

import { EnrollButton } from "@/features/tracks/components/EnrollButton";
import { ModuleOutline } from "@/features/tracks/components/ModuleOutline";
import { getTrackWithContent } from "@/features/tracks/server/queries";
import { getSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrackWithContent({ slug });
  return { title: track?.title ?? "Track not found" };
}

function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const SPECIALTY_STYLES: Record<string, string> = {
  community: "bg-blue-50 text-blue-700",
  building: "bg-orange-50 text-orange-700",
  luxury: "bg-amber-50 text-amber-700",
  "off-plan": "bg-purple-50 text-purple-700",
  leasing: "bg-emerald-50 text-emerald-700",
};

export default async function TrackDetailPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSessionUser();

  const track = await getTrackWithContent({ slug, userId: user?.id });
  if (!track) notFound();

  const enrolled =
    track.enrollment?.status === "active" ||
    track.enrollment?.status === "completed";

  const firstLesson = track.modules[0]?.lessons[0];
  const specialtyStyle = track.specialty?.slug
    ? (SPECIALTY_STYLES[track.specialty.slug] ?? "bg-zinc-100 text-zinc-600")
    : "bg-zinc-100 text-zinc-600";

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-400">
        <Link href="/tracks" className="hover:text-ink transition-colors">
          Track Library
        </Link>
        <span className="mx-2">·</span>
        <span className="text-zinc-600">{track.title}</span>
      </nav>

      {/* Hero */}
      <div className="space-y-6">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {track.specialty && (
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
                specialtyStyle,
              )}
            >
              {track.specialty.name}
            </span>
          )}
          {track.level && (
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {track.level.name}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {track.title}
          </h1>
          {track.subtitle && (
            <p className="mt-2 text-xl text-zinc-500">{track.subtitle}</p>
          )}
        </div>

        {/* Summary */}
        {track.summary && (
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600">
            {track.summary}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
          {track.educator?.full_name && (
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {track.educator.full_name}
            </span>
          )}
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {track.lessonCount}{" "}
            {track.lessonCount === 1 ? "lesson" : "lessons"}
          </span>
          {track.duration_minutes && (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatDuration(track.duration_minutes)}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {enrolled && firstLesson ? (
            <Link
              href={`/tracks/${slug}/lessons/${firstLesson.id}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-all hover:bg-accent/90 hover:shadow-md"
            >
              Continue Learning →
            </Link>
          ) : (
            <EnrollButton trackId={track.id} enrolled={enrolled} />
          )}
        </div>
      </div>

      {/* What you'll learn */}
      {track.outcomes.length > 0 && (
        <div className="rounded-xl border border-hairline bg-zinc-50/50 p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            What you&apos;ll learn
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {track.outcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm text-zinc-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Description */}
      {track.description && (
        <div className="max-w-2xl">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            About this track
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">{track.description}</p>
        </div>
      )}

      {/* Module outline */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Track contents
          </h2>
          <span className="text-sm text-zinc-400">
            {track.modules.length} modules · {track.lessonCount} lessons
          </span>
        </div>
        <ModuleOutline
          modules={track.modules}
          trackSlug={slug}
          enrolled={enrolled}
        />
      </div>
    </div>
  );
}
