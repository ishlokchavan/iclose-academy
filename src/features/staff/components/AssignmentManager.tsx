"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  createAssignmentAction,
  deleteAssignmentAction,
} from "@/features/staff/server/assignment-actions";
import type { EducatorAssignmentRow } from "@/features/staff/server/assignment-queries";
import type { Area, PropertyType } from "@/features/topics/types";

type Educator = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export function AssignmentManager({
  educator,
  assignments,
  areas,
  types,
}: {
  educator: Educator;
  assignments: EducatorAssignmentRow[];
  areas: Area[];
  types: PropertyType[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAssignmentAction(educator.id, formData);
      if (res.error) setError(res.error);
      else {
        setAdding(false);
        router.refresh();
      }
    });
  }

  function remove(id: string, summary: string) {
    if (!confirm(`Remove assignment: ${summary}?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAssignmentAction(id);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-hairline bg-surface-raised">
      <header className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <div className="grid size-10 place-items-center rounded-full border border-hairline bg-surface-subtle text-sm font-semibold text-ink">
          {(educator.full_name ?? educator.email ?? "U")
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {educator.full_name ?? "(no name)"}
          </p>
          <p className="truncate text-xs text-ink-muted">{educator.email ?? "—"}</p>
        </div>
      </header>

      <ul className="divide-y divide-hairline">
        {assignments.length === 0 ? (
          <li className="px-4 py-3 text-xs italic text-ink-muted">
            No assignments. Add one to start routing inquiries to this educator.
          </li>
        ) : (
          assignments.map((a) => {
            const summary = [a.area.name, a.type?.name, a.subarea]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{summary}</p>
                  <p className="text-[11px] text-ink-muted">
                    {a.type ? "Area + Type" : "Area only"}
                    {a.subarea ? " + Subarea" : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(a.id, summary)}
                  disabled={pending}
                  className="text-destructive hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t border-hairline bg-surface-subtle/30 p-3">
        {adding ? (
          <form action={add} className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-3">
              <Select name="area_id" required>
                <option value="">Pick area…</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
              <Select name="type_id">
                <option value="">Any type</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              <Input name="subarea" placeholder="Subarea (optional)" />
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
            <div className="flex items-center gap-1.5">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? <Spinner className="size-3.5" /> : "Add"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setError(null);
                }}
                disabled={pending}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> Add assignment
          </Button>
        )}
      </div>
    </section>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="flex h-9 w-full rounded-md border border-hairline bg-surface-raised px-2.5 text-sm text-ink focus:outline-none focus:border-accent"
    />
  );
}
