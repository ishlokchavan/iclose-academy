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
        /* Apple card: white surface on gray background, generous radius, soft shadow */
        "group flex flex-col overflow-hidden rounded-2xl bg-surface-raised shadow-card",
        "transition-all duration-300 ease-spring",
        "hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-subtle">
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-spring group-hover:scale-[1.03]"

          />
        ) : (
          <div className="grid h-full place-items-center text-ink-tertiary">
            <Play className="size-8 opacity-40" />
          </div>
        )}
        <BookmarkButton
          topicId={topic.id}
          initialSaved={topic.saved}
          className="absolute right-2.5 top-2.5 bg-white/80 backdrop-blur-sm hover:bg-white shadow-card"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Taxonomy badges */}
        {(topic.type || topic.subtypes.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {topic.type ? (
              <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent">
                {topic.type.name}
              </span>
            ) : null}
            {topic.subtypes.slice(0, 3).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-ink-muted"
              >
                {s.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          {topic.title}
        </h3>

        {/* Location */}
        {(topic.area || topic.subarea) ? (
          <p className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {[topic.subarea, topic.area?.name].filter(Boolean).join(" · ")}
            </span>
          </p>
        ) : null}

        {/* Educator */}
        {topic.educator.full_name ? (
          <p className="mt-auto text-[12px] text-ink-tertiary">
            {topic.educator.full_name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
