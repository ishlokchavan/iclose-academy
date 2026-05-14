"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

import { saveTopicAction } from "@/features/topics/server/actions";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({
  topicId,
  initialSaved,
  className,
}: {
  topicId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await saveTopicAction(topicId, next);
      if (res?.error) setSaved(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from saved" : "Save for later"}
      aria-pressed={saved}
      className={cn(
        "grid size-8 place-items-center rounded-md text-zinc-400 transition-colors duration-200",
        saved ? "text-accent" : "hover:bg-surface-subtle hover:text-ink",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
