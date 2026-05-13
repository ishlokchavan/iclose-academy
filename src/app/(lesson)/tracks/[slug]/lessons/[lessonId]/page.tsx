import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { LessonInteractive } from "@/features/lessons/components/LessonInteractive";
import { ModuleRail } from "@/features/lessons/components/ModuleRail";
import { getLessonContext } from "@/features/lessons/server/queries";
import { CommandPalette } from "@/features/search/components/CommandPalette";
import { SearchBar } from "@/features/search/components/SearchTrigger";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string; lessonId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const user = await getSessionUser();
  if (!user) return {};
  const ctx = await getLessonContext({ lessonId, userId: user.id });
  return { title: ctx?.lesson.title ?? "Lesson" };
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");

  const ctx = await getLessonContext({ lessonId, userId: user.id });
  if (!ctx) notFound();

  const enrolled =
    ctx.enrollment?.status === "active" ||
    ctx.enrollment?.status === "completed";

  // Only enrolled users OR preview lessons can be viewed
  if (!enrolled && !ctx.lesson.is_preview) {
    redirect(`/tracks/${slug}`);
  }

  // Fetch completed lesson IDs for this track
  const supabase = await createSupabaseServerClient();
  const allLessonIds = ctx.moduleRail.flatMap((item) =>
    item.lessons.map((l) => l.id),
  );
  const completedProgressRes = allLessonIds.length > 0
    ? await supabase
        .from("progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .in("lesson_id", allLessonIds)
    : null;
  const completedProgress = completedProgressRes?.data;

  const completedLessonIds = new Set(
    (completedProgress ?? []).map((p) => p.lesson_id),
  );
  const isCompleted = !!ctx.progress?.completed_at;
  const startSeconds = ctx.progress?.position_seconds ?? 0;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Minimal lesson header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-white px-4">
        <Link
          href={`/tracks/${slug}`}
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-ink transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{ctx.track.title}</span>
        </Link>

        <div className="mx-2 h-4 w-px bg-hairline" />

        <h1 className="flex-1 truncate text-sm font-semibold text-ink">
          {ctx.lesson.title}
        </h1>

        {/* Search trigger */}
        <SearchBar className="hidden sm:flex items-center gap-2 rounded-lg border border-hairline bg-zinc-50 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-100 transition-colors" />
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Module rail — hidden on mobile */}
        <aside className="hidden w-72 shrink-0 flex-col border-r border-hairline lg:flex overflow-hidden">
          <ModuleRail
            moduleRail={ctx.moduleRail}
            currentLessonId={lessonId}
            trackSlug={slug}
            enrolled={enrolled}
            completedLessonIds={completedLessonIds}
          />
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <LessonInteractive
              lesson={ctx.lesson}
              trackSlug={slug}
              completed={isCompleted}
              enrolled={enrolled}
              startSeconds={startSeconds}
            />
          </div>
        </div>
      </div>

      {/* Mobile: module navigation at bottom */}
      <div className="flex border-t border-hairline bg-white px-4 py-3 lg:hidden">
        <Link
          href={`/tracks/${slug}`}
          className="text-sm font-medium text-zinc-500 hover:text-ink transition-colors"
        >
          Track contents →
        </Link>
      </div>

      <CommandPalette />
    </div>
  );
}
