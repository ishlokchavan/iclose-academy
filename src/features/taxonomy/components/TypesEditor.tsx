"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toSlug } from "@/features/taxonomy/utils";
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
    <div className="space-y-3">
      {types.length === 0 && (
        <p className="rounded-xl border border-hairline bg-surface-subtle px-4 py-8 text-center text-[14px] text-ink-muted">
          No property types yet.
        </p>
      )}
      {types.map((t) => (
        <TypeCard
          key={t.id}
          type={t}
          subtypes={subtypes.filter((s) => s.type_id === t.id)}
        />
      ))}
      <NewTypeForm />
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
  const [confirmDel, setConfirmDel] = useState(false);
  const [subName, setSubName] = useState("");

  function removeType() {
    setError(null);
    startTransition(async () => {
      const res = await deleteTypeAction(type.id);
      if (res.error) { setError(res.error); setConfirmDel(false); }
      else router.refresh();
    });
  }

  function addSubtype(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createSubtypeAction(type.id, null, formData);
      if (res.error) setError(res.error);
      else { setShowAdd(false); setSubName(""); router.refresh(); }
    });
  }

  function removeSubtype(subtypeId: string) {
    setError(null);
    startTransition(async () => {
      const res = await deleteSubtypeAction(subtypeId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-raised shadow-card">
      {/* Type header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <p className="flex-1 text-[15px] font-semibold text-ink">{type.name}</p>
        {confirmDel ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-ink-muted">Delete this type?</span>
            <Button
              type="button"
              size="sm"
              onClick={removeType}
              disabled={pending}
              className="h-7 bg-destructive text-[12px] text-white hover:bg-destructive/90"
            >
              {pending ? <Spinner className="size-3" /> : "Yes, delete"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDel(false)}
              disabled={pending}
              className="h-7 text-[12px]"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmDel(true)}
            disabled={pending}
            className="h-7 text-[12px] text-destructive hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        )}
      </div>

      {/* Subtypes as chips */}
      <div className="border-t border-hairline px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {subtypes.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-1 text-[12px] font-medium text-ink ring-1 ring-inset ring-hairline"
            >
              {s.name}
              <button
                type="button"
                aria-label={`Remove ${s.name}`}
                onClick={() => removeSubtype(s.id)}
                disabled={pending}
                className="ml-0.5 text-ink-muted transition-colors hover:text-destructive disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}

          {/* Inline add-subtype form as a chip */}
          {showAdd ? (
            <form
              action={addSubtype}
              className="inline-flex items-center gap-1.5"
            >
              <Input
                name="name"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                required
                placeholder="Specialisation name"
                autoFocus
                className="h-7 w-40 text-[12px]"
              />
              <input type="hidden" name="slug" value={toSlug(subName)} />
              <Button
                type="submit"
                size="sm"
                disabled={pending || !subName.trim()}
                className="h-7 text-[12px]"
              >
                {pending ? <Spinner className="size-3" /> : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setShowAdd(false); setSubName(""); }}
                className="h-7 text-[12px]"
              >
                <X className="size-3" />
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-hairline px-2.5 py-1 text-[12px] text-ink-muted transition-colors hover:border-ink-muted hover:text-ink disabled:opacity-50"
            >
              <Plus className="size-3" /> Add specialisation
            </button>
          )}
        </div>
        {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}

function NewTypeForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nameVal, setNameVal] = useState("");

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createTypeAction(null, formData);
      if (res.error) setError(res.error);
      else { setOpen(false); setNameVal(""); router.refresh(); }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        + Add property type
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface-raised p-4 shadow-card">
      <p className="mb-3 text-[13px] font-semibold text-ink">New property type</p>
      <form action={submit} className="flex items-end gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[11px] font-medium text-ink-muted">
            Type name
          </label>
          <Input
            name="name"
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            required
            placeholder="e.g. Residential"
            autoFocus
          />
          <input type="hidden" name="slug" value={toSlug(nameVal)} />
        </div>
        <Button type="submit" size="sm" disabled={pending || !nameVal.trim()}>
          {pending ? <Spinner className="size-3.5" /> : "Add"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setOpen(false); setNameVal(""); }}
        >
          Cancel
        </Button>
      </form>
      {error && <p className="mt-2 text-[12px] text-destructive">{error}</p>}
    </div>
  );
}
