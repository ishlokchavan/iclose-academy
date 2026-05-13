"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  type ActionState,
  createTrackAction,
} from "@/features/educator/server/actions";
import { slugify } from "@/features/educator/schemas";

type Taxonomy = { id: string; slug: string; name: string };

export function CreateTrackForm({
  specialties,
  levels,
}: {
  specialties: Taxonomy[];
  levels: Taxonomy[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createTrackAction,
    null,
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const fieldError = (name: string) =>
    state && "fieldErrors" in state ? state.fieldErrors?.[name] : undefined;

  return (
    <form action={action} className="space-y-5">
      <Field label="Track title" htmlFor="title" error={fieldError("title")}>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Luxury Market Mastery"
          required
        />
      </Field>

      <Field label="URL slug" htmlFor="slug" error={fieldError("slug")} hint="Lowercase letters, numbers, and hyphens. This becomes the URL.">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-mono">/tracks/</span>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="luxury-market-mastery"
            required
          />
        </div>
      </Field>

      <Field label="Subtitle" htmlFor="subtitle" hint="A short tagline shown under the title.">
        <Input
          id="subtitle"
          name="subtitle"
          placeholder="How elite operators work the premium segment"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Specialty" htmlFor="specialty_id" error={fieldError("specialty_id")}>
          <Select id="specialty_id" name="specialty_id" required>
            <option value="">Choose specialty…</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Level" htmlFor="level_id" error={fieldError("level_id")}>
          <Select id="level_id" name="level_id" required>
            <option value="">Choose level…</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {state && "error" in state && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Create track"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
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
      className="flex h-11 w-full rounded-md border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink transition-colors duration-200 ease-luxury focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
