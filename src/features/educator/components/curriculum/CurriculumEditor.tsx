"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { LessonEditForm } from "@/features/educator/components/curriculum/LessonEditForm";
import {
  createLessonAction,
  createModuleAction,
  deleteLessonAction,
  deleteModuleAction,
  moveLessonAction,
  moveModuleAction,
  updateModuleAction,
} from "@/features/educator/server/curriculum-actions";
import type { Chapter } from "@/features/educator/schemas/curriculum";
import { cn } from "@/lib/utils/cn";

type Lesson = {
  id: string;
  position: number;
  title: string;
  summary: string | null;
  youtube_id: string | null;
  duration_seconds: number | null;
  is_preview: boolean;
  chapters?: Chapter[];
  resources?: Array<{
    id: string;
    label: string;
    url: string | null;
    storage_path: string | null;
    kind: string;
  }>;
};

type Module = {
  id: string;
  position: number;
  title: string;
  summary: string | null;
  lessons: Lesson[];
};

export function CurriculumEditor({
  trackId,
  trackSlug,
  educatorUserId,
  modules,
}: {
  trackId: string;
  trackSlug: string;
  educatorUserId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);
  const [creatingLessonInModuleId, setCreatingLessonInModuleId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {modules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hairline bg-surface-subtle/40 px-6 py-12 text-center">
          <p className="text-sm text-ink-muted">
            No modules yet. Start by adding your first module.
          </p>
        </div>
      ) : null}

      {modules.map((mod, idx) => (
        <section
          key={mod.id}
          className="overflow-hidden rounded-lg border border-hairline bg-surface-raised"
        >
          {/* Module header */}
          <header className="flex items-start gap-3 border-b border-hairline bg-surface-subtle/50 px-5 py-4">
            <span className="mt-0.5 text-[11px] font-mono text-ink-muted">
              {String(idx + 1).padStart(2, "0")}
            </span>

            <div className="flex-1 min-w-0">
              {editingModuleId === mod.id ? (
                <ModuleInlineEdit
                  moduleId={mod.id}
                  trackSlug={trackSlug}
                  initialTitle={mod.title}
                  initialSummary={mod.summary ?? ""}
                  onDone={() => {
                    setEditingModuleId(null);
                    refresh();
                  }}
                />
              ) : (
                <div>
                  <h3 className="text-base font-semibold text-ink">{mod.title}</h3>
                  {mod.summary ? (
                    <p className="text-sm text-ink-muted">{mod.summary}</p>
                  ) : null}
                </div>
              )}
            </div>

            {editingModuleId === mod.id ? null : (
              <div className="flex shrink-0 items-center gap-0.5">
                <IconButton
                  label="Move up"
                  onClick={() =>
                    startTransition(async () => {
                      await moveModuleAction(mod.id, "up", trackSlug);
                      refresh();
                    })
                  }
                  disabled={pending || idx === 0}
                >
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton
                  label="Move down"
                  onClick={() =>
                    startTransition(async () => {
                      await moveModuleAction(mod.id, "down", trackSlug);
                      refresh();
                    })
                  }
                  disabled={pending || idx === modules.length - 1}
                >
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton
                  label="Edit module"
                  onClick={() => setEditingModuleId(mod.id)}
                  disabled={pending}
                >
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  label="Delete module"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete "${mod.title}" and all its lessons? This can't be undone.`,
                      )
                    ) {
                      startTransition(async () => {
                        await deleteModuleAction(mod.id, trackSlug);
                        refresh();
                      });
                    }
                  }}
                  disabled={pending}
                  danger
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            )}
          </header>

          {/* Lessons list */}
          <div className="divide-y divide-hairline">
            {mod.lessons.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-ink-muted">
                No lessons in this module yet.
              </p>
            ) : (
              mod.lessons.map((lesson, lIdx) => (
                <div key={lesson.id} className="px-5 py-3">
                  {editingLessonId === lesson.id ? (
                    <LessonEditForm
                      lesson={lesson}
                      trackSlug={trackSlug}
                      educatorUserId={educatorUserId}
                      initialChapters={lesson.chapters ?? []}
                      resources={lesson.resources ?? []}
                      onDone={() => {
                        setEditingLessonId(null);
                        refresh();
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-ink-muted">
                        {String(lIdx + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-ink">
                            {lesson.title}
                          </p>
                          {lesson.is_preview ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              <Eye className="size-2.5" /> Preview
                            </span>
                          ) : null}
                          {!lesson.youtube_id ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              No video
                            </span>
                          ) : null}
                        </div>
                        {lesson.summary ? (
                          <p className="truncate text-xs text-ink-muted">
                            {lesson.summary}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <IconButton
                          label="Move up"
                          onClick={() =>
                            startTransition(async () => {
                              await moveLessonAction(lesson.id, "up", trackSlug);
                              refresh();
                            })
                          }
                          disabled={pending || lIdx === 0}
                        >
                          <ArrowUp className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Move down"
                          onClick={() =>
                            startTransition(async () => {
                              await moveLessonAction(lesson.id, "down", trackSlug);
                              refresh();
                            })
                          }
                          disabled={pending || lIdx === mod.lessons.length - 1}
                        >
                          <ArrowDown className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Edit lesson"
                          onClick={() => setEditingLessonId(lesson.id)}
                          disabled={pending}
                        >
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Delete lesson"
                          onClick={() => {
                            if (confirm(`Delete "${lesson.title}"?`)) {
                              startTransition(async () => {
                                await deleteLessonAction(lesson.id, trackSlug);
                                refresh();
                              });
                            }
                          }}
                          disabled={pending}
                          danger
                        >
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Add lesson */}
            <div className="bg-surface-subtle/30 px-5 py-3">
              {creatingLessonInModuleId === mod.id ? (
                <AddLessonInline
                  moduleId={mod.id}
                  trackSlug={trackSlug}
                  onDone={() => {
                    setCreatingLessonInModuleId(null);
                    refresh();
                  }}
                />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreatingLessonInModuleId(mod.id)}
                >
                  <Plus className="size-4" /> Add lesson
                </Button>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Add module */}
      <div>
        {creatingModule ? (
          <AddModuleInline
            trackId={trackId}
            trackSlug={trackSlug}
            onDone={() => {
              setCreatingModule(false);
              refresh();
            }}
          />
        ) : (
          <Button type="button" variant="secondary" onClick={() => setCreatingModule(true)}>
            <Plus className="size-4" /> Add module
          </Button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-md text-ink-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        danger
          ? "hover:bg-rose-50 hover:text-destructive"
          : "hover:bg-surface-subtle hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

// ----------------------------------------------------------------------------
// Inline forms
// ----------------------------------------------------------------------------
function ModuleInlineEdit({
  moduleId,
  trackSlug,
  initialTitle,
  initialSummary,
  onDone,
}: {
  moduleId: string;
  trackSlug: string;
  initialTitle: string;
  initialSummary: string;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await updateModuleAction(moduleId, trackSlug, formData);
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <form action={onSubmit} className="space-y-2">
      <Input name="title" defaultValue={initialTitle} required placeholder="Module title" />
      <Input name="summary" defaultValue={initialSummary} placeholder="Optional one-line summary" />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex items-center gap-1.5">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />} Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
          <X className="size-3.5" /> Cancel
        </Button>
      </div>
    </form>
  );
}

function AddModuleInline({
  trackId,
  trackSlug,
  onDone,
}: {
  trackId: string;
  trackSlug: string;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createModuleAction(trackId, trackSlug, formData);
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <form
      action={onSubmit}
      className="space-y-2 rounded-lg border border-hairline bg-surface-raised p-4"
    >
      <Label htmlFor="new-module-title" className="text-xs">
        New module
      </Label>
      <Input
        id="new-module-title"
        name="title"
        autoFocus
        required
        placeholder="e.g. Reading the Market"
      />
      <Input name="summary" placeholder="Optional one-line summary" />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex items-center gap-1.5">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-3.5" /> : "Add module"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddLessonInline({
  moduleId,
  trackSlug,
  onDone,
}: {
  moduleId: string;
  trackSlug: string;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createLessonAction(moduleId, trackSlug, formData);
      if (res.error) setError(res.error);
      else onDone();
    });
  }

  return (
    <form action={onSubmit} className="flex items-center gap-2">
      <Input name="title" autoFocus required placeholder="Lesson title" className="h-9" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Spinner className="size-3.5" /> : "Add"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
        Cancel
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
