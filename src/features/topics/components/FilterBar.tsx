"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { Filter, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { Area, PropertySubtype, PropertyType } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  areas: Area[];
  types: PropertyType[];
  subtypes: PropertySubtype[];
};

export function FilterBar({ areas, types, subtypes }: Props) {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => ({
      area: new Set(search.getAll("area")),
      type: new Set(search.getAll("type")),
      subtype: new Set(search.getAll("subtype")),
    }),
    [search],
  );

  const [subareaInput, setSubareaInput] = useState(search.get("subarea") ?? "");
  const [qInput, setQInput] = useState(search.get("q") ?? "");

  const visibleSubtypes = useMemo(() => {
    if (selected.type.size === 0) return subtypes;
    const typeIds = new Set(
      types.filter((t) => selected.type.has(t.slug)).map((t) => t.id),
    );
    return subtypes.filter((s) => typeIds.has(s.type_id));
  }, [subtypes, types, selected.type]);

  const applyParams = useCallback(
    (next: URLSearchParams) => {
      startTransition(() => {
        router.replace(`/topics${next.toString() ? `?${next}` : ""}`, { scroll: false });
      });
    },
    [router],
  );

  function toggle(key: "area" | "type" | "subtype", value: string) {
    const next = new URLSearchParams(search.toString());
    const current = next.getAll(key);
    next.delete(key);
    if (current.includes(value)) {
      for (const v of current) if (v !== value) next.append(key, v);
    } else {
      for (const v of current) next.append(key, v);
      next.append(key, value);
    }
    // Clear subtype selections that no longer match the chosen type set.
    if (key === "type") {
      const stillValidTypeIds = new Set(
        types
          .filter((t) => next.getAll("type").includes(t.slug))
          .map((t) => t.id),
      );
      const validSubtypeSlugs = new Set(
        subtypes
          .filter((s) => stillValidTypeIds.size === 0 || stillValidTypeIds.has(s.type_id))
          .map((s) => s.slug),
      );
      const subs = next.getAll("subtype");
      next.delete("subtype");
      for (const sv of subs) if (validSubtypeSlugs.has(sv)) next.append("subtype", sv);
    }
    applyParams(next);
  }

  function commitText(key: "subarea" | "q", value: string) {
    const next = new URLSearchParams(search.toString());
    next.delete(key);
    if (value.trim().length > 0) next.set(key, value.trim());
    applyParams(next);
  }

  function clearAll() {
    setSubareaInput("");
    setQInput("");
    applyParams(new URLSearchParams());
  }

  const hasFilters =
    selected.area.size > 0 ||
    selected.type.size > 0 ||
    selected.subtype.size > 0 ||
    subareaInput.length > 0 ||
    qInput.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onBlur={() => commitText("q", qInput)}
            onKeyDown={(e) => e.key === "Enter" && commitText("q", qInput)}
            placeholder="Search topics…"
            className="pl-9"
          />
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Input
            value={subareaInput}
            onChange={(e) => setSubareaInput(e.target.value)}
            onBlur={() => commitText("subarea", subareaInput)}
            onKeyDown={(e) => e.key === "Enter" && commitText("subarea", subareaInput)}
            placeholder="Building or cluster (e.g. Burj Khalifa)"
          />
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-subtle transition-colors"
          >
            <X className="size-3" /> Clear filters
          </button>
        ) : null}
      </div>

      <FilterGroup
        label="Area"
        options={areas.map((a) => ({ value: a.slug, label: a.name }))}
        selected={selected.area}
        onToggle={(v) => toggle("area", v)}
        pending={pending}
      />
      <FilterGroup
        label="Type"
        options={types.map((t) => ({ value: t.slug, label: t.name }))}
        selected={selected.type}
        onToggle={(v) => toggle("type", v)}
        pending={pending}
      />
      <FilterGroup
        label={selected.type.size > 0 ? "Sub-type" : "Sub-type (pick a type first)"}
        options={visibleSubtypes.map((s) => ({ value: s.slug, label: s.name }))}
        selected={selected.subtype}
        onToggle={(v) => toggle("subtype", v)}
        pending={pending}
        disabled={selected.type.size === 0}
      />
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  pending,
  disabled,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: Set<string>;
  onToggle: (v: string) => void;
  pending: boolean;
  disabled?: boolean;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-ink-muted">
        <Filter className="size-3" />
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((o) => {
          const active = selected.has(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(o.value)}
              disabled={pending || disabled}
              aria-pressed={active}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-luxury",
                active
                  ? "bg-ink text-white"
                  : "bg-white text-ink-muted ring-1 ring-inset ring-hairline hover:bg-surface-subtle hover:text-ink",
                (disabled || pending) && "cursor-not-allowed opacity-60",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
