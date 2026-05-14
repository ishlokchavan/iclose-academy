import Image from "next/image";
import Link from "next/link";
import { MapPin, Play } from "lucide-react";

import { BookmarkButton } from "@/features/topics/components/BookmarkButton";
import type { TopicCard as TopicCardData } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

export function TopicCard({
  topic,
  className,
}: {
  topic: TopicCardData;
  className?: string;
}) {
  const thumb =
    topic.cover_url ??
    (topic.youtube_id ? `https://i.ytimg.com/vi/${topic.youtube_id}/hqdefault.jpg` : null);

  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-hairline bg-white transition-all duration-200 ease-luxury",
        "hover:-translate-y-0.5 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-subtle">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-muted">
            <Play className="size-8" />
          </div>
        )}
        <BookmarkButton
          topicId={topic.id}
          initialSaved={topic.saved}
          className="absolute right-2 top-2 bg-white/90 backdrop-blur hover:bg-white"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {topic.type ? (
            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
              {topic.type.name}
            </span>
          ) : null}
          {topic.subtypes.slice(0, 3).map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-600 ring-1 ring-inset ring-zinc-100"
            >
              {s.name}
            </span>
          ))}
        </div>

        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
          {topic.title}
        </h3>

        {topic.area || topic.subarea ? (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin className="size-3" />
            <span className="truncate">
              {[topic.subarea, topic.area?.name].filter(Boolean).join(" · ")}
            </span>
          </p>
        ) : null}

        {topic.educator.full_name ? (
          <p className="mt-auto text-[11px] text-zinc-400">
            {topic.educator.full_name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
