"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { enrollAction } from "../server/actions";

type Props = {
  trackId: string;
  enrolled?: boolean;
};

export function EnrollButton({ trackId, enrolled }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (enrolled) {
    return (
      <Button variant="secondary" disabled className="min-w-40">
        Enrolled
      </Button>
    );
  }

  function handleEnroll() {
    setError(null);
    startTransition(async () => {
      const result = await enrollAction(trackId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={handleEnroll} disabled={isPending} className="min-w-40">
        {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {isPending ? "Enrolling…" : "Enroll for Free"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
