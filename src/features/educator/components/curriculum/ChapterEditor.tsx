"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Chapter } from "@/features/educator/schemas/curriculum";

export function ChapterEditor({
  initial,
  onChange,
}: {
  initial: Chapter[];
  onChange: (chapters: Chapter[]) => void;
}) {
  const [chapters, setChapters] = useState<Chapter[]>(initial);

  function update(next: Chapter[]) {
    setChapters(next);
    onChange(next);
  }

  function add() {
    const lastT = chapters[chapters.length - 1]?.t ?? 0;
    update([...chapters, { t: lastT + 30, label: "" }]);
  }

  function remove(i: number) {
    update(chapters.filter((_, idx) => idx !== i));
  }

  function patch(i: number, patch: Partial<Chapter>) {
    update(chapters.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  return (
    <div className="space-y-2">
      {chapters.length === 0 ? (
        <p className="text-xs text-ink-muted italic">
          No chapters yet. Add timestamps to help learners jump around the video.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {chapters.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={formatTime(c.t)}
                onChange={(e) => patch(i, { t: parseTime(e.target.value) })}
                placeholder="0:00"
                aria-label="Timestamp"
                className="h-9 w-20 rounded-md border border-hairline bg-surface-raised px-2 text-center text-sm font-mono text-ink focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={c.label}
                onChange={(e) => patch(i, { label: e.target.value })}
                placeholder="Chapter label"
                aria-label="Chapter label"
                className="h-9 flex-1 rounded-md border border-hairline bg-surface-raised px-3 text-sm text-ink focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-surface-subtle hover:text-destructive transition-colors"
                aria-label="Remove chapter"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button type="button" variant="ghost" size="sm" onClick={add}>
        <Plus className="size-3.5" /> Add chapter
      </Button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseTime(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":").map((p) => Number.parseInt(p, 10) || 0);
    return Math.max(0, (m ?? 0) * 60 + (s ?? 0));
  }
  return Math.max(0, Number.parseInt(trimmed, 10) || 0);
}
