"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  type ActionState,
  updateTrackAction,
} from "@/features/educator/server/actions";
import type { EducatorTrackDetail } from "@/features/educator/server/queries";

type Taxonomy = { id: string; slug: string; name: string };

export function UpdateTrackForm({
  track,
  specialties,
  levels,
}: {
  track: EducatorTrackDetail;
  specialties: Taxonomy[];
  levels: Taxonomy[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await updateTrackAction(track.id, prev, formData);
      if (result && "success" in result && result.success && result.slug !== track.slug) {
        router.replace(`/educator/tracks/${result.slug}`);
      }
      return result;
    },
    null,
  );

  const fieldError = (name: string) =>
    state && "fieldErrors" in state ? state.fieldErrors?.[name] : undefined;
  const success = state && "success" in state && state.success;

  return (
    <form action={action} className="space-y-6">
      <Section title="Basics">
        <Field label="Track title" htmlFor="title" error={fieldError("title")}>
          <Input id="title" name="title" defaultValue={track.title} required />
        </Field>

        <Field label="URL slug" htmlFor="slug" error={fieldError("slug")} hint="Lowercase letters, numbers, hyphens.">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted font-mono">/tracks/</span>
            <Input id="slug" name="slug" defaultValue={track.slug} required />
          </div>
        </Field>

        <Field label="Subtitle" htmlFor="subtitle" hint="One-line tagline.">
          <Input id="subtitle" name="subtitle" defaultValue={track.subtitle ?? ""} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Specialty" htmlFor="specialty_id" error={fieldError("specialty_id")}>
            <Select id="specialty_id" name="specialty_id" defaultValue={track.specialty_id ?? ""} required>
              <option value="">Choose specialty…</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Level" htmlFor="level_id" error={fieldError("level_id")}>
            <Select id="level_id" name="level_id" defaultValue={track.level_id ?? ""} required>
              <option value="">Choose level…</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Marketing copy">
        <Field label="Summary" htmlFor="summary" hint="Shown on the library card. 1-2 sentences.">
          <Textarea id="summary" name="summary" rows={2} defaultValue={track.summary ?? ""} />
        </Field>

        <Field label="Description" htmlFor="description" hint="Long-form. Markdown supported.">
          <Textarea id="description" name="description" rows={6} defaultValue={track.description ?? ""} />
        </Field>

        <Field label="Total duration (minutes)" htmlFor="duration_minutes" hint="Estimate. Used to show total time on cards.">
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={0}
            defaultValue={track.duration_minutes ?? ""}
          />
        </Field>
      </Section>

      <Section title="Outcomes &amp; prerequisites" description="One item per line. Bullet points shown on the track page.">
        <Field label="What you'll learn" htmlFor="outcomes">
          <Textarea
            id="outcomes"
            name="outcomes"
            rows={5}
            placeholder={"Read supply/demand signals\nIdentify undervalued sub-districts\nConvert intelligence into client value"}
            defaultValue={track.outcomes.join("\n")}
          />
        </Field>

        <Field label="Prerequisites" htmlFor="prerequisites">
          <Textarea
            id="prerequisites"
            name="prerequisites"
            rows={3}
            placeholder={"RERA-licensed agent\nWorking knowledge of Dubai sub-districts"}
            defaultValue={track.prerequisites.join("\n")}
          />
        </Field>
      </Section>

      {state && "error" in state && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-600">Saved.</p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Save changes"}
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

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="flex w-full rounded-md border border-hairline bg-surface-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors duration-200 ease-luxury focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}
