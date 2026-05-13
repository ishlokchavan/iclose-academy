import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { TrackCard } from "@/features/tracks/components/TrackCard";
import { getTracks } from "@/features/tracks/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await requireUser();
  const allTracks = await getTracks({ userId: user.id });
  const saved = allTracks.filter((t) => t.saved);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Saved tracks"
        description="Tracks you've bookmarked for later. Tap the bookmark icon on any track to add or remove."
      />

      {saved.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nothing saved yet"
          description="Browse the library and tap the bookmark icon to keep tracks for later."
          action={
            <Link
              href="/tracks"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Browse the library →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {saved.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
      )}
    </div>
  );
}
