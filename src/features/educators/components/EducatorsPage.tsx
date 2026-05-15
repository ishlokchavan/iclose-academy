"use client";

import { Search, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AddEducatorModal } from "@/features/educators/components/AddEducatorModal";
import { EducatorDrawer } from "@/features/educators/components/EducatorDrawer";
import type { EducatorRecord } from "@/features/educators/server/queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(e: EducatorRecord) {
  return (e.name || "E")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EducatorsPage({ educators }: { educators: EducatorRecord[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EducatorRecord | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = educators.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.phone?.toLowerCase().includes(q) ||
      e.expertise?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-full border border-hairline bg-surface-raised pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
          />
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus className="size-4" />
          <span className="hidden sm:inline">Add educator</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-hairline bg-surface-raised shadow-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-surface-subtle/60">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Educator</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:table-cell">Email</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:table-cell">Phone</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted lg:table-cell">Expertise</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:table-cell">Added</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-ink-muted">
                  {search ? "No educators match your search." : "No educators yet."}
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-subtle/60 transition-colors"
                >
                  {/* Name + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
                        {initials(e)}
                      </div>
                      <span className="text-[14px] font-medium text-ink">{e.name}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted sm:table-cell">
                    {e.email ?? <span className="text-ink-muted/50">—</span>}
                  </td>
                  {/* Phone */}
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted md:table-cell">
                    {e.phone ?? <span className="text-ink-muted/50">—</span>}
                  </td>
                  {/* Expertise */}
                  <td className="hidden px-5 py-3.5 lg:table-cell">
                    {e.expertise ? (
                      <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">{e.expertise}</span>
                    ) : (
                      <span className="text-ink-muted/50 text-[13px]">—</span>
                    )}
                  </td>
                  {/* Added */}
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted md:table-cell">
                    {formatDate(e.created_at)}
                  </td>
                  {/* Chevron */}
                  <td className="pr-4 text-ink-muted">
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="border-t border-hairline px-5 py-3 text-[12px] text-ink-muted">
            {filtered.length} {filtered.length === 1 ? "educator" : "educators"}
            {search && ` matching "${search}"`}
          </div>
        )}
      </div>

      <EducatorDrawer
        educator={selected}
        onClose={() => setSelected(null)}
      />
      <AddEducatorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />
    </>
  );
}
