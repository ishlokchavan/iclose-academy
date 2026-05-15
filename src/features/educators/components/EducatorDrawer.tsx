"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  deleteEducatorAction,
  updateEducatorAction,
} from "@/features/educators/server/actions";
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

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-x-3 py-2">
      <span className="text-[12px] font-medium text-ink-muted pt-px">{label}</span>
      <span className="text-[13px] text-ink break-words">
        {value ?? <span className="text-ink-muted">—</span>}
      </span>
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

function EditField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-medium text-ink-muted">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// ─── Drawer body ──────────────────────────────────────────────────────────────

function DrawerBody({
  educator,
  onClose,
}: {
  educator: EducatorRecord;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    first_name: educator.first_name ?? "",
    last_name:  educator.last_name ?? "",
    email:      educator.email ?? "",
    phone:      educator.phone ?? "",
    bio:        educator.bio ?? "",
    expertise:  educator.expertise ?? "",
    photo_url:  educator.photo_url ?? "",
  });

  function cancelEdit() {
    setEditing(false);
    setSaveError(null);
    setForm({
      first_name: educator.first_name ?? "",
      last_name:  educator.last_name ?? "",
      email:      educator.email ?? "",
      phone:      educator.phone ?? "",
      bio:        educator.bio ?? "",
      expertise:  educator.expertise ?? "",
      photo_url:  educator.photo_url ?? "",
    });
  }

  function saveChanges() {
    setSaveError(null);
    startTransition(async () => {
      const r = await updateEducatorAction(educator.id, form);
      if (r.error) { setSaveError(r.error); return; }
      setEditing(false);
      onClose();
    });
  }

  async function handleDelete() {
    setDeleting(true);
    const r = await deleteEducatorAction(educator.id);
    if (r.error) { setSaveError(r.error); setDeleting(false); return; }
    onClose();
  }

  const previewName = [form.first_name.trim(), form.last_name.trim()].filter(Boolean).join(" ") || "—";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-hairline p-6 pb-5">
        <div className="flex items-start gap-4">
          {educator.photo_url ? (
            <Image
              src={educator.photo_url}
              alt={educator.name}
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="grid size-14 shrink-0 place-items-center rounded-full border border-hairline bg-surface-subtle text-[18px] font-semibold text-ink">
              {initials(educator)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[17px] font-semibold text-ink leading-snug">{educator.name}</p>
            <p className="truncate text-[13px] text-ink-muted">{educator.email ?? "—"}</p>
            {educator.expertise && (
              <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-ink-muted">{educator.expertise}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        {editing ? (
          /* ── Edit mode ── */
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Editing details</p>
            <div className="grid grid-cols-2 gap-3">
              <EditField
                label="First name"
                value={form.first_name}
                onChange={(v) => setForm((s) => ({ ...s, first_name: v }))}
                placeholder="First"
              />
              <EditField
                label="Last name"
                value={form.last_name}
                onChange={(v) => setForm((s) => ({ ...s, last_name: v }))}
                placeholder="Last"
              />
            </div>
            <p className="text-[11px] text-ink-muted -mt-1">
              Display name will be <strong className="text-ink">{previewName}</strong>
            </p>
            <EditField
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm((s) => ({ ...s, email: v }))}
              placeholder="name@company.ae"
            />
            <EditField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
              placeholder="+971 50 123 4567"
            />
            <EditField
              label="Expertise"
              value={form.expertise}
              onChange={(v) => setForm((s) => ({ ...s, expertise: v }))}
              placeholder="e.g. Luxury Residential"
            />
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-ink-muted">Bio</Label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                rows={3}
                placeholder="Short bio…"
                className="flex w-full rounded-lg border border-hairline bg-surface-raised px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <EditField
              label="Photo URL"
              type="url"
              value={form.photo_url}
              onChange={(v) => setForm((s) => ({ ...s, photo_url: v }))}
              placeholder="https://…"
            />
            {saveError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12px] text-red-600">{saveError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={saveChanges} disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="secondary" onClick={cancelEdit} disabled={isPending}>Cancel</Button>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <>
            <Section title="Contact">
              <FieldRow label="Email"     value={educator.email} />
              <FieldRow label="Phone"     value={educator.phone} />
            </Section>
            <Section title="Profile">
              <FieldRow label="Expertise" value={educator.expertise} />
              <FieldRow label="Bio"       value={educator.bio} />
            </Section>
            <Section title="Meta">
              <FieldRow label="Added"        value={formatDate(educator.created_at)} />
              <FieldRow label="Last updated"  value={formatDate(educator.updated_at)} />
            </Section>
          </>
        )}
      </div>

      {/* Footer actions */}
      {!editing && (
        <div className="border-t border-hairline p-5 space-y-2">
          <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
            Edit details
          </Button>
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-[12px] text-center text-ink-muted">
                Topics linked to this educator will lose the reference. Continue?
              </p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full text-center text-[13px] font-medium text-destructive hover:underline py-1"
            >
              Delete educator…
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Public drawer component ──────────────────────────────────────────────────

export function EducatorDrawer({
  educator,
  onClose,
}: {
  educator: EducatorRecord | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!educator} onOpenChange={(open) => { if (!open) onClose(); }}>
      {educator ? (
        <SheetContent title="Educator details" description="View and edit educator profile">
          <DrawerBody educator={educator} onClose={onClose} />
        </SheetContent>
      ) : null}
    </Sheet>
  );
}
