"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateTrackCoverAction } from "@/features/educator/server/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "track-covers";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB — matches storage bucket limit

export function CoverImageUploader({
  trackId,
  userId,
  initialUrl,
}: {
  trackId: string;
  userId: string;
  initialUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("File is too large. Max 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Pick an image file (PNG, JPEG, WebP, or AVIF).");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${userId}/${trackId}-${Date.now()}.${ext}`;

    const supabase = createSupabaseBrowserClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    startTransition(async () => {
      const res = await updateTrackCoverAction(trackId, publicUrl);
      if (res.error) {
        setError(res.error);
        return;
      }
      setUrl(publicUrl);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("Remove the cover image?")) return;
    setError(null);
    startTransition(async () => {
      const res = await updateTrackCoverAction(trackId, null);
      if (res.error) {
        setError(res.error);
        return;
      }
      setUrl(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-hairline bg-surface-subtle">
          <Image
            src={url}
            alt="Track cover"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
            unoptimized
          />
          {pending ? (
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <Spinner className="size-6 text-white" />
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={pending}
          className="grid aspect-[16/9] w-full place-items-center rounded-lg border border-dashed border-hairline bg-surface-subtle/40 text-ink-muted transition-colors hover:bg-surface-subtle"
        >
          {pending ? (
            <Spinner className="size-6" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus className="size-5" />
              <span className="text-xs">Upload cover image</span>
              <span className="text-[11px] text-ink-muted">PNG, JPEG, WebP, AVIF · max 5MB</span>
            </div>
          )}
        </button>
      )}

      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={pick} disabled={pending}>
          <ImagePlus className="size-3.5" />
          {url ? "Replace" : "Upload"}
        </Button>
        {url ? (
          <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={pending}>
            <Trash2 className="size-3.5" />
            Remove
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
