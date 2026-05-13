"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils/cn";
import type { Chapter } from "@/features/tracks/types";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = {
  chapters: Chapter[];
  onSeekRef: React.MutableRefObject<((seconds: number) => void) | null>;
};

export function ChapterList({ chapters, onSeekRef }: Props) {
  if (!chapters.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Chapters
      </h3>
      <div className="flex flex-col gap-0.5">
        {chapters.map((ch, i) => (
          <button
            key={i}
            onClick={() => onSeekRef.current?.(ch.t)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
              "hover:bg-zinc-100 text-sm text-zinc-600 hover:text-ink",
            )}
          >
            <span className="font-mono text-xs tabular-nums text-zinc-400 w-9 shrink-0">
              {formatTime(ch.t)}
            </span>
            <span>{ch.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
