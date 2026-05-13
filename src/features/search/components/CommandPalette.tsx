"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, BookOpen, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Result = {
  type: string;
  id: string;
  title: string;
  href: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ⌘K / Ctrl+K global listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // TopBar button listener
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-command-palette", handler);
    return () => window.removeEventListener("open-command-palette", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
        );
        const data = await res.json();
        setResults(data);
        setActiveIndex(0);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) {
      setQuery("");
      setResults([]);
    }
  }

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      navigate(results[activeIndex].href);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[20vh] z-50 w-full max-w-lg -translate-x-1/2",
            "overflow-hidden rounded-2xl border border-hairline bg-white shadow-elevated",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4",
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <Dialog.Title className="sr-only">Search</Dialog.Title>
            <input
              ref={inputRef}
              autoFocus
              placeholder="Search tracks, lessons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink placeholder-zinc-400 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-zinc-400 hover:text-zinc-600"
              >
                Clear
              </button>
            )}
            <kbd className="rounded border border-hairline bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto py-2">
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => navigate(r.href)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === activeIndex ? "bg-zinc-50" : "hover:bg-zinc-50/60",
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                    <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                    <p className="text-xs capitalize text-zinc-400">{r.type}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-300" />
                </button>
              ))}
            </div>
          )}

          {/* Empty / hint states */}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {!query && (
            <div className="px-4 py-5 text-center text-xs text-zinc-400">
              Type to search tracks and lessons
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
