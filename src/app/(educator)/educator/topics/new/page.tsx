import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PageHeader } from "@/components/patterns/PageHeader";
import { TopicForm } from "@/features/topics/components/TopicForm";
import { getTaxonomy } from "@/features/topics/server/queries";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New topic" };

export default async function NewTopicPage() {
  await requireUser();
  const { areas, types, subtypes } = await getTaxonomy();
  return (
    <div className="space-y-8">
      <Link
        href="/educator"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to my topics
      </Link>
      <PageHeader
        eyebrow="New topic"
        title="Create a topic"
        description="Each topic is a single video. Once created, you can attach a cover image and resources."
      />
      <TopicForm mode="create" areas={areas} types={types} subtypes={subtypes} />
    </div>
  );
}
