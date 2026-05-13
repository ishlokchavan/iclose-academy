import Link from "next/link";
import { CheckCircle2, Play, Lock } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { ModuleRailItem } from "@/features/tracks/types";

type Props = {
  moduleRail: ModuleRailItem[];
  currentLessonId: string;
  trackSlug: string;
  enrolled: boolean;
  completedLessonIds?: Set<string>;
};

export function ModuleRail({
  moduleRail,
  currentLessonId,
  trackSlug,
  enrolled,
  completedLessonIds = new Set(),
}: Props) {
  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="shrink-0 border-b border-hairline px-5 py-4">
        <Link
          href={`/tracks/${trackSlug}`}
          className="text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:text-ink transition-colors"
        >
          ← Track overview
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {moduleRail.map((item, mi) => (
          <div key={item.module.id} className="mb-4">
            {/* Module label */}
            <div className="mb-1 px-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Module {item.module.position} — {item.module.title}
              </p>
            </div>

            {/* Lessons */}
            {item.lessons.map((lesson) => {
              const isCurrent = lesson.id === currentLessonId;
              const isCompleted = completedLessonIds.has(lesson.id);
              const accessible = enrolled || lesson.is_preview;

              return (
                <div key={lesson.id} className="relative">
                  {isCurrent && (
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-accent rounded-full" />
                  )}
                  {accessible ? (
                    <Link
                      href={`/tracks/${trackSlug}/lessons/${lesson.id}`}
                      className={cn(
                        "flex items-start gap-3 px-5 py-2.5 transition-colors",
                        isCurrent
                          ? "bg-accent/5 text-accent"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-ink",
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isCurrent ? (
                          <Play className="h-4 w-4 fill-current" />
                        ) : (
                          <Play className="h-4 w-4 text-zinc-300" />
                        )}
                      </span>
                      <span className="text-sm leading-snug">{lesson.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 px-5 py-2.5 opacity-40">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                      <span className="text-sm leading-snug text-zinc-400">
                        {lesson.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
