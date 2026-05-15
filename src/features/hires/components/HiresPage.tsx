"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { HireDrawer } from "@/features/hires/components/HireDrawer";
import type { HireApplication } from "@/features/hires/server/queries";

const STATUS_DOT: Record<string, string> = {
  pending:     "bg-amber-400",
  reviewing:   "bg-blue-400",
  shortlisted: "bg-violet-400",
  hired:       "bg-green-400",
  rejected:    "bg-red-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HiresPage({ applications }: { applications: HireApplication[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<HireApplication | null>(null);

  const filtered = applications.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${a.first_name} ${a.last_name}`.toLowerCase();
    return (
      name.includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email or status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-full border border-hairline bg-surface-raised pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-hairline bg-surface-raised shadow-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-surface-subtle/60">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Applicant</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:table-cell">Contact</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:table-cell">Status</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted lg:table-cell">Applied</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-ink-muted">
                  {search ? "No applicants match your search." : "No applications yet."}
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-subtle/60 transition-colors"
                >
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
                        {a.first_name[0]}{a.last_name[0]}
                      </div>
                      <span className="text-[14px] font-medium text-ink">
                        {a.first_name} {a.last_name}
                      </span>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <p className="text-[13px] text-ink-muted">{a.email}</p>
                    <p className="text-[12px] text-ink-muted/70">{a.phone}</p>
                  </td>
                  {/* Status */}
                  <td className="hidden px-5 py-3.5 md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full shrink-0 ${STATUS_DOT[a.status] ?? "bg-ink-muted"}`} />
                      <span className="text-[13px] text-ink capitalize">{a.status}</span>
                    </div>
                  </td>
                  {/* Applied */}
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted lg:table-cell">
                    {formatDate(a.created_at)}
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
            {filtered.length} {filtered.length === 1 ? "applicant" : "applicants"}
            {search && ` matching "${search}"`}
          </div>
        )}
      </div>

      <HireDrawer app={selected} onClose={() => setSelected(null)} />
    </>
  );
}
