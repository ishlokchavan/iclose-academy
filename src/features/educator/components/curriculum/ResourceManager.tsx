"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { File, Link2, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  createFileResourceAction,
  createLinkResourceAction,
  deleteResourceAction,
} from "@/features/educator/server/resource-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

const BUCKET = "lesson-resources";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB — matches bucket limit

type ResourceRow = {
  id: string;
  label: string;
  url: string | null;
  storage_path: string | null;
  kind: string;
};

export function ResourceManager({
  lessonId,
  trackSlug,
  userId,
  resources,
}: {
  lessonId: string;
  trackSlug: string;
  userId: string;
  resources: ResourceRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState<"link" | "file" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUpload, setPendingUpload] = useState(false);
  const [fileLabel, setFileLabel] = useState("");

  function refresh() {
    router.refresh();
  }

  function addLink(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createLinkResourceAction(lessonId, trackSlug, formData);
      if (res.error) setError(res.error);
      else {
        setAdding(null);
        refresh();
      }
    });
  }

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File too large. Max 25 MB.");
      return;
    }
    setPendingUpload(true);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 60);
    const path = `${userId}/${lessonId}/${Date.now()}-${safeName}.${ext}`;

    const supabase = createSupabaseBrowserClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setPendingUpload(false);
      return;
    }

    const label = fileLabel.trim() || file.name;
    const res = await createFileResourceAction(lessonId, trackSlug, {
      label,
      storage_path: path,
    });
    setPendingUpload(false);
    if (res.error) {
      setError(res.error);
      // best-effort cleanup of orphan file
      await supabase.storage.from(BUCKET).remove([path]);
      return;
    }
    setFileLabel("");
    setAdding(null);
    refresh();
  }

  function remove(id: string) {
    if (!confirm("Remove this resource?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteResourceAction(id, trackSlug);
      if (res.error) setError(res.error);
      else refresh();
    });
  }

  const busy = pending || pendingUpload;

  return (
    <div className="space-y-2">
      {resources.length === 0 && !adding ? (
        <p className="text-xs italic text-ink-muted">
          No resources yet. Attach external links or upload files (PDFs, slides, worksheets).
        </p>
      ) : null}

      {resources.length > 0 ? (
        <ul className="space-y-1.5">
          {resources.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-md border border-hairline bg-surface-raised px-3 py-2"
            >
              {r.kind === "link" ? (
                <Link2 className="size-4 shrink-0 text-ink-muted" />
              ) : (
                <File className="size-4 shrink-0 text-ink-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{r.label}</p>
                <p className="truncate text-[11px] font-mono text-ink-muted">
                  {r.url ?? r.storage_path}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(r.id)}
                disabled={busy}
                aria-label="Remove"
                className={cn(
                  "grid size-8 place-items-center rounded-md text-ink-muted transition-colors",
                  "hover:bg-rose-50 hover:text-destructive disabled:opacity-30",
                )}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {adding === "link" ? (
        <form
          action={addLink}
          className="space-y-2 rounded-md border border-hairline bg-surface-raised p-3"
        >
          <Input name="label" autoFocus required placeholder="Label (e.g. Reference PDF)" />
          <Input name="url" required placeholder="https://…" />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <div className="flex items-center gap-1.5">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? <Spinner className="size-3.5" /> : "Add link"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(null);
                setError(null);
              }}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {adding === "file" ? (
        <div className="space-y-2 rounded-md border border-hairline bg-surface-raised p-3">
          <Input
            value={fileLabel}
            onChange={(e) => setFileLabel(e.target.value)}
            placeholder="Label (defaults to filename)"
          />
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
            >
              {busy ? <Spinner className="size-3.5" /> : <Upload className="size-3.5" />}
              Choose file
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(null);
                setError(null);
                setFileLabel("");
              }}
              disabled={busy}
            >
              Cancel
            </Button>
            <p className="ml-auto text-[11px] text-ink-muted">Max 25 MB · any file type</p>
          </div>
        </div>
      ) : null}

      {!adding ? (
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => setAdding("link")}>
            <Plus className="size-3.5" /> Add link
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setAdding("file")}>
            <Upload className="size-3.5" /> Upload file
          </Button>
        </div>
      ) : null}
    </div>
  );
}
