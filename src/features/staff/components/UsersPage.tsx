"use client";

import { ChevronRight, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/role-badge";
import { InviteUserModal } from "@/features/staff/components/InviteUserModal";
import { UserDrawer } from "@/features/staff/components/UserDrawer";
import type { StaffUserRow } from "@/features/staff/server/user-queries";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersPage({
  users,
  selfId,
}: {
  users: StaffUserRow[];
  selfId: string;
}) {
  const [tab, setTab] = useState<Tab>("learners");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const counts = useMemo(
    () => ({
      learners: users.filter(tabFilter("learners")).length,
      staff: users.filter(tabFilter("staff")).length,
      admin: users.filter(tabFilter("admin")).length,
    }),
    [users],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(tabFilter(tab)).filter((u) => {
      if (!q) return true;
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, tab, search]);

  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" aria-hidden />
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-hairline bg-surface-raised pl-8 pr-3 text-[14px] text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
          />
        </div>
        <Button
          size="sm"
          onClick={() => setShowInvite(true)}
          className="shrink-0 gap-1.5"
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
            onClick={() => { setTab(t); setSearch(""); }}
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-card">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[15px] font-medium text-ink">
              {search ? "No results" : tab === "learners" ? "No learners yet" : tab === "staff" ? "No staff members yet" : "No admins"}
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              {search ? "Try a different search." : tab === "staff" ? "Use Invite to add team members." : ""}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-hairline bg-surface-subtle/50 text-left">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  User
                </th>
                <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted sm:table-cell">
                  {tab === "learners" ? "Plan" : "Role"}
                </th>
                <th className="hidden px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted md:table-cell">
                  Joined
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {visible.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className="cursor-pointer transition-colors hover:bg-surface-subtle/50"
                >
                  <td className="px-5 py-3.5">
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
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    {tab === "learners" ? (
                      <span className="text-[13px] text-ink-muted capitalize">{u.plan_key ?? "—"}</span>
                    ) : (
                      <RoleBadge role={u.role as "learner" | "manager" | "admin"} />
                    )}
                  </td>
                  <td className="hidden px-5 py-3.5 text-[13px] text-ink-muted md:table-cell">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-muted">
                    <ChevronRight className="size-4" aria-hidden />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {visible.length > 0 && (
        <p className="text-[12px] text-ink-muted">
          {visible.length} {visible.length === 1 ? "user" : "users"}
          {search ? ` matching "${search}"` : ""}
        </p>
      )}

      {/* Drawer */}
      <UserDrawer
        user={selectedUser}
        selfId={selfId}
        onClose={() => setSelectedId(null)}
      />

      {/* Invite modal */}
      <InviteUserModal open={showInvite} onClose={() => setShowInvite(false)} />
    </>
  );
}
