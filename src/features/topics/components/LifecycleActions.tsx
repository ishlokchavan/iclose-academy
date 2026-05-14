"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Eye, EyeOff, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  archiveTopicAction,
  deleteTopicAction,
  publishTopicAction,
  submitTopicForReviewAction,
  unpublishTopicAction,
} from "@/features/topics/server/actions";
import type { TopicStatus } from "@/features/topics/types";

export function LifecycleActions({
  topicId,
  slug,
  status,
  hasVideo,
}: {
  topicId: string;
  slug: string;
  status: TopicStatus;
  hasVideo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {status === "draft" ? (
        <>
          <Button
            variant="primary"
            onClick={() => run(() => publishTopicAction(topicId, slug))}
            disabled={pending || !hasVideo}
            title={!hasVideo ? "Add a YouTube video first" : undefined}
          >
            {pending ? <Spinner className="size-4" /> : <Eye className="size-4" />}
            Publish
          </Button>
          <Button
            variant="secondary"
            onClick={() => run(() => submitTopicForReviewAction(topicId, slug))}
            disabled={pending}
          >
            <Send className="size-4" /> Submit for review
          </Button>
        </>
      ) : null}
      {status === "in_review" ? (
        <Button
          variant="primary"
          onClick={() => run(() => publishTopicAction(topicId, slug))}
          disabled={pending || !hasVideo}
        >
          <Eye className="size-4" /> Publish
        </Button>
      ) : null}
      {status === "published" ? (
        <Button
          variant="secondary"
          onClick={() => run(() => unpublishTopicAction(topicId, slug))}
          disabled={pending}
        >
          <EyeOff className="size-4" /> Unpublish
        </Button>
      ) : null}
      {status !== "archived" ? (
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm("Archive this topic? Learners will lose access.")) {
              run(() => archiveTopicAction(topicId, slug));
            }
          }}
          disabled={pending}
        >
          <Archive className="size-4" /> Archive
        </Button>
      ) : null}
      <Button
        variant="ghost"
        onClick={() => {
          if (confirm("Delete permanently? This can't be undone.")) {
            run(() => deleteTopicAction(topicId, slug));
          }
        }}
        disabled={pending}
        className="text-destructive hover:bg-rose-50"
      >
        <Trash2 className="size-4" /> Delete
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
