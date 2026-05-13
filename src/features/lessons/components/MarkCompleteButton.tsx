"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { markLessonCompleteAction } from "../server/actions";

type Props = {
  lessonId: string;
  trackSlug: string;
  completed: boolean;
};

export function MarkCompleteButton({ lessonId, trackSlug, completed: initialCompleted }: Props) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(initialCompleted);

  function handleComplete() {
    if (done) return;
    startTransition(async () => {
      const res = await markLessonCompleteAction(lessonId, trackSlug);
      if (!res.error) setDone(true);
    });
  }

  return (
    <Button
      variant={done ? "secondary" : "primary"}
      onClick={handleComplete}
      disabled={isPending || done}
      className="gap-2"
    >
      {isPending ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <CheckCircle2 className={done ? "h-4 w-4 text-green-500" : "h-4 w-4"} />
      )}
      {done ? "Completed" : "Mark Complete"}
    </Button>
  );
}
