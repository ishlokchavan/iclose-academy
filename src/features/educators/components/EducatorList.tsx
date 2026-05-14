"use client";

import Image from "next/image";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  createEducatorAction,
  deleteEducatorAction,
  updateEducatorAction,
  type EducatorActionState,
} from "@/features/educators/server/actions";
import type { EducatorRecord } from "@/features/educators/server/queries";

// ─── New educator form ────────────────────────────────────────────────────────

export function NewEducatorForm() {
  const [state, action, pending] = useActionState<EducatorActionState, FormData>(
    createEducatorAction,
    null,
  );

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-hairline bg-surface-raised p-6 shadow-card">
      <h2 className="text-[15px] font-semibold text-ink">Add educator</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new-name">Name</Label>
          <Input id="new-name" name="name" required placeholder="Full name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-photo">Photo URL</Label>
          <Input id="new-photo" name="photo_url" type="url" placeholder="https://…" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-bio">Bio</Label>
        <textarea
          id="new-bio"
          name="bio"
          rows={2}
          placeholder="Short bio…"
          className="flex w-full rounded-lg border border-hairline bg-surface-raised px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
      {state?.error && <p className="text-[13px] text-destructive">{state.error}</p>}
      {state?.success && <p className="text-[13px] text-emerald-600">Educator added.</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Spinner /> : "Add educator"}
        </Button>
      </div>
    </form>
  );
}

// ─── Educator row with inline edit ────────────────────────────────────────────

export function EducatorRow({ educator }: { educator: EducatorRecord }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editState, editAction, editPending] = useActionState<EducatorActionState, FormData>(
    async (prev, fd) => {
      const res = await updateEducatorAction(educator.id, prev, fd);
      if (res?.success) setEditing(false);
      return res;
    },
    null,
  );

  async function handleDelete() {
    if (!confirm("Remove this educator? Topics linked to them will lose the reference.")) return;
    setDeleting(true);
    await deleteEducatorAction(educator.id);
  }

  if (editing) {
    return (
      <li className="rounded-2xl border border-accent/30 bg-surface-raised p-5 shadow-card">
        <form action={editAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" defaultValue={educator.name} required />
            </div>
            <div className="space-y-1.5">
              <Label>Photo URL</Label>
              <Input name="photo_url" type="url" defaultValue={educator.photo_url ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <textarea
              name="bio"
              rows={2}
              defaultValue={educator.bio ?? ""}
              className="flex w-full rounded-lg border border-hairline bg-surface-raised px-4 py-2.5 text-[15px] text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          {editState?.error && <p className="text-[13px] text-destructive">{editState.error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={editPending}>
              {editPending ? <Spinner /> : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-card">
      {educator.photo_url ? (
        <Image
          src={educator.photo_url}
          alt={educator.name}
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-subtle text-[15px] font-semibold text-ink">
          {educator.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">{educator.name}</p>
        {educator.bio && <p className="mt-0.5 text-[13px] text-ink-muted">{educator.bio}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Spinner /> : "Remove"}
        </Button>
      </div>
    </li>
  );
}
