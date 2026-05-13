"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  archiveTrackAction,
  submitForReviewAction,
} from "@/features/educator/server/actions";
import type { TrackStatus } from "@/features/educator/server/queries";

export function LifecycleActions({
  trackId,
  status,
  hasLessons,
}: {
  trackId: string;
  status: TrackStatus;
  hasLessons: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitForReviewAction(trackId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function archive() {
    if (!confirm("Archive this track? Learners will no longer see it.")) return;
    setError(null);
    startTransition(async () => {
      const res = await archiveTrackAction(trackId);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {status === "draft" ? (
        <Button
          variant="primary"
          onClick={submit}
          disabled={pending || !hasLessons}
          title={!hasLessons ? "Add at least one lesson before submitting" : undefined}
        >
          {pending ? <Spinner className="size-4" /> : <Send className="size-4" />}
          Submit for review
        </Button>
      ) : null}
      {status !== "archived" ? (
        <Button variant="secondary" onClick={archive} disabled={pending}>
          <Archive className="size-4" />
          Archive
        </Button>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
