"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { setInquiryStatusAction } from "@/features/inquiries/server/actions";
import type { InquiryStatus } from "@/features/inquiries/server/queries";

export function InquiryStatusSelect({
  inquiryId,
  initial,
}: {
  inquiryId: string;
  initial: InquiryStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<InquiryStatus>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: InquiryStatus) {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const res = await setInquiryStatusAction(inquiryId, next);
      if (res.error) {
        setStatus(prev);
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1.5">
        <select
          value={status}
          onChange={(e) => change(e.target.value as InquiryStatus)}
          disabled={pending}
          aria-label="Inquiry status"
          className="h-9 rounded-md border border-hairline bg-surface-raised px-2.5 text-sm text-ink focus:outline-none focus:border-accent"
        >
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>
        {pending ? <Spinner className="size-3.5 text-ink-muted" /> : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
