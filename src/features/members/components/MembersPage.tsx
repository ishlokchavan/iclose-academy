"use client";

import { MousePointerClick, Users, Wallet } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/patterns/DataTable";
import { EmailLink } from "@/components/patterns/ContactLink";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { useViewMode, ViewToggle } from "@/components/patterns/ViewToggle";
import { formatDateTime, formatUpdatedAt } from "@/lib/utils/date";

import { MemberDrawer } from "./MemberDrawer";
import { MembersTree } from "./MembersTree";
import type {
  MemberDetail,
  MembersOverview,
  MemberRow,
  TreeMember,
} from "../server/queries";

const VIEW_STORAGE_KEY = "iclose.members.view";

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

export function MembersPage({
  overview,
  members,
  treeNodes,
  loadDetail,
}: {
  overview: MembersOverview;
  members: MemberRow[];
  /** Unified tree input: members + partner roots. Defaults to members alone. */
  treeNodes?: TreeMember[];
  loadDetail: (id: string) => Promise<MemberDetail | null>;
}) {
  const [selectedId, setId]   = useState<string | null>(null);
  const [detail, setDetail]   = useState<MemberDetail | null>(null);
  const [detailLoading, setDL] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter]   = useState<"all" | "active" | "referred">("all");
  const [period, setPeriod]   = useState<Period>("all");
  const { view, changeView }  = useViewMode(VIEW_STORAGE_KEY);

  // Drop optimistic deletions once the server has caught up.
  useEffect(() => {
    setDeletedIds((prev) => {
      if (prev.size === 0) return prev;
      const present = new Set(members.map((a) => a.id));
      const next = new Set<string>();
      for (const id of prev) if (present.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [members]);

  const visible = useMemo(() => {
    const inPeriod = filterByPeriod(members, (m) => m.created_at, period);
    return inPeriod.filter((a) => {
      if (deletedIds.has(a.id)) return false;
      if (filter === "active"   && a.referral_count === 0) return false;
      if (filter === "referred" && !a.referred_by_code)    return false;
      return true;
    });
  }, [members, filter, period, deletedIds]);

  const columns = useMemo<ColumnDef<MemberRow, unknown>[]>(() => [
    {
      id: "member",
      accessorFn: (a) => `${a.name ?? ""} ${a.email}`.trim(),
      header: "Member",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", filterPlaceholder: "name or email" },
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[12px] font-semibold text-ink">
              {initials(a.name, a.email)}
            </div>
            <div className="min-w-0">
              <span className="block text-[14px] font-medium text-ink leading-snug truncate">
                {a.name || a.email}
              </span>
              <span className="block text-[12px] text-ink-muted truncate">
                <EmailLink email={a.email} stopPropagation />
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: "intent",
      accessorFn: (m) => m.intent ?? "",
      header: "Type",
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden sm:table-cell" },
      cell: ({ row }) => {
        const v = row.original.intent;
        if (!v) return <span className="text-[12px] text-ink-muted/50">—</span>;
        const tone =
          v === "closer" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          v === "buyer"  ? "bg-blue-50 text-blue-700 border-blue-200" :
                           "bg-surface-subtle text-ink-muted border-hairline";
        return (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${tone}`}>
            {v}
          </span>
        );
      },
    },
    {
      id: "code",
      accessorKey: "referral_code",
      header: "Code",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden md:table-cell", filterPlaceholder: "ABC123" },
      cell: ({ row }) => (
        <code className="rounded-md border border-hairline bg-surface-subtle px-2 py-0.5 text-[12px] font-mono font-medium text-ink">
          {row.original.referral_code ?? "—"}
        </code>
      ),
    },
    {
      id: "referredBy",
      accessorFn: (m) => m.referred_by_name ?? "",
      header: "Referred by",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", className: "hidden md:table-cell", filterPlaceholder: "name" },
      cell: ({ row }) => {
        const m = row.original;
        if (!m.referred_by_code) {
          return <span className="text-[12px] text-ink-muted/60">Organic</span>;
        }
        const name = m.referred_by_name;
        const kind = m.referred_by_kind;
        return (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate text-[13px] text-ink">
              {name ?? <code className="font-mono text-[12px] text-ink-muted">{m.referred_by_code}</code>}
            </span>
            {kind === "partner" ? (
              m.referred_by_archived ? (
                <span className="shrink-0 rounded-full border border-amber-300/60 bg-amber-50 px-1.5 py-0 text-[9.5px] font-semibold uppercase tracking-wider text-amber-700">
                  Partner · Archived
                </span>
              ) : (
                <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-1.5 py-0 text-[9.5px] font-semibold uppercase tracking-wider text-accent">
                  Partner
                </span>
              )
            ) : kind === "member" ? (
              <span className="shrink-0 rounded-full border border-hairline bg-surface-subtle px-1.5 py-0 text-[9.5px] font-semibold uppercase tracking-wider text-ink-muted">
                Member
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "clicks",
      accessorKey: "clicks",
      header: "Clicks",
      meta: { align: "right" },
      cell: ({ row }) => <span className="tabular-nums text-ink">{row.original.clicks}</span>,
    },
    {
      id: "direct",
      accessorKey: "referral_count",
      header: "Direct",
      meta: { align: "right" },
      cell: ({ row }) => (
        <span className={`tabular-nums ${row.original.referral_count > 0 ? "font-semibold text-ink" : "text-ink-muted"}`}>
          {row.original.referral_count}
        </span>
      ),
    },
    {
      id: "network",
      accessorKey: "network_size",
      header: "Network",
      meta: { align: "right", className: "hidden sm:table-cell" },
      cell: ({ row }) => {
        const a = row.original;
        return a.network_size > a.referral_count ? (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <span className="font-medium text-ink">{a.network_size}</span>
            <span className="rounded-full bg-violet-50 px-1.5 text-[10px] font-medium text-violet-700">
              +{a.network_size - a.referral_count}
            </span>
          </span>
        ) : (
          <span className={`tabular-nums ${a.network_size > 0 ? "text-ink" : "text-ink-muted"}`}>{a.network_size}</span>
        );
      },
    },
    {
      id: "joined",
      accessorKey: "created_at",
      header: "Joined",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">{formatDateTime(row.original.created_at)}</span>
      ),
    },
    {
      id: "updated",
      accessorKey: "updated_at",
      header: "Updated",
      meta: { className: "hidden xl:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">
          {formatUpdatedAt(row.original.created_at, row.original.updated_at)}
        </span>
      ),
    },
  ], []);

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
        <StatTile icon={Users}              label="Members"           value={overview.totalMembers - deletedIds.size} tone="blue" />
        <StatTile icon={MousePointerClick}  label="Total clicks"      value={overview.totalClicks}       tone="emerald" />
        <StatTile icon={Wallet}             label="Referred members"  value={overview.totalReferrals}    tone="amber" />
        <StatTile icon={Users}              label="Active referrers"  value={overview.activeReferrers}   tone="violet" />
      </section>

      {/* Toolbar: chip filters (table only) + view toggle */}
      <div className="mt-8 mb-3 flex items-center gap-2 flex-wrap">
        {view === "table" ? (
          <>
            <Chip on={filter === "all"}      onClick={() => setFilter("all")}>All</Chip>
            <Chip on={filter === "active"}   onClick={() => setFilter(filter === "active"   ? "all" : "active")}>Has referrals</Chip>
            <Chip on={filter === "referred"} onClick={() => setFilter(filter === "referred" ? "all" : "referred")}>Was referred</Chip>
          </>
        ) : (
          <p className="text-[12px] text-ink-muted">
            {members.length} member{members.length === 1 ? "" : "s"} · click any node to open details
          </p>
        )}
        {view === "table" ? (
          <PeriodFilter value={period} onChange={setPeriod} className="ml-auto" />
        ) : null}
        <ViewToggle
          view={view}
          onChange={changeView}
          className={view !== "table" ? "ml-auto" : undefined}
        />
      </div>

      {view === "table" ? (
        <DataTable
          data={visible}
          columns={columns}
          getRowId={(a) => a.id}
          onRowClick={(a) => openDetail(a.id)}
          initialSorting={[{ id: "direct", desc: true }]}
          emptyMessage="No members match your filters."
        />
      ) : (
        <MembersTree
          members={(treeNodes ?? members).filter((n) => !deletedIds.has(n.id))}
          onSelect={openDetail}
          selectedId={selectedId}
        />
      )}

      <MemberDrawer
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

