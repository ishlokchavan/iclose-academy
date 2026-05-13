import Link from "next/link";
import { Lock, Play, Clock } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { ModuleWithLessons } from "../types";

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

type Props = {
  modules: ModuleWithLessons[];
  trackSlug: string;
  enrolled: boolean;
};

export function ModuleOutline({ modules, trackSlug, enrolled }: Props) {
  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
      {modules.map((module, mi) => (
        <div key={module.id}>
          {/* Module header */}
          <div className="flex items-center gap-3 bg-zinc-50 px-5 py-3.5">
            <span className="font-mono text-xs text-zinc-400">
              {String(mi + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{module.title}</p>
              {module.summary && (
                <p className="text-xs text-zinc-500">{module.summary}</p>
              )}
            </div>
            <span className="ml-auto font-mono text-xs text-zinc-400">
              {module.lessons.length}{" "}
              {module.lessons.length === 1 ? "lesson" : "lessons"}
            </span>
          </div>

          {/* Lessons */}
          <div className="divide-y divide-hairline">
            {module.lessons.map((lesson) => {
              const accessible = enrolled || lesson.is_preview;
              return (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 transition-colors",
                    accessible
                      ? "hover:bg-zinc-50/60 cursor-pointer"
                      : "opacity-50",
                  )}
                >
                  {accessible ? (
                    <Link
                      href={`/tracks/${trackSlug}/lessons/${lesson.id}`}
                      className="flex flex-1 items-center gap-3 min-w-0"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
                        <Play className="h-2.5 w-2.5 fill-current" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink">
                          {lesson.title}
                        </span>
                        {lesson.summary && (
                          <span className="block truncate text-xs text-zinc-500">
                            {lesson.summary}
                          </span>
                        )}
                      </span>
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        {lesson.is_preview && (
                          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                            Preview
                          </span>
                        )}
                        {lesson.duration_seconds && (
                          <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <Clock className="h-3 w-3" />
                            {formatDuration(lesson.duration_seconds)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex flex-1 items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-300">
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                      <span className="truncate text-sm text-zinc-400">{lesson.title}</span>
                      {lesson.duration_seconds && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-zinc-400">
                          <Clock className="h-3 w-3" />
                          {formatDuration(lesson.duration_seconds)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
