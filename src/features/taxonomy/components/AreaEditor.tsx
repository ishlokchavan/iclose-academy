"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toSlug } from "@/features/taxonomy/utils";
import {
  createAreaAction,
  deleteAreaAction,
  updateAreaAction,
} from "@/features/taxonomy/server/actions";
import type { Area } from "@/features/topics/types";

type Educator = { id: string; full_name: string | null };

export function AreaCard({
  area,
  educators,
}: {
  area: Area & { description?: string | null };
  educators: Educator[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [nameVal, setNameVal] = useState(area.name);

  const assignedEd = educators.find((e) => e.id === area.educator_id);

  function save(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateAreaAction(area.id, formData);
      if (res.error) setError(res.error);
      else { setEditing(false); router.refresh(); }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await deleteAreaAction(area.id);
      if (res.error) { setError(res.error); setConfirmDel(false); }
      else router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-raised p-4 shadow-card">
      {editing ? (
        <form action={save} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Community name
            </label>
            <Input
              name="name"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              required
              autoFocus
            />
            <input type="hidden" name="slug" value={toSlug(nameVal)} />
          </div>
          {educators.length > 0 && (
            <div>
              <label className="mb-1 block text-[11px] font-medium text-ink-muted">
                Specialist
              </label>
              <select
                name="educator_id"
                defaultValue={area.educator_id ?? ""}
                className="h-9 w-full rounded-lg border border-hairline bg-surface-raised px-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="">No specialist assigned</option>
                {educators.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.full_name ?? ed.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Spinner className="size-3.5" /> : "Save"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(false); setNameVal(area.name); }}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p className="truncate text-[15px] font-semibold text-ink">{area.name}</p>
          {assignedEd?.full_name && (
            <p className="mt-0.5 truncate text-[12px] text-ink-muted">{assignedEd.full_name}</p>
          )}
          <div className="mt-3 flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(true); setConfirmDel(false); }}
              disabled={pending}
              className="h-7 text-[12px]"
            >
              <Pencil className="size-3" /> Edit
            </Button>
            {confirmDel ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  onClick={remove}
                  disabled={pending}
                  className="h-7 bg-destructive text-[12px] text-white hover:bg-destructive/90"
                >
                  {pending ? <Spinner className="size-3" /> : "Confirm delete"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDel(false)}
                  disabled={pending}
                  className="h-7 text-[12px]"
                >
                  <X className="size-3" />
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDel(true)}
                disabled={pending}
                className="h-7 text-[12px] text-destructive hover:bg-rose-50"
              >
                <Trash2 className="size-3" /> Delete
              </Button>
            )}
          </div>
          {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
        </>
      )}
    </div>
  );
}

export function NewAreaForm({ educators }: { educators: Educator[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [educatorId, setEducatorId] = useState("");

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAreaAction(null, formData);
      if (res.error) setError(res.error);
      else { setOpen(false); setNameVal(""); setEducatorId(""); router.refresh(); }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add community
      </Button>
    );
  }

  return (
    <div className="col-span-full rounded-xl border border-hairline bg-surface-raised p-4 shadow-card">
      <p className="mb-3 text-[13px] font-semibold text-ink">New community</p>
      <form action={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink-muted">
            Community name
          </label>
          <Input
            name="name"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            required
            placeholder="e.g. Dubai Marina"
            autoFocus
          />
          <input type="hidden" name="slug" value={toSlug(nameVal)} />
        </div>
        {educators.length > 0 && (
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink-muted">
              Specialist (optional)
            </label>
            <select
              name="educator_id"
              value={educatorId}
              onChange={(e) => setEducatorId(e.target.value)}
              className="h-9 w-full rounded-lg border border-hairline bg-surface-raised px-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            >
              <option value="">No specialist assigned</option>
              {educators.map((ed) => (
                <option key={ed.id} value={ed.id}>
                  {ed.full_name ?? ed.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-[12px] text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending || !nameVal.trim()}>
            {pending ? <Spinner className="size-3.5" /> : "Add community"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { setOpen(false); setNameVal(""); }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

// Alias for backwards compatibility
export { AreaCard as AreaRow };
