"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  deleteAreaAction,
  setAreaEducatorAction,
  updateAreaAction,
} from "@/features/taxonomy/server/actions";
import type { Area } from "@/features/topics/types";

type Educator = { id: string; full_name: string | null };

export function AreaRow({
  area,
  educators,
}: {
  area: Area & { description?: string | null };
  educators: Educator[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateAreaAction(area.id, formData);
      if (res.error) setError(res.error);
      else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function setEducator(educatorId: string) {
    setError(null);
    startTransition(async () => {
      const res = await setAreaEducatorAction(area.id, educatorId || null);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Delete area "${area.name}"? Topics referencing it will lose their area.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAreaAction(area.id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-hairline bg-surface-raised p-4">
      {editing ? (
        <form action={save} className="space-y-2">
          <Input name="name" defaultValue={area.name} required placeholder="Name" />
          <Input name="slug" defaultValue={area.slug} required placeholder="slug" />
          <Input name="description" defaultValue={area.description ?? ""} placeholder="Description (optional)" />
          <div className="flex items-center gap-1.5">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Spinner className="size-3.5" /> : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{area.name}</p>
            <p className="truncate font-mono text-[11px] text-ink-muted">{area.slug}</p>
          </div>
          <select
            value={area.educator_id ?? ""}
            onChange={(e) => setEducator(e.target.value)}
            disabled={pending}
            aria-label="Assigned educator"
            className="h-9 rounded-md border border-hairline bg-surface-raised px-2.5 text-xs text-ink focus:outline-none focus:border-accent"
          >
            <option value="">— unassigned —</option>
            {educators.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.full_name ?? ed.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)} disabled={pending}>
            Edit
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending} className="text-destructive hover:bg-rose-50">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </li>
  );
}

export function NewAreaForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { createAreaAction } = await import("@/features/taxonomy/server/actions" as any);
      const res = await createAreaAction(null, formData);
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add area
      </Button>
    );
  }

  return (
    <form action={submit} className="space-y-2 rounded-lg border border-hairline bg-surface-raised p-3">
      <Input name="name" required placeholder="Area name (e.g. Downtown)" autoFocus />
      <Input name="slug" required placeholder="slug (downtown)" />
      <Input name="description" placeholder="Description (optional)" />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex items-center gap-1.5">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-3.5" /> : "Create"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
