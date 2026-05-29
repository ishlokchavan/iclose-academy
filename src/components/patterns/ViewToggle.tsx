"use client";

import { Network, Table as TableIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

export type ViewMode = "table" | "tree";

/**
 * Two-state toggle for "table | tree" views, with a persisted preference.
 * Pass a unique `storageKey` per page so toggles don't collide.
 */
export function useViewMode(storageKey: string, initial: ViewMode = "table") {
  const [view, setView] = useState<ViewMode>(initial);

  // Read preference after mount — never touch localStorage during SSR.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "tree" || stored === "table") setView(stored);
    } catch {
      /* localStorage unavailable */
    }
  }, [storageKey]);

  function changeView(next: ViewMode) {
    setView(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* ignore */
    }
  }

  return { view, changeView };
}

export function ViewToggle({
  view,
  onChange,
  className,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-hairline bg-surface-raised p-0.5",
        className,
      )}
    >
      <Btn on={view === "table"} onClick={() => onChange("table")} icon={TableIcon} label="Table view" />
      <Btn on={view === "tree"} onClick={() => onChange("tree")} icon={Network} label="Tree view" />
    </div>
  );
}

function Btn({
  on, onClick, icon: Icon, label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-7 place-items-center rounded-full transition-colors",
        on ? "bg-ink text-surface" : "text-ink-muted hover:text-ink",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
