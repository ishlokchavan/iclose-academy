"use client";

import { ChevronRight, MousePointerClick, Search, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { AffiliateDrawer } from "./AffiliateDrawer";
import type { AffiliateDetail, AffiliateOverview, AffiliateRow } from "../server/queries";

type SortKey = "referrals" | "network" | "clicks" | "recent";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "referrals", label: "Most direct" },
  { value: "network",   label: "Largest network" },
  { value: "clicks",    label: "Most clicks" },
  { value: "recent",    label: "Newest" },
];

function initials(name: string | null, email: string) {
  const src = (name ?? email).trim();
  if (!src) return "??";
  return src
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function AffiliatesPage({
  overview,
  affiliates,
  loadDetail,
}: {
  overview: AffiliateOverview;
  affiliates: AffiliateRow[];
  loadDetail: (id: string) => Promise<AffiliateDetail | null>;
}) {
  const [search, setSearch]   = useState("");
  const [sort, setSort]       = useState<SortKey>("referrals");
  const [filter, setFilter]   = useState<"all" | "active" | "referred">("all");
  const [selectedId, setId]   = useState<string | null>(null);
  const [detail, setDetail]   = useState<AffiliateDetail | null>(null);
  const [detailLoading, setDL] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = affiliates.filter((a) => {
      if (deletedIds.has(a.id)) return false;
      if (filter === "active"   && a.referral_count === 0) return false;
      if (filter === "referred" && !a.referred_by_code)    return false;
      if (!q) return true;
      return (
        a.name?.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.referral_code?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q)
      );
    });

    if (sort === "referrals") list = [...list].sort((a, b) => b.referral_count - a.referral_count);
    if (sort === "network")   list = [...list].sort((a, b) => b.network_size - a.network_size);
    if (sort === "clicks")    list = [...list].sort((a, b) => b.clicks - a.clicks);
    if (sort === "recent")    list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

    return list;
  }, [affiliates, search, sort, filter, deletedIds]);

  async function openDetail(id: string) {
    setId(id);
    setDetail(null);
    setDL(true);
    try {
      const d = await loadDetail(id);
      setDetail(d);
    } finally {
      setDL(false);
    }
  }

  function close() {
    setId(null);
    setDetail(null);
  }

  return (
    <>
      {/* Overview tiles */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Users}              label="Affiliates"        value={overview.totalAffiliates - deletedIds.size} tone="blue" />
        <StatTile icon={MousePointerClick}  label="Total clicks"      value={overview.totalClicks}       tone="emerald" />
        <StatTile icon={Wallet}             label="Referred leads"    value={overview.totalReferrals}    tone="amber" />
        <StatTile icon={Users}              label="Active referrers"  value={overview.activeAffiliates}  tone="violet" />
      </section>

      {/* Toolbar */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email, code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border border-hairline bg-surface-raised pl-9 pr-4 text-[14px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-full border border-hairline bg-surface-raised px-3 text-[13px] text-ink focus:outline-none focus:border-accent shrink-0"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Chip on={filter === "all"}      onClick={() => setFilter("all")}>All</Chip>
          <Chip on={filter === "active"}   onClick={() => setFilter(filter === "active"   ? "all" : "active")}>Has referrals</Chip>
          <Chip on={filter === "referred"} onClick={() => setFilter(filter === "referred" ? "all" : "referred")}>Was referred</Chip>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-hairline bg-surface-raised shadow-card overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-hairline bg-surface-subtle/60">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Affiliate</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:table-cell">Code</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted text-right">Clicks</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted text-right">Direct</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted text-right sm:table-cell">Network</th>
              <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:table-cell">Joined</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-ink-muted">
                  No affiliates match your filters.
                </td>
              </tr>
            ) : (
              visible.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => openDetail(a.id)}
                  className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-subtle/60 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
                        {initials(a.name, a.email)}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[14px] font-medium text-ink leading-snug truncate">
                          {a.name || a.email}
                        </span>
                        <span className="block text-[12px] text-ink-muted truncate">{a.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <code className="rounded-md border border-hairline bg-surface-subtle px-2 py-0.5 text-[12px] font-mono font-medium text-ink">
                      {a.referral_code ?? "—"}
                    </code>
                  </td>
                  <td className="px-5 py-3.5 text-right text-[14px] tabular-nums text-ink">
                    {a.clicks}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[14px] tabular-nums">
                    <span className={a.referral_count > 0 ? "font-semibold text-ink" : "text-ink-muted"}>
                      {a.referral_count}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 text-right text-[14px] tabular-nums sm:table-cell">
                    {a.network_size > a.referral_count ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium text-ink">{a.network_size}</span>
                        <span className="rounded-full bg-violet-50 px-1.5 text-[10px] font-medium text-violet-700">
                          +{a.network_size - a.referral_count}
                        </span>
                      </span>
                    ) : (
                      <span className={a.network_size > 0 ? "text-ink" : "text-ink-muted"}>{a.network_size}</span>
                    )}
                  </td>
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted md:table-cell">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="pr-4 text-ink-muted">
                    <ChevronRight className="size-4" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {visible.length > 0 && (
          <div className="border-t border-hairline px-5 py-3 text-[12px] text-ink-muted">
            {visible.length} {visible.length === 1 ? "affiliate" : "affiliates"}
          </div>
        )}
      </div>

      <AffiliateDrawer
        open={selectedId !== null}
        loading={detailLoading}
        detail={detail}
        onClose={close}
        onDeleted={(id) => {
          setDeletedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          close();
        }}
      />
    </>
  );
}

function StatTile({
  icon: Icon, label, value, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "blue" | "emerald" | "amber" | "violet";
}) {
  const toneClasses: Record<typeof tone, string> = {
    blue:    "bg-blue-50 border-blue-200/60",
    emerald: "bg-emerald-50 border-emerald-200/60",
    amber:   "bg-amber-50 border-amber-200/60",
    violet:  "bg-violet-50 border-violet-200/60",
  };
  return (
    <div className={`flex flex-col gap-1.5 rounded-xl border p-5 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-ink-muted" />
        <span className="eyebrow">{label}</span>
      </div>
      <span className="text-[2rem] font-bold tracking-tight text-ink tabular-nums">{value}</span>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 rounded-full border px-3 text-[12px] font-medium transition-colors ${
        on
          ? "bg-ink text-surface border-ink"
          : "bg-surface-raised text-ink-muted border-hairline hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}
