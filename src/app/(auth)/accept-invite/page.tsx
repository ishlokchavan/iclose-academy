import { Suspense } from "react";
import type { Metadata } from "next";
import { AcceptInviteClient } from "./AcceptInviteClient";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = { title: "Accept Invitation — iClose Academy" };

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Spinner className="size-6 text-accent" />
        <p className="text-[15px] text-ink-muted">Loading…</p>
      </div>
    }>
      <AcceptInviteClient />
    </Suspense>
  );
}
