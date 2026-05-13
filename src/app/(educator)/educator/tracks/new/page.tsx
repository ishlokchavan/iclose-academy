import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { CreateTrackForm } from "@/features/educator/components/CreateTrackForm";
import { getTaxonomies } from "@/features/educator/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New track" };

export default async function NewTrackPage() {
  const user = await requireUser();
  if (user.role === "learner") redirect("/dashboard");

  const { specialties, levels } = await getTaxonomies();

  return (
    <div className="space-y-8">
      <Link
        href="/educator/tracks"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to tracks
      </Link>

      <PageHeader
        eyebrow="New track"
        title="Create a new track"
        description="Start with the basics. You can flesh out the details, add modules, and upload lessons once the track is created."
      />

      <div className="max-w-2xl rounded-lg border border-hairline bg-surface-raised p-6">
        <CreateTrackForm specialties={specialties} levels={levels} />
      </div>
    </div>
  );
}
