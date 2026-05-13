import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { EnrolledTrackSummary } from "@/features/dashboard/server/queries";

type Props = {
  enrollments: EnrolledTrackSummary[];
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
      <div
        className="h-full rounded-full bg-accent transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ContinueLearning({ enrollments }: Props) {
  if (!enrollments.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Continue learning
        </h2>
        <Link
          href="/tracks"
          className="text-xs font-medium text-zinc-400 hover:text-ink transition-colors"
        >
          Browse all tracks →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {enrollments.map(({ enrollment, track, completedLessons, totalLessons, lastLesson }) => {
          const pct =
            totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          const isComplete = enrollment.status === "completed" || pct === 100;

          return (
            <div
              key={enrollment.id}
              className="group flex flex-col rounded-xl border border-hairline bg-white p-5 transition-all hover:shadow-card-hover hover:-translate-y-0.5"
            >
              {/* Specialty */}
              {track.specialty && (
                <span className="mb-3 w-fit rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  {track.specialty.name}
                </span>
              )}

              {/* Track title */}
              <h3 className="font-semibold leading-snug text-ink">{track.title}</h3>
              {track.subtitle && (
                <p className="mt-0.5 text-xs text-zinc-500">{track.subtitle}</p>
              )}

              {/* Progress */}
              <ProgressBar value={completedLessons} max={totalLessons} />
              <p className="mt-1.5 text-xs text-zinc-400">
                {isComplete ? (
                  "Completed"
                ) : (
                  <>
                    {completedLessons} / {totalLessons} lessons
                    {totalLessons > 0 && ` · ${pct}%`}
                  </>
                )}
              </p>

              {/* CTA */}
              {lastLesson && !isComplete && (
                <Link
                  href={`/tracks/${lastLesson.trackSlug}/lessons/${lastLesson.id}`}
                  className={cn(
                    "mt-4 flex items-center gap-2 text-sm font-medium text-accent",
                    "hover:gap-3 transition-all",
                  )}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="truncate">{lastLesson.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0" />
                </Link>
              )}
              {isComplete && (
                <Link
                  href={`/tracks/${track.slug}`}
                  className="mt-4 text-xs font-medium text-zinc-400 hover:text-ink transition-colors"
                >
                  Review track →
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
