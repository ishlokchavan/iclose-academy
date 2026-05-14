"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { Area, PropertySubtype, PropertyType } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

type Taxonomy = {
  areas: Area[];
  types: PropertyType[];
  subtypes: PropertySubtype[];
};

type Selection = {
  area: Set<string>;
  type: Set<string>;
  subtype: Set<string>;
  subarea: string;
  q: string;
  totalActive: number;
};

type Ctx = {
  taxonomy: Taxonomy;
  selection: Selection;
  pending: boolean;
  toggle: (key: "area" | "type" | "subtype", value: string) => void;
  setText: (key: "subarea" | "q", value: string) => void;
  removeOne: (key: "area" | "type" | "subtype" | "subarea" | "q", value?: string) => void;
  clearAll: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

const FilterCtx = createContext<Ctx | null>(null);
function useFilter() {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error("FilterProvider missing");
  return ctx;
}

// =============================================================================
// Provider — owns URL-synced state. Wrap your library page tree with it once.
// =============================================================================
export function FilterProvider({
  taxonomy,
  children,
}: {
  taxonomy: Taxonomy;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selection: Selection = useMemo(() => {
    const area = new Set(search.getAll("area"));
    const type = new Set(search.getAll("type"));
    const subtype = new Set(search.getAll("subtype"));
    const subarea = search.get("subarea") ?? "";
    const q = search.get("q") ?? "";
    return {
      area,
      type,
      subtype,
      subarea,
      q,
      totalActive:
        area.size + type.size + subtype.size + (subarea ? 1 : 0) + (q ? 1 : 0),
    };
  }, [search]);

  const apply = useCallback(
    (next: URLSearchParams) => {
      startTransition(() => {
        router.replace(`/topics${next.toString() ? `?${next}` : ""}`, { scroll: false });
      });
    },
    [router],
  );

  const toggle: Ctx["toggle"] = useCallback(
    (key, value) => {
      const next = new URLSearchParams(search.toString());
      const current = next.getAll(key);
      next.delete(key);
      if (current.includes(value)) {
        for (const v of current) if (v !== value) next.append(key, v);
      } else {
        for (const v of current) next.append(key, v);
        next.append(key, value);
      }
      // Drop stale subtypes whose parent type is no longer selected.
      if (key === "type") {
        const stillTypeIds = new Set(
          taxonomy.types
            .filter((t) => next.getAll("type").includes(t.slug))
            .map((t) => t.id),
        );
        const validSlugs = new Set(
          taxonomy.subtypes
            .filter((s) => stillTypeIds.size === 0 || stillTypeIds.has(s.type_id))
            .map((s) => s.slug),
        );
        const subs = next.getAll("subtype");
        next.delete("subtype");
        for (const sv of subs) if (validSlugs.has(sv)) next.append("subtype", sv);
      }
      apply(next);
    },
    [apply, search, taxonomy.subtypes, taxonomy.types],
  );

  const setText: Ctx["setText"] = useCallback(
    (key, value) => {
      const next = new URLSearchParams(search.toString());
      next.delete(key);
      if (value.trim().length > 0) next.set(key, value.trim());
      apply(next);
    },
    [apply, search],
  );

  const removeOne: Ctx["removeOne"] = useCallback(
    (key, value) => {
      const next = new URLSearchParams(search.toString());
      if (key === "subarea" || key === "q") {
        next.delete(key);
      } else if (value) {
        const current = next.getAll(key);
        next.delete(key);
        for (const v of current) if (v !== value) next.append(key, v);
      }
      apply(next);
    },
    [apply, search],
  );

  const clearAll = useCallback(() => apply(new URLSearchParams()), [apply]);

  return (
    <FilterCtx.Provider
      value={{
        taxonomy,
        selection,
        pending,
        toggle,
        setText,
        removeOne,
        clearAll,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </FilterCtx.Provider>
  );
}

// =============================================================================
// Top bar: active-filter pills + mobile drawer trigger + result count
// =============================================================================
export function FilterPills({ resultCount }: { resultCount: number }) {
  const { selection, removeOne, clearAll, taxonomy, setDrawerOpen } = useFilter();
  const areaName = (slug: string) =>
    taxonomy.areas.find((a) => a.slug === slug)?.name ?? slug;
  const typeName = (slug: string) =>
    taxonomy.types.find((t) => t.slug === slug)?.name ?? slug;
  const subtypeName = (slug: string) =>
    taxonomy.subtypes.find((s) => s.slug === slug)?.name ?? slug;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-subtle transition-colors lg:hidden"
      >
        <Filter className="size-3.5" />
        Filters
        {selection.totalActive > 0 ? (
          <span className="ml-1 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-white">
            {selection.totalActive}
          </span>
        ) : null}
      </button>

      {Array.from(selection.area).map((v) => (
        <Pill key={`area-${v}`} label={areaName(v)} onRemove={() => removeOne("area", v)} />
      ))}
      {Array.from(selection.type).map((v) => (
        <Pill key={`type-${v}`} label={typeName(v)} onRemove={() => removeOne("type", v)} />
      ))}
      {Array.from(selection.subtype).map((v) => (
        <Pill
          key={`subtype-${v}`}
          label={subtypeName(v)}
          onRemove={() => removeOne("subtype", v)}
        />
      ))}
      {selection.subarea ? (
        <Pill label={`"${selection.subarea}"`} onRemove={() => removeOne("subarea")} />
      ) : null}
      {selection.q ? (
        <Pill label={`Search: "${selection.q}"`} onRemove={() => removeOne("q")} />
      ) : null}
      {selection.totalActive > 0 ? (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-ink-muted hover:text-ink underline-offset-4 hover:underline transition-colors"
        >
          Clear all
        </button>
      ) : null}
      <span className="ml-auto text-xs text-ink-muted">
        {resultCount} {resultCount === 1 ? "topic" : "topics"}
      </span>
    </div>
  );
}

// =============================================================================
// Sidebar (desktop) + drawer (mobile)
// =============================================================================
export function FilterPanel({ desktopOnly }: { desktopOnly?: boolean }) {
  const { drawerOpen, setDrawerOpen, selection, clearAll } = useFilter();

  return (
    <>
      {desktopOnly ? (
        <aside>
          <PanelContent />
        </aside>
      ) : null}

      {!desktopOnly && drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background shadow-2xl">
            <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-9 place-items-center rounded-md text-ink-muted hover:bg-surface-subtle hover:text-ink"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <PanelContent />
            </div>
            <footer className="flex items-center gap-2 border-t border-hairline px-5 py-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink/90 transition-colors"
              >
                Show results
              </button>
              {selection.totalActive > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    setDrawerOpen(false);
                  }}
                  className="rounded-lg border border-hairline px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-subtle transition-colors"
                >
                  Clear
                </button>
              ) : null}
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function PanelContent() {
  const { taxonomy, selection, pending, toggle, setText } = useFilter();
  const [subareaInput, setSubareaInput] = useState(selection.subarea);
  const [qInput, setQInput] = useState(selection.q);

  useEffect(() => setSubareaInput(selection.subarea), [selection.subarea]);
  useEffect(() => setQInput(selection.q), [selection.q]);

  const visibleSubtypes = useMemo(() => {
    if (selection.type.size === 0) return taxonomy.subtypes;
    const ids = new Set(
      taxonomy.types.filter((t) => selection.type.has(t.slug)).map((t) => t.id),
    );
    return taxonomy.subtypes.filter((s) => ids.has(s.type_id));
  }, [taxonomy.subtypes, taxonomy.types, selection.type]);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label>Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onBlur={() => setText("q", qInput)}
            onKeyDown={(e) => e.key === "Enter" && setText("q", qInput)}
            placeholder="Title or description"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Building / cluster</Label>
        <Input
          value={subareaInput}
          onChange={(e) => setSubareaInput(e.target.value)}
          onBlur={() => setText("subarea", subareaInput)}
          onKeyDown={(e) => e.key === "Enter" && setText("subarea", subareaInput)}
          placeholder="e.g. Burj Khalifa"
        />
      </div>

      <Group
        title="Type"
        options={taxonomy.types.map((t) => ({ value: t.slug, label: t.name }))}
        selected={selection.type}
        onToggle={(v) => toggle("type", v)}
        pending={pending}
      />

      <Group
        title="Sub-type"
        hint={selection.type.size === 0 ? "Pick a type to see sub-types" : undefined}
        options={visibleSubtypes.map((s) => ({ id: s.id, value: s.slug, label: s.name }))}
        selected={selection.subtype}
        onToggle={(v) => toggle("subtype", v)}
        pending={pending}
        disabled={selection.type.size === 0}
      />

      <Group
        title="Area"
        options={taxonomy.areas.map((a) => ({ value: a.slug, label: a.name }))}
        selected={selection.area}
        onToggle={(v) => toggle("area", v)}
        pending={pending}
        searchable
      />
    </div>
  );
}

// =============================================================================
// helpers
// =============================================================================
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
      {children}
    </p>
  );
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-white">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="grid size-4 place-items-center rounded-full hover:bg-white/20"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

function Group({
  title,
  hint,
  options,
  selected,
  onToggle,
  pending,
  disabled,
  searchable,
}: {
  title: string;
  hint?: string;
  options: Array<{ id?: string; value: string; label: string }>;
  selected: Set<string>;
  onToggle: (v: string) => void;
  pending: boolean;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchable || query.length === 0) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  if (options.length === 0 && !disabled) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="group flex w-full items-center justify-between text-left"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted group-hover:text-ink transition-colors">
          {title}
          {selected.size > 0 ? (
            <span className="ml-1.5 text-ink">({selected.size})</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 text-ink-muted transition-transform duration-200",
            collapsed && "-rotate-90",
          )}
        />
      </button>
      {collapsed ? null : (
        <div className="space-y-2">
          {hint ? <p className="text-xs italic text-ink-muted">{hint}</p> : null}
          {searchable ? (
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="h-9 text-sm"
            />
          ) : null}
          <div
            className={cn(
              "flex flex-wrap gap-1.5",
              searchable && "max-h-64 overflow-y-auto pr-1",
            )}
          >
            {filtered.map((o) => {
              const active = selected.has(o.value);
              return (
                <button
                  key={o.id ?? o.value}
                  type="button"
                  onClick={() => onToggle(o.value)}
                  disabled={pending || disabled}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200",
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
            {filtered.length === 0 ? (
              <p className="text-xs italic text-ink-muted">No matches.</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
