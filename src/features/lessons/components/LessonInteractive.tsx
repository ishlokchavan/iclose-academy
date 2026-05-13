"use client";

import { useRef } from "react";

import { ChapterList } from "./ChapterList";
import { LessonPlayer } from "./LessonPlayer";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { ResourceList } from "./ResourceList";
import type { Chapter, LessonResourceRow, LessonRow } from "@/features/tracks/types";

type Props = {
  lesson: LessonRow & { resources: LessonResourceRow[] };
  trackSlug: string;
  completed: boolean;
  enrolled: boolean;
  startSeconds?: number;
};

export function LessonInteractive({
  lesson,
  trackSlug,
  completed,
  enrolled,
  startSeconds = 0,
}: Props) {
  const seekRef = useRef<((seconds: number) => void) | null>(null);

  const chapters = Array.isArray(lesson.chapters)
    ? (lesson.chapters as unknown as Chapter[])
    : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Video player */}
      {lesson.youtube_id && (
        <LessonPlayer
          youtubeId={lesson.youtube_id}
          lessonId={lesson.id}
          startSeconds={startSeconds}
          onSeekRef={seekRef}
        />
      )}

      {/* Lesson header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
            {lesson.title}
          </h1>
          {lesson.summary && (
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              {lesson.summary}
            </p>
          )}
        </div>
        {enrolled && (
          <div className="shrink-0">
            <MarkCompleteButton
              lessonId={lesson.id}
              trackSlug={trackSlug}
              completed={completed}
            />
          </div>
        )}
      </div>

      {/* Chapters */}
      {chapters.length > 0 && (
        <ChapterList chapters={chapters} onSeekRef={seekRef} />
      )}

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <ResourceList resources={lesson.resources} />
      )}
    </div>
  );
}
