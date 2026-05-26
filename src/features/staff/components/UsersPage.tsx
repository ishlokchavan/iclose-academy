"use client";

import { UserPlus } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/patterns/DataTable";
import { filterByPeriod, PeriodFilter, type Period } from "@/components/patterns/PeriodFilter";
import { RoleBadge } from "@/components/ui/role-badge";
import { InviteUserModal } from "@/features/staff/components/InviteUserModal";
import { UserDrawer } from "@/features/staff/components/UserDrawer";
import type { StaffUserRow } from "@/features/staff/server/user-queries";
import { formatDateTime } from "@/lib/utils/date";
import type { Database } from "@/types/db";

type AppRole = Database["public"]["Enums"]["app_role"];
type Tab = "learners" | "staff" | "admin";

const STAFF_ROLES: AppRole[] = ["manager", "educator"];

function tabFilter(tab: Tab) {
  return (u: StaffUserRow) => {
    if (tab === "learners") return u.role === "learner";
    if (tab === "staff") return STAFF_ROLES.includes(u.role);
    return u.role === "admin";
  };
}

function initials(u: StaffUserRow) {
  return (u.full_name ?? u.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UsersPage({
  users,
  selfId,
}: {
  users: StaffUserRow[];
  selfId: string;
}) {
  const [tab, setTab] = useState<Tab>("learners");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [period, setPeriod] = useState<Period>("all");

  const counts = useMemo(
    () => ({
      learners: users.filter(tabFilter("learners")).length,
      staff: users.filter(tabFilter("staff")).length,
      admin: users.filter(tabFilter("admin")).length,
    }),
    [users],
  );

  const visible = useMemo(
    () => filterByPeriod(users.filter(tabFilter(tab)), (u) => u.created_at, period),
    [users, tab, period],
  );
  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  const columns = useMemo<ColumnDef<StaffUserRow, unknown>[]>(() => [
    {
      id: "user",
      accessorFn: (u) => `${u.full_name ?? ""} ${u.email ?? ""}`.trim(),
      header: "User",
      enableGlobalFilter: true,
      enableColumnFilter: true,
      meta: { filter: "text", filterPlaceholder: "name or email" },
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[11px] font-semibold text-ink">
              {initials(u)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium text-ink">
                {u.full_name ?? "(no name)"}
                {u.id === selfId ? (
                  <span className="ml-1.5 text-[11px] font-normal text-ink-muted">you</span>
                ) : null}
              </p>
              <p className="truncate text-[12px] text-ink-muted">{u.email ?? "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "role",
      accessorFn: (u) => (tab === "learners" ? (u.plan_key ?? "") : u.role),
      header: tab === "learners" ? "Plan" : "Role",
      enableColumnFilter: true,
      meta: { filter: "select", className: "hidden sm:table-cell" },
      cell: ({ row }) => {
        const u = row.original;
        return tab === "learners" ? (
          <span className="text-[13px] text-ink-muted capitalize">{u.plan_key ?? "—"}</span>
        ) : (
          <RoleBadge role={u.role as "learner" | "manager" | "admin"} />
        );
      },
    },
    {
      id: "joined",
      accessorKey: "created_at",
      header: "Joined",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => (
        <span className="text-[13px] text-ink-muted">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
  ], [tab, selfId]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <PeriodFilter value={period} onChange={setPeriod} />
        <Button
          onClick={() => setShowInvite(true)}
          className="ml-auto shrink-0"
          aria-label="Invite member"
        >
          <UserPlus className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">Invite member</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 rounded-xl border border-hairline bg-surface-subtle p-1">
        {(["learners", "staff", "admin"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
              tab === t
                ? "bg-surface-raised text-ink shadow-card"
                : "text-ink-muted hover:text-ink",
            ].join(" ")}
          >
            <span className="capitalize">{t}</span>
            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                tab === t ? "bg-accent/10 text-accent" : "bg-surface-raised text-ink-muted",
              ].join(" ")}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        data={visible}
        columns={columns}
        getRowId={(u) => u.id}
        onRowClick={(u) => setSelectedId(u.id)}
        initialSorting={[{ id: "joined", desc: true }]}
        emptyMessage={tab === "staff" ? "No staff yet. Use Invite to add team members." : "No users match your filters."}
      />

      <UserDrawer
        user={selectedUser}
        selfId={selfId}
        onClose={() => setSelectedId(null)}
      />
      <InviteUserModal open={showInvite} onClose={() => setShowInvite(false)} />
    </div>
  );
}
