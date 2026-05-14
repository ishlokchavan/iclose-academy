"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";

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
type AreaWithEducator = Area & { educator_id?: string | null };

/* ── Table shell ──────────────────────────────────────────────────────────── */
export function CommunitiesTable({
  areas,
  educators,
}: {
  areas: AreaWithEducator[];
  educators: Educator[];
}) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-raised shadow-card">
      {areas.length === 0 && !addOpen ? (
        <div className="px-6 py-12 text-center">
          <p className="text-[14px] text-ink-muted">No communities yet.</p>
          <p className="mt-1 text-[12px] text-ink-tertiary">Add your first community below.</p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline bg-surface-subtle/40">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                Community
              </th>
              <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary sm:table-cell">
                Specialist
              </th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {areas.map((area) => (
              <AreaRow key={area.id} area={area} educators={educators} />
            ))}
            {addOpen && (
              <NewAreaRow educators={educators} onClose={() => setAddOpen(false)} />
            )}
          </tbody>
        </table>
      )}

      {!addOpen && (
        <div className={areas.length > 0 ? "border-t border-hairline px-4 py-3" : "px-4 pb-4"}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAddOpen(true)}
            className="text-[13px]"
          >
            <Plus className="size-3.5" /> Add community
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Existing area row ────────────────────────────────────────────────────── */
function AreaRow({ area, educators }: { area: AreaWithEducator; educators: Educator[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, startTransition] = useTransition();
  const [nameVal, setNameVal] = useState(area.name);
  const [error, setError] = useState<string | null>(null);

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

  if (editing) {
    return (
      <tr className="bg-surface-subtle/30">
        <td colSpan={3} className="px-4 py-3">
          <form action={save}>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[160px] flex-1">
                <label className="mb-1 block text-[11px] font-medium text-ink-muted">Name</label>
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
                <div className="min-w-[160px] flex-1">
                  <label className="mb-1 block text-[11px] font-medium text-ink-muted">Specialist</label>
                  <select
                    name="educator_id"
                    defaultValue={area.educator_id ?? ""}
                    className="h-9 w-full rounded-lg border border-hairline bg-surface-raised px-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="">No specialist</option>
                    {educators.map((ed) => (
                      <option key={ed.id} value={ed.id}>{ed.full_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? <Spinner className="size-3.5" /> : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditing(false); setNameVal(area.name); setError(null); }}
                  disabled={pending}
                >
                  Cancel
                </Button>
              </div>
            </div>
            {error && <p className="mt-1.5 text-[12px] text-destructive">{error}</p>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="group">
      <td className="px-4 py-3">
        <p className="text-[14px] font-medium text-ink">{area.name}</p>
        {/* Show specialist on mobile where the column is hidden */}
        {assignedEd?.full_name && (
          <p className="mt-0.5 text-[12px] text-ink-muted sm:hidden">{assignedEd.full_name}</p>
        )}
        {error && <p className="mt-1 text-[12px] text-destructive">{error}</p>}
      </td>
      <td className="hidden px-4 py-3 text-[13px] text-ink-muted sm:table-cell">
        {assignedEd?.full_name ?? <span className="text-ink-tertiary">—</span>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {confirmDel ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={remove}
                disabled={pending}
                className="h-7 bg-destructive text-[12px] text-white hover:bg-destructive/90"
              >
                {pending ? <Spinner className="size-3" /> : "Confirm"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDel(false)}
                disabled={pending}
                className="h-7 text-[12px]"
              >
                <X className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setEditing(true); setConfirmDel(false); }}
                disabled={pending}
                className="h-7 text-[12px] text-ink-muted hover:text-ink"
                aria-label="Edit"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDel(true)}
                disabled={pending}
                className="h-7 text-[12px] text-ink-muted hover:bg-rose-50 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── New area row ─────────────────────────────────────────────────────────── */
function NewAreaRow({
  educators,
  onClose,
}: {
  educators: Educator[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [nameVal, setNameVal] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAreaAction(null, formData);
      if (res.error) setError(res.error);
      else { onClose(); router.refresh(); }
    });
  }

  return (
    <tr className="bg-surface-subtle/30">
      <td colSpan={3} className="px-4 py-3">
        <form action={submit}>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[160px] flex-1">
              <label className="mb-1 block text-[11px] font-medium text-ink-muted">Name</label>
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
              <div className="min-w-[160px] flex-1">
                <label className="mb-1 block text-[11px] font-medium text-ink-muted">Specialist</label>
                <select
                  name="educator_id"
                  className="h-9 w-full rounded-lg border border-hairline bg-surface-raised px-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                >
                  <option value="">No specialist</option>
                  {educators.map((ed) => (
                    <option key={ed.id} value={ed.id}>{ed.full_name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending || !nameVal.trim()}>
                {pending ? <Spinner className="size-3.5" /> : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={pending}
              >
                Cancel
              </Button>
            </div>
          </div>
          {error && <p className="mt-1.5 text-[12px] text-destructive">{error}</p>}
        </form>
      </td>
    </tr>
  );
}
