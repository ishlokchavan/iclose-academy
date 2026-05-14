"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  createSubtypeAction,
  createTypeAction,
  deleteSubtypeAction,
  deleteTypeAction,
} from "@/features/taxonomy/server/actions";
import type { PropertySubtype, PropertyType } from "@/features/topics/types";

export function TypesEditor({
  types,
  subtypes,
}: {
  types: PropertyType[];
  subtypes: PropertySubtype[];
}) {
  return (
    <div className="space-y-4">
      <NewTypeForm />
      <div className="space-y-3">
        {types.map((t) => (
          <TypeCard
            key={t.id}
            type={t}
            subtypes={subtypes.filter((s) => s.type_id === t.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TypeCard({
  type,
  subtypes,
}: {
  type: PropertyType;
  subtypes: PropertySubtype[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  function removeType() {
    if (!confirm(`Delete type "${type.name}" and all its sub-types?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteTypeAction(type.id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function addSubtype(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createSubtypeAction(type.id, null, formData);
      if (res.error) setError(res.error);
      else {
        setShowAdd(false);
        router.refresh();
      }
    });
  }

  function removeSubtype(subtypeId: string, name: string) {
    if (!confirm(`Delete sub-type "${name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteSubtypeAction(subtypeId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-hairline bg-surface-raised">
      <header className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{type.name}</p>
          <p className="font-mono text-[11px] text-ink-muted">{type.slug}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={removeType} disabled={pending} className="text-destructive hover:bg-rose-50">
          <Trash2 className="size-3.5" />
        </Button>
      </header>

      <ul className="divide-y divide-hairline">
        {subtypes.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{s.name}</p>
              <p className="truncate font-mono text-[11px] text-ink-muted">{s.slug}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSubtype(s.id, s.name)}
              disabled={pending}
              className="text-destructive hover:bg-rose-50"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        ))}
        {subtypes.length === 0 ? (
          <li className="px-4 py-3 text-xs italic text-ink-muted">
            No sub-types yet.
          </li>
        ) : null}
      </ul>

      <div className="border-t border-hairline bg-surface-subtle/30 p-3">
        {showAdd ? (
          <form action={addSubtype} className="flex flex-col gap-1.5 sm:flex-row">
            <Input name="name" required placeholder="Sub-type name" className="h-9" autoFocus />
            <Input name="slug" required placeholder="slug" className="h-9 sm:w-40" />
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Spinner className="size-3.5" /> : "Add"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)} disabled={pending}>
              Cancel
            </Button>
          </form>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(true)} disabled={pending}>
            <Plus className="size-3.5" /> Add sub-type
          </Button>
        )}
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </section>
  );
}

function NewTypeForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createTypeAction(null, formData);
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
        + Add type
      </Button>
    );
  }
  return (
    <form action={submit} className="space-y-2 rounded-lg border border-hairline bg-surface-raised p-3">
      <Input name="name" required placeholder="Type (e.g. Mixed-Use)" autoFocus />
      <Input name="slug" required placeholder="slug" />
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
