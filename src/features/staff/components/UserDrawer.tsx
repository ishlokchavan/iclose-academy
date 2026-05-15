"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/ui/role-badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  deleteUserAction,
  setUserRoleAction,
  updateUserNameAction,
} from "@/features/staff/server/user-actions";
import type { StaffUserRow } from "@/features/staff/server/user-queries";
import type { Database } from "@/types/db";

type AppRole = Database["public"]["Enums"]["app_role"];
type StaffRole = "manager" | "content_manager";

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

const ROLE_LABEL: Record<AppRole, string> = {
  learner: "Learner",
  manager: "Manager",
  content_manager: "Content Manager",
  admin: "Admin",
  educator: "Educator (legacy)",
};

export function UserDrawer({
  user,
  selfId,
  onClose,
}: {
  user: StaffUserRow | null;
  selfId: string;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!user} onOpenChange={(open) => { if (!open) onClose(); }}>
      {user ? (
        <SheetContent title="User details" description="View and edit user account">
          <DrawerBody user={user} selfId={selfId} onClose={onClose} />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}

function DrawerBody({
  user,
  selfId,
  onClose,
}: {
  user: StaffUserRow;
  selfId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const isSelf = user.id === selfId;
  const isLearner = user.role === "learner";
  const isAdmin = user.role === "admin";
  const isStaff = !isLearner && !isAdmin;

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.full_name ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [namePending, startNameTransition] = useTransition();

  // Role editing
  const [roleValue, setRoleValue] = useState<StaffRole>(
    (["manager", "content_manager"].includes(user.role) ? user.role : "manager") as StaffRole,
  );
  const [roleError, setRoleError] = useState<string | null>(null);
  const [rolePending, startRoleTransition] = useTransition();

  // Delete
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  function saveName() {
    setNameError(null);
    startNameTransition(async () => {
      const res = await updateUserNameAction(user.id, nameValue);
      if (res.error) { setNameError(res.error); return; }
      setEditingName(false);
      router.refresh();
    });
  }

  function saveRole(next: StaffRole) {
    setRoleError(null);
    const prev = roleValue;
    setRoleValue(next);
    startRoleTransition(async () => {
      const res = await setUserRoleAction(user.id, next);
      if (res.error) { setRoleValue(prev); setRoleError(res.error); return; }
      router.refresh();
    });
  }

  function doDelete() {
    setDeleteError(null);
    startDeleteTransition(async () => {
      const res = await deleteUserAction(user.id);
      if (res.error) { setDeleteError(res.error); return; }
      onClose();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Avatar + identity */}
      <div className="border-b border-hairline p-6 pt-14">
        <div className="flex items-start gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[18px] font-semibold text-ink">
            {initials(user)}
          </div>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="space-y-1.5">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="h-8 text-[15px] font-semibold"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                />
                {nameError ? <p className="text-[12px] text-destructive">{nameError}</p> : null}
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveName} disabled={namePending} className="h-7 text-[12px]">
                    {namePending ? "Saving…" : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameValue(user.full_name ?? ""); }} className="h-7 text-[12px]">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="truncate text-[17px] font-semibold text-ink">
                  {user.full_name ?? "(no name)"}
                </p>
                {!isSelf && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="shrink-0 text-[11px] text-ink-muted hover:text-ink transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
            <p className="truncate text-[13px] text-ink-muted">{user.email ?? "—"}</p>
            {isSelf && <p className="mt-0.5 text-[11px] text-ink-muted">That's you</p>}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 space-y-5 p-6">
        {/* Role */}
        <div>
          <Label className="text-[12px] font-medium text-ink-muted uppercase tracking-wide">Role</Label>
          {isStaff && !isSelf ? (
            <div className="mt-2 space-y-1">
              <select
                value={roleValue}
                onChange={(e) => saveRole(e.target.value as StaffRole)}
                disabled={rolePending}
                className="h-9 w-full rounded-md border border-hairline bg-surface-raised px-2.5 text-[14px] text-ink disabled:opacity-50 focus:outline-none focus:border-accent"
              >
                <option value="manager">Manager</option>
                <option value="content_manager">Content Manager</option>
              </select>
              {roleError ? <p className="text-[12px] text-destructive">{roleError}</p> : null}
            </div>
          ) : (
            <div className="mt-2">
              <RoleBadge role={user.role as "learner" | "manager" | "content_manager" | "admin"} />
            </div>
          )}
        </div>

        {/* Joined */}
        <div>
          <Label className="text-[12px] font-medium text-ink-muted uppercase tracking-wide">Joined</Label>
          <p className="mt-1 text-[14px] text-ink">{formatDate(user.created_at)}</p>
        </div>

        {/* Plan (learners) */}
        {isLearner && user.plan_key ? (
          <div>
            <Label className="text-[12px] font-medium text-ink-muted uppercase tracking-wide">Plan</Label>
            <p className="mt-1 text-[14px] text-ink capitalize">{user.plan_key}</p>
          </div>
        ) : null}
      </div>

      {/* Danger zone */}
      {!isSelf && (
        <div className="border-t border-hairline p-6">
          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              Delete user…
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-[13px] font-medium text-ink">Delete this account?</p>
              <p className="text-[12px] text-ink-muted">
                This permanently removes <strong>{user.full_name ?? user.email}</strong> and all
                their data. This cannot be undone.
              </p>
              {deleteError ? <p className="text-[12px] text-destructive">{deleteError}</p> : null}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-destructive text-white hover:bg-destructive/90 h-8 text-[12px]"
                  onClick={doDelete}
                  disabled={deletePending}
                >
                  {deletePending ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-[12px]"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deletePending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
