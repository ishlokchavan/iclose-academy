import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { EmptyState } from "@/components/patterns/EmptyState";
import { PageHeader } from "@/components/patterns/PageHeader";
import { TopicCard } from "@/features/topics/components/TopicCard";
import { getSavedTopics } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await requireUser();
  const saved = await getSavedTopics(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Saved topics"
        description="Topics you've bookmarked. Tap the bookmark icon on any topic to add or remove."
      />
      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Browse the library and bookmark topics to keep them handy."
          action={
            <Link
              href="/topics"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Browse the library →
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((t) => (
            <TopicCard key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}
