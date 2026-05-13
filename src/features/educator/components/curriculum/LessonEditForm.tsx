"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { ChapterEditor } from "@/features/educator/components/curriculum/ChapterEditor";
import { ResourceManager } from "@/features/educator/components/curriculum/ResourceManager";
import { updateLessonAction } from "@/features/educator/server/curriculum-actions";
import type { Chapter } from "@/features/educator/schemas/curriculum";

type LessonInput = {
  id: string;
  title: string;
  summary: string | null;
  youtube_id: string | null;
  duration_seconds: number | null;
  is_preview: boolean;
};

type ResourceRow = {
  id: string;
  label: string;
  url: string | null;
  storage_path: string | null;
  kind: string;
};

export function LessonEditForm({
  lesson,
  trackSlug,
  educatorUserId,
  initialChapters,
  resources,
  onDone,
}: {
  lesson: LessonInput;
  trackSlug: string;
  educatorUserId: string;
  initialChapters: Chapter[];
  resources: ResourceRow[];
  onDone: () => void;
}) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("chapters", JSON.stringify(chapters));
    startTransition(async () => {
      const res = await updateLessonAction(lesson.id, trackSlug, formData);
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-md border border-hairline bg-surface-raised p-4">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="lesson-title">Lesson title</Label>
          <Input
            id="lesson-title"
            name="title"
            defaultValue={lesson.title}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lesson-duration">Duration (seconds)</Label>
          <Input
            id="lesson-duration"
            name="duration_seconds"
            type="number"
            min={0}
            defaultValue={lesson.duration_seconds ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lesson-summary">Summary</Label>
        <textarea
          id="lesson-summary"
          name="summary"
          rows={2}
          defaultValue={lesson.summary ?? ""}
          className="flex w-full rounded-md border border-hairline bg-surface-raised px-3.5 py-2 text-sm text-ink focus:outline-none focus:border-accent focus:shadow-focus"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="lesson-youtube">YouTube video ID</Label>
          <Input
            id="lesson-youtube"
            name="youtube_id"
            defaultValue={lesson.youtube_id ?? ""}
            placeholder="dQw4w9WgXcQ"
          />
          <p className="text-xs text-ink-muted">
            The 11-character ID from a youtu.be/... or watch?v=... URL.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lesson-preview">Preview lesson</Label>
          <label className="flex h-11 items-center gap-2 rounded-md border border-hairline bg-surface-raised px-3.5 text-sm">
            <input
              id="lesson-preview"
              name="is_preview"
              type="checkbox"
              defaultChecked={lesson.is_preview}
              className="size-4 rounded border-hairline text-accent focus:ring-accent"
            />
            <span className="text-ink">Visible to non-enrolled learners</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Chapters</Label>
        <ChapterEditor initial={initialChapters} onChange={setChapters} />
      </div>

      <div className="space-y-2">
        <Label>Resources</Label>
        <ResourceManager
          lessonId={lesson.id}
          trackSlug={trackSlug}
          userId={educatorUserId}
          resources={resources}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Save lesson"}
        </Button>
      </div>
    </form>
  );
}
