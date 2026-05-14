"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  createTopicAction,
  updateTopicAction,
  type TopicActionState,
} from "@/features/topics/server/actions";
import { slugify } from "@/features/topics/schemas";
import type { Area, PropertySubtype, PropertyType } from "@/features/topics/types";
import { cn } from "@/lib/utils/cn";

type Mode = "create" | "update";

type Defaults = {
  title?: string;
  slug?: string;
  description?: string | null;
  youtube_id?: string | null;
  area_id?: string | null;
  subarea?: string | null;
  type_id?: string | null;
  subtype_ids?: string[];
};

export function TopicForm({
  mode,
  topicId,
  defaults,
  areas,
  types,
  subtypes,
}: {
  mode: Mode;
  topicId?: string;
  defaults?: Defaults;
  areas: Area[];
  types: PropertyType[];
  subtypes: PropertySubtype[];
}) {
  const router = useRouter();

  const [state, action, pending] = useActionState<TopicActionState, FormData>(
    async (prev, formData) => {
      if (mode === "create") return createTopicAction(prev, formData);
      if (!topicId) return { error: "Missing topic id" };
      const result = await updateTopicAction(topicId, prev, formData);
      if (result && "success" in result && result.success && result.slug !== defaults?.slug) {
        router.replace(`/educator/topics/${result.slug}/edit`);
      }
      return result;
    },
    null,
  );

  const [title, setTitle] = useState(defaults?.title ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!defaults?.slug);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const [typeId, setTypeId] = useState(defaults?.type_id ?? "");
  const [picked, setPicked] = useState<Set<string>>(
    new Set(defaults?.subtype_ids ?? []),
  );

  const filteredSubtypes = useMemo(
    () => (typeId ? subtypes.filter((s) => s.type_id === typeId) : []),
    [subtypes, typeId],
  );

  function toggleSub(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPicked(next);
  }

  const fieldError = (name: string) =>
    state && "fieldErrors" in state ? state.fieldErrors?.[name] : undefined;
  const success = state && "success" in state && state.success;

  return (
    <form action={action} className="space-y-6">
      <Section title="Basics">
        <Field label="Title" error={fieldError("title")}>
          <Input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. 1450 sq.ft 2BED + Maid in JVC"
          />
        </Field>
        <Field
          label="URL slug"
          error={fieldError("slug")}
          hint="Auto-generated from the title. Editable."
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-muted">/topics/</span>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              required
            />
          </div>
        </Field>

        <Field label="Description" hint="What learners will get out of this video.">
          <textarea
            name="description"
            rows={4}
            defaultValue={defaults?.description ?? ""}
            className="flex w-full rounded-md border border-hairline bg-surface-raised px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-accent focus:shadow-focus"
          />
        </Field>

        <Field
          label="YouTube video ID"
          error={fieldError("youtube_id")}
          hint="11-character ID from the youtu.be/… or watch?v=… URL."
        >
          <Input
            name="youtube_id"
            defaultValue={defaults?.youtube_id ?? ""}
            placeholder="n9eQujKP-Xs"
          />
        </Field>
      </Section>

      <Section title="Taxonomy" description="How learners filter to your topic.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Area / Community" error={fieldError("area_id")}>
            <Select name="area_id" defaultValue={defaults?.area_id ?? ""}>
              <option value="">No area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cluster / Building (optional)">
            <Input
              name="subarea"
              defaultValue={defaults?.subarea ?? ""}
              placeholder="e.g. Burj Khalifa"
            />
          </Field>
        </div>

        <Field label="Type" error={fieldError("type_id")}>
          <Select
            name="type_id"
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              setPicked(new Set());
            }}
          >
            <option value="">No type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Sub-types" hint="Pick any that apply. Visible after selecting a type.">
          <div className="flex flex-wrap gap-1.5 rounded-md border border-hairline bg-surface-raised p-3">
            {filteredSubtypes.length === 0 ? (
              <p className="px-1 text-xs text-ink-muted">Choose a type to see sub-types.</p>
            ) : (
              filteredSubtypes.map((s) => {
                const active = picked.has(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSub(s.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200",
                      active
                        ? "bg-ink text-white"
                        : "bg-white text-ink-muted ring-1 ring-inset ring-hairline hover:bg-surface-subtle",
                    )}
                  >
                    {s.name}
                  </button>
                );
              })
            )}
            {Array.from(picked).map((id) => (
              <input key={id} type="hidden" name="subtype_ids" value={id} />
            ))}
          </div>
        </Field>
      </Section>

      {state && "error" in state && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {success ? <p className="text-sm text-emerald-600">Saved.</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : mode === "create" ? "Create topic" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-hairline bg-surface-raised p-6">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description ? <p className="text-xs text-ink-muted">{description}</p> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="flex h-11 w-full rounded-md border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
