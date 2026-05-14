"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  createInquiryAction,
  type CreateInquiryState,
} from "@/features/inquiries/server/actions";
import type { Area, PropertySubtype, PropertyType } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

type Prefill = {
  email?: string | null;
  phone?: string | null;
  areaId?: string | null;
  subarea?: string | null;
  typeId?: string | null;
  subtypeIds?: string[];
  sourceTopicId?: string;
};

export function InquiryForm({
  areas,
  types,
  subtypes,
  prefill,
  lockTaxonomy = false,
}: {
  areas: Area[];
  types: PropertyType[];
  subtypes: PropertySubtype[];
  prefill?: Prefill;
  lockTaxonomy?: boolean;
}) {
  const [state, action, pending] = useActionState<CreateInquiryState, FormData>(
    createInquiryAction,
    null,
  );

  const [areaId, setAreaId] = useState(prefill?.areaId ?? "");
  const [typeId, setTypeId] = useState(prefill?.typeId ?? "");
  const [pickedSubs, setPickedSubs] = useState<Set<string>>(
    new Set(prefill?.subtypeIds ?? []),
  );

  const filteredSubtypes = useMemo(
    () => (typeId ? subtypes.filter((s) => s.type_id === typeId) : []),
    [subtypes, typeId],
  );

  function toggleSub(id: string) {
    const next = new Set(pickedSubs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPickedSubs(next);
  }

  const fieldError = (name: string) =>
    state && "fieldErrors" in state ? state.fieldErrors?.[name] : undefined;

  return (
    <form action={action} className="space-y-5">
      {prefill?.sourceTopicId ? (
        <input type="hidden" name="source_topic_id" value={prefill.sourceTopicId} />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Area / Community" error={fieldError("area_id")}>
          <select
            name="area_id"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            disabled={lockTaxonomy}
            className="flex h-11 w-full rounded-md border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:border-accent"
          >
            <option value="">Any area</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Cluster / Building (optional)">
          <Input
            name="subarea"
            defaultValue={prefill?.subarea ?? ""}
            placeholder="e.g. Burj Khalifa"
            disabled={lockTaxonomy}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" error={fieldError("type_id")}>
          <select
            name="type_id"
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              setPickedSubs(new Set());
            }}
            disabled={lockTaxonomy}
            className="flex h-11 w-full rounded-md border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:border-accent"
          >
            <option value="">Any type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sub-types">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-hairline bg-surface-raised p-2">
            {filteredSubtypes.length === 0 ? (
              <p className="px-1 text-xs text-ink-muted">Pick a type first.</p>
            ) : (
              filteredSubtypes.map((s) => {
                const active = pickedSubs.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSub(s.id)}
                    disabled={lockTaxonomy}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200",
                      active
                        ? "bg-ink text-white"
                        : "bg-white text-ink-muted ring-1 ring-inset ring-hairline hover:bg-surface-subtle",
                      lockTaxonomy && "cursor-not-allowed opacity-70",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })
            )}
            {Array.from(pickedSubs).map((id) => (
              <input key={id} type="hidden" name="subtype_ids" value={id} />
            ))}
          </div>
        </Field>
      </div>

      <Field label="What are you looking for?" error={fieldError("description")}>
        <textarea
          name="description"
          rows={4}
          required
          placeholder="I have a buyer interested in Burj Khalifa looking for a 2BR around 8m…"
          className="flex w-full rounded-md border border-hairline bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:border-accent focus:shadow-focus"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={fieldError("email")}>
          <Input
            name="email"
            type="email"
            required
            defaultValue={prefill?.email ?? ""}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone (optional)">
          <Input
            name="phone"
            defaultValue={prefill?.phone ?? ""}
            placeholder="+971 50 …"
          />
        </Field>
      </div>

      {state && "error" in state && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Post inquiry"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
