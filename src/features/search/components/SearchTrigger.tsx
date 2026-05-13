"use client";

import { Search } from "lucide-react";

type Props = {
  className?: string;
};

export function SearchTrigger({ className }: Props) {
  function open() {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }

  return (
    <button
      onClick={open}
      aria-label="Search (⌘K)"
      className={className}
    >
      <Search className="h-4 w-4" />
    </button>
  );
}

export function SearchBar({ className }: Props) {
  function open() {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }

  return (
    <button
      onClick={open}
      className={className}
    >
      <Search className="h-3.5 w-3.5 text-zinc-400" />
      <span>Search</span>
      <kbd className="ml-auto font-mono text-[10px]">⌘K</kbd>
    </button>
  );
}
