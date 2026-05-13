"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

import { saveTrackAction } from "@/features/tracks/server/actions";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({
  trackId,
  initialSaved,
  className,
}: {
  trackId: string;
  initialSaved: boolean;
  className?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle(e: React.MouseEvent) {
    // Don't follow the parent <Link>.
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const res = await saveTrackAction(trackId, next);
      if (res?.error) setSaved(!next); // revert on failure
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
        saved
          ? "text-accent hover:text-accent"
          : "hover:bg-surface-subtle hover:text-ink",
        className,
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
