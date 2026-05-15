"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/ui/role-badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  deleteUserAction,
  setUserRoleAction,
  updateLearnerAction,
  updateUserEmailAction,
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
  educator: "Educator",
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

// ─── Field row helper ─────────────────────────────────────────────────────────

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-x-3 py-2">
      <span className="text-[12px] font-medium text-ink-muted pt-px">{label}</span>
      <span className="text-[13px] text-ink break-words">{value ?? <span className="text-ink-muted">—</span>}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink-muted">{title}</p>
      <div className="rounded-xl border border-hairline bg-surface-subtle/50 divide-y divide-hairline px-4">
        {children}
      </div>
    </div>
  );
}

// ─── Edit form state types ────────────────────────────────────────────────────

type LearnerEditState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type StaffEditState = {
  full_name: string;
  email: string;
  role: StaffRole;
};

type AdminEditState = {
  full_name: string;
  email: string;
};

// ─── Main drawer body ─────────────────────────────────────────────────────────

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

  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const displayEmail = user.email ?? user.lead?.email ?? "";

  // Learner edit state — full_name is auto-computed from first + last on save
  const [learnerEdit, setLearnerEdit] = useState<LearnerEditState>({
    first_name: user.lead?.first_name ?? "",
    last_name: user.lead?.last_name ?? "",
    email: displayEmail,
    phone: user.lead?.phone ?? "",
  });

  // Staff edit state
  const [staffEdit, setStaffEdit] = useState<StaffEditState>({
    full_name: user.full_name ?? "",
    email: displayEmail,
    role: (["manager", "content_manager"].includes(user.role) ? user.role : "manager") as StaffRole,
  });

  // Admin edit state
  const [adminEdit, setAdminEdit] = useState<AdminEditState>({
    full_name: user.full_name ?? "",
    email: displayEmail,
  });

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
    setLearnerEdit({
      first_name: user.lead?.first_name ?? "",
      last_name: user.lead?.last_name ?? "",
      email: displayEmail,
      phone: user.lead?.phone ?? "",
    });
    setStaffEdit({
      full_name: user.full_name ?? "",
      email: displayEmail,
      role: (["manager", "content_manager"].includes(user.role) ? user.role : "manager") as StaffRole,
    });
    setAdminEdit({ full_name: user.full_name ?? "", email: displayEmail });
  }

  function saveChanges() {
    setSaveError(null);
    startTransition(async () => {
      if (isLearner) {
        const r = await updateLearnerAction(user.id, displayEmail || null, {
          first_name: learnerEdit.first_name,
          last_name: learnerEdit.last_name,
          email: learnerEdit.email,
          phone: learnerEdit.phone,
        });
        if (r.error) { setSaveError(r.error); return; }
      } else if (isStaff) {
        const nameChanged = staffEdit.full_name.trim() !== (user.full_name ?? "");
        const roleChanged = staffEdit.role !== user.role;
        const emailChanged =
          staffEdit.email.trim().toLowerCase() !== displayEmail.toLowerCase();

        if (nameChanged) {
          const r = await updateUserNameAction(user.id, staffEdit.full_name);
          if (r.error) { setSaveError(r.error); return; }
        }
        if (emailChanged) {
          const r = await updateUserEmailAction(user.id, staffEdit.email);
          if (r.error) { setSaveError(r.error); return; }
        }
        if (roleChanged) {
          const r = await setUserRoleAction(user.id, staffEdit.role);
          if (r.error) { setSaveError(r.error); return; }
        }
      } else if (isAdmin && !isSelf) {
        const nameChanged = adminEdit.full_name.trim() !== (user.full_name ?? "");
        const emailChanged =
          adminEdit.email.trim().toLowerCase() !== displayEmail.toLowerCase();
        if (nameChanged) {
          const r = await updateUserNameAction(user.id, adminEdit.full_name);
          if (r.error) { setSaveError(r.error); return; }
        }
        if (emailChanged) {
          const r = await updateUserEmailAction(user.id, adminEdit.email);
          if (r.error) { setSaveError(r.error); return; }
        }
      }

      setEditing(false);
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
      {/* Header */}
      <div className="border-b border-hairline p-6 pt-14">
        <div className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[18px] font-semibold text-ink">
            {initials(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold text-ink leading-snug">
              {user.full_name ?? "(no name)"}
              {isSelf && <span className="ml-1.5 text-[12px] font-normal text-ink-muted">you</span>}
            </p>
            <p className="truncate text-[13px] text-ink-muted">{user.email ?? user.lead?.email ?? "—"}</p>
            <div className="mt-1.5">
              <RoleBadge role={user.role as "learner" | "manager" | "content_manager" | "admin"} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 p-6">
        {editing ? (
          /* ── Edit mode ── */
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Editing details</p>

            {isLearner && (
              <div className="space-y-3">
                <EditField
                  label="First name"
                  value={learnerEdit.first_name}
                  onChange={(v) => setLearnerEdit((s) => ({ ...s, first_name: v }))}
                />
                <EditField
                  label="Last name"
                  value={learnerEdit.last_name}
                  onChange={(v) => setLearnerEdit((s) => ({ ...s, last_name: v }))}
                />
                <EditField
                  label="Email"
                  type="email"
                  value={learnerEdit.email}
                  placeholder="user@example.com"
                  onChange={(v) => setLearnerEdit((s) => ({ ...s, email: v }))}
                />
                <EditField
                  label="Phone"
                  value={learnerEdit.phone}
                  placeholder="+971 50 123 4567"
                  onChange={(v) => setLearnerEdit((s) => ({ ...s, phone: v }))}
                />
                <p className="text-[11px] text-ink-muted">
                  Display name will be set to <strong className="text-ink">
                    {[learnerEdit.first_name.trim(), learnerEdit.last_name.trim()].filter(Boolean).join(" ") || "—"}
                  </strong>
                </p>
              </div>
            )}

            {isStaff && (
              <div className="space-y-3">
                <EditField
                  label="Full name"
                  value={staffEdit.full_name}
                  onChange={(v) => setStaffEdit((s) => ({ ...s, full_name: v }))}
                />
                <EditField
                  label="Email"
                  type="email"
                  value={staffEdit.email}
                  onChange={(v) => setStaffEdit((s) => ({ ...s, email: v }))}
                />
                {!isSelf && (
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-medium text-ink-muted">Role</Label>
                    <select
                      value={staffEdit.role}
                      onChange={(e) => setStaffEdit((s) => ({ ...s, role: e.target.value as StaffRole }))}
                      className="h-9 w-full rounded-md border border-hairline bg-surface-raised px-2.5 text-[14px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="manager">Manager</option>
                      <option value="content_manager">Content Manager</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {isAdmin && !isSelf && (
              <div className="space-y-3">
                <EditField
                  label="Full name"
                  value={adminEdit.full_name}
                  onChange={(v) => setAdminEdit((s) => ({ ...s, full_name: v }))}
                />
                <EditField
                  label="Email"
                  type="email"
                  value={adminEdit.email}
                  onChange={(v) => setAdminEdit((s) => ({ ...s, email: v }))}
                />
              </div>
            )}

            {saveError && <p className="text-[12px] text-destructive">{saveError}</p>}

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={saveChanges} disabled={pending} className="h-8 text-[12px]">
                {pending ? "Saving…" : "Save changes"}
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={pending} className="h-8 text-[12px]">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <>
            {/* Lead contact section — shown first for learners with a lead record */}
            {user.lead && (
              <Section title="Contact">
                <FieldRow label="First name" value={user.lead.first_name} />
                <FieldRow label="Last name" value={user.lead.last_name} />
                <FieldRow label="Email" value={user.lead.email} />
                <FieldRow label="Phone" value={user.lead.phone} />
                <FieldRow
                  label="Plan"
                  value={user.plan_key ? <span className="capitalize">{user.plan_key}</span> : null}
                />
                <FieldRow
                  label="Verified"
                  value={
                    user.lead.is_verified ? (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        {user.lead.verified_at ? formatDate(user.lead.verified_at) : "Yes"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-500">
                        <XCircle className="size-3.5" aria-hidden />
                        Not verified
                      </span>
                    )
                  }
                />
                <FieldRow label="Registered" value={formatDate(user.lead.registered_at)} />
                {user.lead.source && (
                  <FieldRow label="Source" value={<span className="capitalize">{user.lead.source.replace(/_/g, " ")}</span>} />
                )}
              </Section>
            )}

            <Section title="Account">
              {/* Show email from profile only if no lead (lead already shows it above) */}
              {!user.lead && <FieldRow label="Email" value={user.email} />}
              <FieldRow label="Role" value={ROLE_LABEL[user.role]} />
              {!user.lead && user.plan_key && (
                <FieldRow label="Plan" value={<span className="capitalize">{user.plan_key}</span>} />
              )}
              <FieldRow label="Joined" value={formatDate(user.created_at)} />
              {user.updated_at && (
                <FieldRow label="Last updated" value={formatDate(user.updated_at)} />
              )}
            </Section>
          </>
        )}
      </div>

      {/* Footer actions */}
      {!editing && (
        <div className="border-t border-hairline p-6 space-y-3">
          {/* Edit button (not shown for self-admin) */}
          {!(isAdmin && isSelf) && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setEditing(true)}
            >
              Edit details
            </Button>
          )}

          {/* Delete */}
          {!isSelf && (
            !confirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                {deleteError && <p className="text-[12px] text-destructive">{deleteError}</p>}
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
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Reusable edit field ──────────────────────────────────────────────────────

function EditField({
  label,
  value,
  placeholder,
  type,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-ink-muted">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-[14px]"
      />
    </div>
  );
}
