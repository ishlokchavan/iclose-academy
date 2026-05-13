"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  approveTrackAction,
  rejectTrackAction,
  unpublishTrackAction,
} from "@/features/staff/server/actions";
import type { TrackStatus } from "@/features/staff/server/queries";

export function ApprovalActions({
  trackId,
  trackSlug,
  status,
  hasLessons,
}: {
  trackId: string;
  trackSlug: string;
  status: TrackStatus;
  hasLessons: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await approveTrackAction(trackId, trackSlug);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function reject() {
    if (!confirm("Send this track back to draft? The educator will need to resubmit.")) return;
    setError(null);
    startTransition(async () => {
      const res = await rejectTrackAction(trackId, trackSlug);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function unpublish() {
    if (!confirm("Unpublish this track? Learners will lose access immediately.")) return;
    setError(null);
    startTransition(async () => {
      const res = await unpublishTrackAction(trackId, trackSlug);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {status === "in_review" ? (
        <>
          <Button
            variant="primary"
            onClick={approve}
            disabled={pending || !hasLessons}
            title={!hasLessons ? "Track has no lessons" : undefined}
          >
            {pending ? <Spinner className="size-4" /> : <Check className="size-4" />}
            Approve &amp; publish
          </Button>
          <Button variant="secondary" onClick={reject} disabled={pending}>
            <X className="size-4" /> Send back to draft
          </Button>
        </>
      ) : null}
      {status === "published" ? (
        <Button variant="secondary" onClick={unpublish} disabled={pending}>
          <RotateCcw className="size-4" /> Unpublish
        </Button>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
